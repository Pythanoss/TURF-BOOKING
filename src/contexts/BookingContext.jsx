import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { formatDateForInput, getToday } from '../utils/dateUtils';

const BookingContext = createContext(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
};

// ─── Status helpers ───────────────────────────────────────────
// DB stores: 'advance_paid', 'fully_paid', 'completed', 'cancelled'
// App displays: 'Advance Paid', 'Fully Paid', 'Completed', 'Cancelled'

const toDisplayStatus = (dbStatus) => ({
  advance_paid: 'Advance Paid',
  fully_paid:   'Fully Paid',
  completed:    'Completed',
  cancelled:    'Cancelled',
}[dbStatus] ?? dbStatus);

const toDbStatus = (displayStatus) => ({
  'Advance Paid': 'advance_paid',
  'Fully Paid':   'fully_paid',
  'Completed':    'completed',
  'Cancelled':    'cancelled',
}[displayStatus] ?? displayStatus);

// Transform a DB booking row (with nested booking_slots) into the app format
const formatBookingFromDb = (b) => ({
  id: b.id,
  // Add 'T00:00:00' so Date constructor treats it as local time, not UTC midnight
  date: new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }),
  fullDate:          b.date,
  time:              (b.booking_slots || []).map(s => s.time_range).join(', '),
  slots:             (b.booking_slots || []).map(s => s.time_range),
  slotCount:         b.slot_count,
  status:            toDisplayStatus(b.status),
  advancePaid:       b.advance_paid,
  totalPrice:        b.total_price,
  balanceDue:        b.balance_due,
  razorpayPaymentId: b.razorpay_payment_id,
  createdAt:         b.created_at,
});

// ─── Provider ────────────────────────────────────────────────

export const BookingProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(formatDateForInput(getToday()));
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Fetch user's bookings from Supabase ──────────────────
  const fetchBookings = useCallback(async (userId) => {
    setBookingsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, booking_slots(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings((data || []).map(formatBookingFromDb));
    } catch (err) {
      console.error('Error fetching bookings:', err);
      showToast('Failed to load bookings', 'error');
    } finally {
      setBookingsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen to Supabase auth state — load bookings when logged in, clear on logout
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchBookings(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchBookings(session.user.id);
      } else {
        setBookings([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchBookings]);

  // ─── Multi-slot selection ─────────────────────────────────
  const toggleSlotSelection = (slot) => {
    if (slot.status !== 'available') return;
    setSelectedSlots(prev => {
      const isSelected = prev.find(s => s.id === slot.id);
      if (isSelected) return prev.filter(s => s.id !== slot.id);
      const updated = [...prev, slot];
      return updated.sort((a, b) => {
        const aH = a.hour === 0 ? 24 : a.hour;
        const bH = b.hour === 0 ? 24 : b.hour;
        return aH - bH;
      });
    });
  };

  const clearSelectedSlots = () => setSelectedSlots([]);
  const getTotalPrice    = () => selectedSlots.reduce((sum, s) => sum + s.price, 0);
  const isSlotSelected   = (slotId) => selectedSlots.some(s => s.id === slotId);

  // ─── Create booking ───────────────────────────────────────
  // bookingData must include:
  //   fullDate, slotCount, totalPrice, advancePaid, balanceDue,
  //   razorpayPaymentId (nullable), slotsData (raw slot objects array)
  const createBooking = async (bookingData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('Not authenticated');

      // 1. Insert booking header row
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id:               userId,
          date:                  bookingData.fullDate,
          slot_count:            bookingData.slotCount || 1,
          total_price:           bookingData.totalPrice,
          advance_paid:          bookingData.advancePaid,
          balance_due:           bookingData.balanceDue,
          status:                'advance_paid',
          razorpay_payment_id:   bookingData.razorpayPaymentId || null,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 2. Insert individual slot rows (one row per 1-hr slot)
      const slotRows = (bookingData.slotsData || []).map(slot => ({
        booking_id: booking.id,
        start_hour: slot.hour,
        end_hour:   slot.hour === 23 ? 0 : slot.hour + 1,
        start_time: slot.startTime,
        end_time:   slot.endTime,
        time_range: slot.time,
        price:      slot.price,
      }));

      if (slotRows.length > 0) {
        const { error: slotsError } = await supabase
          .from('booking_slots')
          .insert(slotRows);
        if (slotsError) throw slotsError;
      }

      // 3. Refresh booking list so it shows the new booking immediately
      await fetchBookings(userId);
      showToast('Booking confirmed!', 'success');
      return { success: true, booking };
    } catch (err) {
      console.error('Create booking error:', err);
      showToast('Failed to create booking. Please try again.', 'error');
      return { success: false, error: err };
    }
  };

  // ─── Update booking status ────────────────────────────────
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: toDbStatus(newStatus) })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
      showToast('Booking updated!', 'success');
    } catch (err) {
      console.error('Update booking error:', err);
      showToast('Failed to update booking', 'error');
    }
  };

  const getUpcomingBookings = () =>
    bookings.filter(b => b.status === 'Advance Paid' || b.status === 'Fully Paid');

  const getPastBookings = () =>
    bookings.filter(b => b.status === 'Completed');

  const value = {
    selectedDate, setSelectedDate,
    selectedSlots, toggleSlotSelection, clearSelectedSlots, getTotalPrice, isSlotSelected,
    bookings, bookingsLoading,
    createBooking, updateBookingStatus,
    getUpcomingBookings, getPastBookings,
    toast, showToast,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
      {toast && (
        <div className={`toast ${
          toast.type === 'success' ? 'toast-success' :
          toast.type === 'error'   ? 'toast-error'   : 'toast-info'
        }`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <p>{toast.message}</p>
        </div>
      )}
    </BookingContext.Provider>
  );
};

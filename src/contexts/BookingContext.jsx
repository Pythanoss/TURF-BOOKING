import { createContext, useContext, useState } from 'react';
import { mockUserBookings, addBooking } from '../data/mockBookings';
import { formatDateForInput, getToday } from '../utils/dateUtils';

const BookingContext = createContext(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(formatDateForInput(getToday()));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookings, setBookings] = useState(mockUserBookings);
  const [toast, setToast] = useState(null);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Create a new booking
  // TODO: Save booking to database
  // Example: await supabase.from('bookings').insert({ user_id, slot_id, amount })
  const createBooking = async (bookingData) => {
    try {
      const newBooking = addBooking(bookingData);
      setBookings([newBooking, ...bookings]);
      showToast('Booking confirmed successfully!', 'success');
      return { success: true, booking: newBooking };
    } catch (error) {
      showToast('Failed to create booking', 'error');
      return { success: false, error };
    }
  };

  // Update booking status
  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: newStatus }
        : booking
    ));
    showToast('Booking updated successfully!', 'success');
  };

  // Get upcoming bookings
  const getUpcomingBookings = () => {
    return bookings.filter(b =>
      b.status === 'Advance Paid' || b.status === 'Fully Paid'
    );
  };

  // Get past bookings
  const getPastBookings = () => {
    return bookings.filter(b => b.status === 'Completed');
  };

  // Clear selected slot
  const clearSelectedSlot = () => {
    setSelectedSlot(null);
  };

  const value = {
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    clearSelectedSlot,
    bookings,
    createBooking,
    updateBookingStatus,
    getUpcomingBookings,
    getPastBookings,
    toast,
    showToast,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
      {/* Toast Notification */}
      {toast && (
        <div className={`toast card ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          <p>{toast.message}</p>
        </div>
      )}
    </BookingContext.Provider>
  );
};

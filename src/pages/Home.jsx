import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Sun, Sunrise, Sunset, Moon, CheckCircle2, ShoppingCart, X, RefreshCw } from 'lucide-react';
import { addDays, format } from 'date-fns';
import BottomNav from '../components/BottomNav';
import InstallPrompt from '../components/InstallPrompt';
import { useBooking } from '../contexts/BookingContext';
import { getSlotGroups } from '../data/mockSlots';
import { formatDate, formatDateForInput, getToday } from '../utils/dateUtils';
import { formatPrice, calculateAdvance } from '../utils/priceUtils';
import { supabase } from '../lib/supabase';

const GROUP_META = {
  Morning:   { Icon: Sunrise, color: 'text-amber-500',  bg: 'bg-amber-50' },
  Afternoon: { Icon: Sun,     color: 'text-yellow-500', bg: 'bg-yellow-50' },
  Evening:   { Icon: Sunset,  color: 'text-orange-500', bg: 'bg-orange-50' },
  Night:     { Icon: Moon,    color: 'text-indigo-500', bg: 'bg-indigo-50' },
};

const Home = () => {
  const navigate = useNavigate();
  const {
    selectedDate, setSelectedDate,
    selectedSlots, toggleSlotSelection, clearSelectedSlots, getTotalPrice, isSlotSelected,
  } = useBooking();

  const [slotGroups, setSlotGroups] = useState(getSlotGroups(selectedDate, []));
  const [slotsLoading, setSlotsLoading] = useState(false);

  const today = getToday();

  // ─── Fetch real slot availability from Supabase ─────────────
  const fetchBookedHours = useCallback(async (date) => {
    setSlotsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_booked_hours', { check_date: date });
      if (error) throw error;
      const bookedHours = (data || []).map(row => row.start_hour);
      setSlotGroups(getSlotGroups(date, bookedHours));
    } catch (err) {
      console.error('Failed to fetch slot availability:', err);
      // Graceful fallback — show all slots as available
      setSlotGroups(getSlotGroups(date, []));
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookedHours(selectedDate);
  }, [selectedDate, fetchBookedHours]);

  // ─── Date selection ──────────────────────────────────────────
  const quickDates = [
    { label: 'Today',    date: today },
    { label: 'Tomorrow', date: addDays(today, 1) },
    { label: format(addDays(today, 2), 'EEE d'), date: addDays(today, 2) },
    { label: format(addDays(today, 3), 'EEE d'), date: addDays(today, 3) },
  ];

  const handleQuickDate = (date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    clearSelectedSlots();
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    clearSelectedSlots();
  };

  const handleProceedToBook = () => {
    navigate('/booking', { state: { slots: selectedSlots } });
  };

  const totalPrice    = getTotalPrice();
  const advanceAmount = calculateAdvance(totalPrice);

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      {/* Header */}
      <header className="header-gradient text-white sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 pt-5 pb-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white text-xs font-semibold tracking-widest uppercase">Welcome</p>
              <h1 className="text-2xl font-extrabold tracking-tight text-white/90">TurfBook</h1>
            </div>
            {/* <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
              <span className="text-6xl">⚽</span>
            </div> */}
          </div>
          <p className="text-white text-sm mt-1">Pick your slots and get on the field</p>
        </div>
      </header>

      {/* Date Selector */}
      <div className="container mx-auto px-4 -mt-3 mb-5">
        <div className="card shadow-md border-0">
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {quickDates.map(({ label, date }) => {
              const formatted = format(date, 'yyyy-MM-dd');
              const isActive  = selectedDate === formatted;
              return (
                <button
                  key={label}
                  onClick={() => handleQuickDate(date)}
                  className={`chip-date flex-shrink-0 ${isActive ? 'chip-date-active' : 'chip-date-inactive'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-emerald-600 flex-shrink-0" />
            <input
              type="date"
              value={selectedDate}
              min={formatDateForInput(today)}
              onChange={handleDateChange}
              className="input-field text-sm"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 pl-6">
            Slots for: <span className="font-semibold text-gray-600">{formatDate(selectedDate)}</span>
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="container mx-auto px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block ring-2 ring-emerald-400 ring-offset-1" /> Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Booked
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => fetchBookedHours(selectedDate)}
          disabled={slotsLoading}
          className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors"
          title="Refresh availability"
        >
          <RefreshCw size={14} className={slotsLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Slot Groups */}
      <div className="container mx-auto px-4 space-y-6 pb-4">
        {slotsLoading ? (
          // Loading skeleton
          <div className="space-y-6">
            {['Morning', 'Afternoon', 'Evening', 'Night'].map(g => (
              <div key={g}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          slotGroups.map((group) => {
            const { Icon, color, bg } = GROUP_META[group.label];
            const availableCount = group.slots.filter(s => s.status === 'available').length;

            return (
              <div key={group.label}>
                {/* Group header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 ${bg} rounded-lg`}>
                    <Icon size={16} className={color} />
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{group.label}</span>
                  <span className="text-gray-400 text-xs">{group.timeRange}</span>
                  <span className="ml-auto text-xs text-gray-400">{availableCount} free</span>
                </div>

                {/* Slot grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {group.slots.map((slot) => {
                    const isSelected  = isSlotSelected(slot.id);
                    const isAvailable = slot.status === 'available';
                    const isBooked    = slot.status === 'booked';

                    return (
                      <button
                        key={slot.id}
                        onClick={() => isAvailable && toggleSlotSelection(slot)}
                        disabled={!isAvailable}
                        className={`slot-card ${
                          isSelected  ? 'slot-selected'  :
                          isBooked    ? 'slot-booked'    :
                          isAvailable ? 'slot-available' : 'slot-closed'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                            {slot.startTime}
                          </span>
                          {isSelected && <CheckCircle2 size={14} className="text-white flex-shrink-0 -mt-0.5" />}
                          {isBooked    && <span className="text-xs text-red-500 font-medium">Full</span>}
                        </div>

                        <p className={`text-xs mb-2 ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>
                          to {slot.endTime}
                        </p>

                        {isAvailable ? (
                          <p className={`text-sm font-extrabold ${isSelected ? 'text-white' : 'text-emerald-600'}`}>
                            {formatPrice(slot.price)}
                          </p>
                        ) : (
                          <p className="text-xs font-medium text-red-400">Booked</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <InstallPrompt />

      {/* Floating selection bar */}
      {selectedSlots.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2">
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #14532d, #166534)' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold">
                {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-white/70 text-xs truncate">
                Pay now: {formatPrice(advanceAmount)} · Total: {formatPrice(totalPrice)}
              </p>
            </div>
            <button
              onClick={clearSelectedSlots}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
            >
              <X size={15} className="text-white" />
            </button>
            <button
              onClick={handleProceedToBook}
              className="flex items-center gap-2 bg-white text-emerald-700 font-bold text-sm px-4 py-2 rounded-full hover:bg-emerald-50 transition-colors flex-shrink-0 shadow-md"
            >
              <ShoppingCart size={15} />
              Book Now
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Home;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import InstallPrompt from '../components/InstallPrompt';
import { useBooking } from '../contexts/BookingContext';
import { generateTimeSlots } from '../data/mockSlots';
import { formatDate, formatDateForInput, getToday } from '../utils/dateUtils';
import { formatPrice, getSlotStatusColor } from '../utils/priceUtils';

const Home = () => {
  const navigate = useNavigate();
  const { selectedDate, setSelectedDate, setSelectedSlot } = useBooking();
  const [slots, setSlots] = useState(generateTimeSlots(selectedDate));

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setSlots(generateTimeSlots(newDate));
  };

  const handleSlotClick = (slot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
      navigate('/booking', { state: { slot } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Turf Booking</h1>
          <p className="text-green-100 text-sm">Book your slot in seconds</p>
        </div>
      </header>

      {/* Date Selector */}
      <div className="container mx-auto px-4 py-4">
        <div className="card">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon size={18} />
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            min={formatDateForInput(getToday())}
            onChange={handleDateChange}
            className="input-field"
          />
          <p className="text-sm text-gray-500 mt-2">
            Showing slots for: <span className="font-semibold">{formatDate(selectedDate)}</span>
          </p>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="container mx-auto px-4 pb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Available Slots</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              disabled={slot.status !== 'available'}
              className={`card border-2 text-left transition-all ${getSlotStatusColor(slot.status)} ${slot.status === 'available'
                  ? 'hover:border-green-500 hover:shadow-lg cursor-pointer'
                  : 'cursor-not-allowed opacity-75'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-lg">{slot.time}</p>
                  <p className="text-sm text-gray-600">1 Hour Duration</p>
                </div>
                <span className={`badge ${slot.status === 'available'
                    ? 'badge-success'
                    : slot.status === 'booked'
                      ? 'badge-danger'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                  {slot.status === 'available' ? 'Available' : slot.status === 'booked' ? 'Booked' : 'Closed'}
                </span>
              </div>

              {slot.status === 'available' && (
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(slot.price)}
                  </span>
                  <span className="text-xs text-gray-500">
                    30% advance
                  </span>
                </div>
              )}

              {slot.status === 'booked' && (
                <p className="text-sm text-red-600 mt-2 font-medium">
                  This slot is already booked
                </p>
              )}

              {slot.status === 'closed' && (
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  Slot not available
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Install Prompt */}
      <InstallPrompt />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Home;

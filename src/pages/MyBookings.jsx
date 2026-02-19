import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle, Ticket, ChevronRight } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useBooking } from '../contexts/BookingContext';
import { formatPrice } from '../utils/priceUtils';

const STATUS_CONFIG = {
  'Advance Paid': { pill: 'bg-amber-100 text-amber-800',  dot: 'bg-amber-400' },
  'Fully Paid':   { pill: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  'Completed':    { pill: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-400' },
  'Cancelled':    { pill: 'bg-red-100 text-red-800',      dot: 'bg-red-400' },
};

const MyBookings = () => {
  const navigate = useNavigate();
  const { bookings, getUpcomingBookings, getPastBookings } = useBooking();
  const [activeTab, setActiveTab] = useState('upcoming');

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'upcoming': return getUpcomingBookings();
      case 'past':     return getPastBookings();
      default:         return bookings;
    }
  };

  const filteredBookings = getFilteredBookings();
  const upcomingCount = getUpcomingBookings().length;
  const pastCount = getPastBookings().length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="header-gradient text-white sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-5">
          <h1 className="text-2xl font-extrabold">My Bookings</h1>
          <p className="text-white/70 text-xs mt-0.5">Manage your turf reservations</p>
        </div>
      </header>

      {/* Tab switcher */}
      <div className="container mx-auto px-4 pt-4 pb-3">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          {[
            { key: 'upcoming', label: 'Upcoming', count: upcomingCount },
            { key: 'past',     label: 'Past',     count: pastCount },
            { key: 'all',      label: 'All',      count: bookings.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                activeTab === tab.key
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings list */}
      <div className="container mx-auto px-4 pb-4">
        {filteredBookings.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Ticket size={28} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Bookings Found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {activeTab === 'upcoming' && 'You have no upcoming bookings.'}
              {activeTab === 'past'     && 'No past bookings yet.'}
              {activeTab === 'all'      && "You haven't made any bookings yet."}
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-gradient text-white px-8 py-3 rounded-2xl font-semibold"
            >
              Book a Slot Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const cfg = STATUS_CONFIG[booking.status] || { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };

              return (
                <div key={booking.id} className="card hover:shadow-md transition-all duration-150">
                  {/* Top row: ID + Status */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-sm font-mono">
                        #{String(booking.id).slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`badge ${cfg.pill} flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {booking.status}
                    </span>
                  </div>

                  {/* Date + Duration */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Calendar size={13} className="text-emerald-500" />
                      {booking.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Clock size={13} className="text-emerald-500" />
                      {booking.slotCount
                        ? `${booking.slotCount} hr${booking.slotCount > 1 ? 's' : ''}`
                        : '1 hr'}
                    </div>
                  </div>

                  {/* Slot time chips */}
                  {booking.slots && booking.slots.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {booking.slots.map((t, i) => (
                        <span
                          key={i}
                          className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-lg font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                      <Clock size={13} className="text-emerald-500" />
                      {booking.time}
                    </div>
                  )}

                  {/* Payment grid */}
                  <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Total</p>
                      <p className="text-sm font-bold text-gray-800">{formatPrice(booking.totalPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Paid</p>
                      <p className="text-sm font-bold text-emerald-600">{formatPrice(booking.advancePaid)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Balance</p>
                      <p className={`text-sm font-bold ${
                        booking.balanceDue > 0 ? 'text-orange-500' : 'text-gray-300'
                      }`}>
                        {booking.balanceDue > 0 ? formatPrice(booking.balanceDue) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Balance reminder */}
                  {booking.balanceDue > 0 && (
                    <div className="flex items-center gap-1.5 mt-2.5 text-xs text-orange-600 font-medium">
                      <AlertCircle size={12} />
                      Pay balance at the venue before your slot
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyBookings;

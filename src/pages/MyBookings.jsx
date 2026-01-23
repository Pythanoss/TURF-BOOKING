import { useState } from 'react';
import { Calendar, Clock, IndianRupee, AlertCircle } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useBooking } from '../contexts/BookingContext';
import { formatPrice, getStatusColor } from '../utils/priceUtils';

const MyBookings = () => {
  const { bookings, getUpcomingBookings, getPastBookings } = useBooking();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'all'

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'upcoming':
        return getUpcomingBookings();
      case 'past':
        return getPastBookings();
      case 'all':
      default:
        return bookings;
    }
  };

  const filteredBookings = getFilteredBookings();

  const handleViewDetails = (bookingId) => {
    alert(`Viewing details for booking #${bookingId}\n\nThis feature will be implemented with backend integration.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-green-100 text-sm">View and manage your bookings</p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${activeTab === 'upcoming'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${activeTab === 'past'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            Past
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${activeTab === 'all'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="container mx-auto px-4 pb-4">
        {filteredBookings.length === 0 ? (
          // Empty State
          <div className="card text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' && "You don't have any upcoming bookings."}
              {activeTab === 'past' && "You don't have any past bookings."}
              {activeTab === 'all' && "You haven't made any bookings yet."}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary"
            >
              Book a Slot Now
            </button>
          </div>
        ) : (
          // Bookings Cards
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="card hover:shadow-lg transition-shadow">
                {/* Header with Status */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Booking #{booking.id}</h3>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`badge ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                {/* Booking Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={18} className="text-gray-500" />
                    <span className="font-medium">{booking.date}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={18} className="text-gray-500" />
                    <span>{booking.time}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee size={16} className="text-green-600" />
                    <span className="text-sm font-semibold text-gray-700">Payment Details</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Total Amount</p>
                      <p className="font-bold text-gray-900">{formatPrice(booking.totalPrice)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Paid</p>
                      <p className="font-bold text-green-600">{formatPrice(booking.advancePaid)}</p>
                    </div>
                    {booking.balanceDue > 0 && (
                      <div className="col-span-2 pt-2 border-t border-gray-200">
                        <p className="text-gray-600">Balance Due</p>
                        <p className="font-bold text-orange-600">{formatPrice(booking.balanceDue)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <AlertCircle size={12} className="inline mr-1" />
                          Pay at venue before slot time
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => handleViewDetails(booking.id)}
                  className="w-full py-2 px-4 border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold rounded-lg transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default MyBookings;

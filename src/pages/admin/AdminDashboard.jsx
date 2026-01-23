import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Users, AlertCircle, CheckCircle } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { mockAdminStats, mockAdminBookings } from '../../data/mockAdmin';
import { formatPrice, getStatusColor } from '../../utils/priceUtils';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState(mockAdminBookings);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Check if admin is logged in
  useState(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleMarkAsPaid = (booking) => {
    setSelectedBooking(booking);
    setShowConfirmModal(true);
  };

  const confirmMarkAsPaid = () => {
    // TODO: Update booking status in database
    // Example: await supabase.from('bookings').update({ status: 'Fully Paid' }).eq('id', bookingId)

    setBookings(bookings.map(b =>
      b.id === selectedBooking.id
        ? { ...b, status: 'Fully Paid', paid: b.amount, balance: 0 }
        : b
    ));

    setShowConfirmModal(false);
    setSelectedBooking(null);

    // Show success toast (in real app, use proper toast system)
    alert('Booking marked as fully paid!');
  };

  const stats = [
    {
      icon: Calendar,
      label: "Today's Bookings",
      value: mockAdminStats.todayBookings,
      color: 'bg-blue-500',
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: formatPrice(mockAdminStats.totalRevenue),
      color: 'bg-green-500',
    },
    {
      icon: AlertCircle,
      label: 'Pending Payments',
      value: formatPrice(mockAdminStats.pendingPayments),
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="admin-content">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-sm">Overview of today's activities</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="card">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${stat.color} rounded-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Today's Bookings Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Today's Bookings</h2>
              <span className="badge badge-info">{bookings.length} bookings</span>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time Slot</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{booking.customerName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">{booking.phone}</p>
                        <p className="text-sm text-gray-500">{booking.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">{booking.time}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{formatPrice(booking.amount)}</p>
                        <p className="text-sm text-green-600">Paid: {formatPrice(booking.paid)}</p>
                        {booking.balance > 0 && (
                          <p className="text-sm text-orange-600">Due: {formatPrice(booking.balance)}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {booking.status === 'Advance Paid' ? (
                          <button
                            onClick={() => handleMarkAsPaid(booking)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                          >
                            Mark as Paid
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle size={18} />
                            <span className="text-sm font-medium">Paid</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">{booking.phone}</p>
                    </div>
                    <span className={`badge ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Time:</span> {booking.time}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Amount:</span> {formatPrice(booking.amount)}
                    </p>
                    <p className="text-sm text-green-600">
                      <span className="font-medium">Paid:</span> {formatPrice(booking.paid)}
                    </p>
                    {booking.balance > 0 && (
                      <p className="text-sm text-orange-600">
                        <span className="font-medium">Due:</span> {formatPrice(booking.balance)}
                      </p>
                    )}
                  </div>

                  {booking.status === 'Advance Paid' && (
                    <button
                      onClick={() => handleMarkAsPaid(booking)}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Mark as Fully Paid
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Payment</h3>
            <p className="text-gray-600 mb-2">
              Are you sure you want to mark this booking as fully paid?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-600">Customer: <span className="font-semibold text-gray-900">{selectedBooking.customerName}</span></p>
              <p className="text-sm text-gray-600">Balance Due: <span className="font-semibold text-orange-600">{formatPrice(selectedBooking.balance)}</span></p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkAsPaid}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, IndianRupee, Users, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { supabase } from '../../lib/supabase';
import { formatPrice, getStatusColor } from '../../utils/priceUtils';

// Display status → DB status mapping
const toDbStatus = (displayStatus) => ({
  'Advance Paid': 'advance_paid',
  'Fully Paid':   'fully_paid',
  'Completed':    'completed',
  'Cancelled':    'cancelled',
}[displayStatus] ?? displayStatus);

// DB status → Display status mapping
const toDisplayStatus = (dbStatus) => ({
  advance_paid: 'Advance Paid',
  fully_paid:   'Fully Paid',
  completed:    'Completed',
  cancelled:    'Cancelled',
}[dbStatus] ?? dbStatus);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [bookings, setBookings]             = useState([]);
  const [stats, setStats]                   = useState(null);
  const [loading, setLoading]               = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBooking, setSelectedBooking]  = useState(null);
  const [updating, setUpdating]             = useState(false);
  const [toast, setToast]                   = useState(null);

  // Admin auth check (localStorage)
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) navigate('/admin/login');
  }, [navigate]);

  // Load data on mount
  useEffect(() => {
    loadDashboard();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        supabase.rpc('get_all_bookings_for_admin'),
        supabase.rpc('get_admin_stats'),
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (statsRes.error)    throw statsRes.error;

      // Transform bookings from DB format
      const formatted = (bookingsRes.data || []).map(b => ({
        id:           b.id,
        customerName: b.customer_name  || 'Unknown',
        email:        b.customer_email || '—',
        phone:        b.customer_phone || '—',
        date:         new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }),
        rawDate:      b.date,
        time:         (b.time_ranges || []).join(', ') || '—',
        slotCount:    b.slot_count,
        status:       toDisplayStatus(b.status),
        amount:       b.total_price,
        paid:         b.advance_paid,
        balance:      b.balance_due,
        createdAt:    b.created_at,
      }));

      setBookings(formatted);

      const s = statsRes.data?.[0] || {};
      setStats({
        todayBookings:   Number(s.today_bookings   ?? 0),
        totalRevenue:    Number(s.total_revenue     ?? 0),
        pendingPayments: Number(s.pending_payments  ?? 0),
        totalCustomers:  Number(s.total_customers   ?? 0),
      });
    } catch (err) {
      console.error('Admin dashboard load error:', err);
      showToast('Failed to load data. Run supabase_admin_functions.sql first.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = (booking) => {
    setSelectedBooking(booking);
    setShowConfirmModal(true);
  };

  const confirmMarkAsPaid = async () => {
    if (!selectedBooking) return;
    setUpdating(true);
    try {
      const { error } = await supabase.rpc('admin_update_booking_status', {
        p_booking_id: selectedBooking.id,
        p_new_status: 'fully_paid',
      });
      if (error) throw error;

      // Optimistically update local state
      setBookings(prev => prev.map(b =>
        b.id === selectedBooking.id
          ? { ...b, status: 'Fully Paid', paid: b.amount, balance: 0 }
          : b
      ));
      if (stats) {
        setStats(prev => ({
          ...prev,
          pendingPayments: prev.pendingPayments - selectedBooking.balance,
        }));
      }

      setShowConfirmModal(false);
      setSelectedBooking(null);
      showToast('Booking marked as fully paid!');
    } catch (err) {
      console.error('Update status error:', err);
      showToast('Failed to update booking', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const statCards = stats ? [
    { icon: Calendar,      label: "Today's Bookings", value: stats.todayBookings,             color: 'bg-blue-500' },
    { icon: IndianRupee,   label: 'Total Revenue',    value: formatPrice(stats.totalRevenue),  color: 'bg-emerald-500' },
    { icon: AlertCircle,   label: 'Pending Payments', value: formatPrice(stats.pendingPayments), color: 'bg-orange-500' },
    { icon: Users,         label: 'Total Customers',  value: stats.totalCustomers,             color: 'bg-purple-500' },
  ] : [];

  const todayBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    return b.rawDate === today;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="admin-content">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 text-sm">Overview of all bookings</p>
            </div>
            <button
              onClick={loadDashboard}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Stats */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card h-24 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {statCards.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="card">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 ${stat.color} rounded-xl`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 leading-tight">{stat.label}</p>
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bookings table */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">All Bookings</h2>
              <span className="badge badge-info">{bookings.length} total</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar size={36} className="mx-auto mb-3 text-gray-300" />
                <p className="font-semibold">No bookings yet</p>
                <p className="text-sm mt-1">Bookings will appear here once customers start booking.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {['Customer', 'Contact', 'Date', 'Time Slots', 'Status', 'Amount', 'Action'].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-gray-900 text-sm">{booking.customerName}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-600">{booking.phone}</p>
                            <p className="text-xs text-gray-400">{booking.email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-700">{booking.date}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-700 max-w-48">{booking.time}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-gray-900 text-sm">{formatPrice(booking.amount)}</p>
                            <p className="text-xs text-emerald-600">Paid: {formatPrice(booking.paid)}</p>
                            {booking.balance > 0 && (
                              <p className="text-xs text-orange-600">Due: {formatPrice(booking.balance)}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {booking.status === 'Advance Paid' ? (
                              <button
                                onClick={() => handleMarkAsPaid(booking)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                Mark Paid
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5 text-emerald-600">
                                <CheckCircle size={16} />
                                <span className="text-xs font-medium">Settled</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-3">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-100 rounded-2xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{booking.customerName}</p>
                          <p className="text-xs text-gray-500">{booking.phone}</p>
                        </div>
                        <span className={`badge ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1 mb-3">
                        <p><span className="font-medium">Date:</span> {booking.date}</p>
                        <p><span className="font-medium">Slots:</span> {booking.time}</p>
                        <p><span className="font-medium">Total:</span> {formatPrice(booking.amount)}
                          <span className="text-emerald-600 ml-2">Paid: {formatPrice(booking.paid)}</span>
                          {booking.balance > 0 && <span className="text-orange-600 ml-2">Due: {formatPrice(booking.balance)}</span>}
                        </p>
                      </div>
                      {booking.status === 'Advance Paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(booking)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                          Mark as Fully Paid
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Full Payment</h3>
            <div className="bg-emerald-50 rounded-xl p-4 mb-5 space-y-1.5">
              <p className="text-sm">
                <span className="text-gray-500">Customer: </span>
                <span className="font-semibold text-gray-900">{selectedBooking.customerName}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Date: </span>
                <span className="font-semibold text-gray-900">{selectedBooking.date}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Balance to collect: </span>
                <span className="font-bold text-orange-600">{formatPrice(selectedBooking.balance)}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirmModal(false); setSelectedBooking(null); }}
                disabled={updating}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkAsPaid}
                disabled={updating}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {updating ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : 'Confirm Paid'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-2xl ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, IndianRupee, Users, AlertCircle, CheckCircle,
  RefreshCw, Pencil, X, RotateCcw, Filter, TrendingUp,
  Clock, Sunrise, Sun, Sunset, Moon,
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { supabase } from '../../lib/supabase';
import { formatPrice, getStatusColor } from '../../utils/priceUtils';
import { getSlotPrices, saveSlotPrices, DEFAULT_PRICES } from '../../utils/slotPrices';
import { formatHour } from '../../data/mockSlots';

// ─── Status helpers ────────────────────────────────────────────
const toDbStatus = (d) => ({
  'Advance Paid': 'advance_paid',
  'Fully Paid':   'fully_paid',
  'Completed':    'completed',
  'Cancelled':    'cancelled',
}[d] ?? d);

const toDisplayStatus = (d) => ({
  advance_paid: 'Advance Paid',
  fully_paid:   'Fully Paid',
  completed:    'Completed',
  cancelled:    'Cancelled',
}[d] ?? d);

const todayStr = () => new Date().toISOString().split('T')[0];

// ─── SLOT GROUPS META ──────────────────────────────────────────
const SLOT_GROUPS = [
  { label: 'Morning',   timeRange: '7 AM – 12 PM', hours: [7, 8, 9, 10, 11],       Icon: Sunrise, color: 'text-amber-500',  bg: 'bg-amber-50'  },
  { label: 'Afternoon', timeRange: '12 PM – 5 PM', hours: [12, 13, 14, 15, 16],    Icon: Sun,     color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { label: 'Evening',   timeRange: '5 PM – 10 PM', hours: [17, 18, 19, 20, 21],    Icon: Sunset,  color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Night',     timeRange: '10 PM – 1 AM', hours: [22, 23, 0],             Icon: Moon,    color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

// ─── DASHBOARD SECTION ─────────────────────────────────────────
const DashboardSection = ({ bookings, stats, loading }) => {
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate,   setEndDate]   = useState(todayStr());

  const filtered = bookings.filter(b => b.rawDate >= startDate && b.rawDate <= endDate);
  const rangeRevenue  = filtered.reduce((s, b) => s + b.paid, 0);
  const rangePending  = filtered.filter(b => b.status === 'Advance Paid').reduce((s, b) => s + b.balance, 0);
  const rangeCustomers = new Set(filtered.map(b => b.email).filter(Boolean)).size;

  const overallCards = stats ? [
    { Icon: Calendar,    label: "Today's Bookings",  value: stats.todayBookings,             color: 'bg-blue-500'   },
    { Icon: IndianRupee, label: 'Total Revenue',     value: formatPrice(stats.totalRevenue),  color: 'bg-green-700'  },
    { Icon: AlertCircle, label: 'Pending Payments',  value: formatPrice(stats.pendingPayments), color: 'bg-orange-500' },
    { Icon: Users,       label: 'Total Customers',   value: stats.totalCustomers,             color: 'bg-purple-500' },
  ] : [];

  const rangeCards = [
    { Icon: Calendar,    label: 'Bookings',           value: filtered.length,           color: 'bg-blue-500'   },
    { Icon: IndianRupee, label: 'Revenue Collected',  value: formatPrice(rangeRevenue),  color: 'bg-green-700'  },
    { Icon: AlertCircle, label: 'Pending',            value: formatPrice(rangePending),  color: 'bg-orange-500' },
    { Icon: Users,       label: 'Customers',          value: rangeCustomers,             color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Lifetime Stats */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-gray-500" />
          <h2 className="text-base font-bold text-gray-700 uppercase tracking-wide text-sm">Lifetime Stats</h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {overallCards.map((c, i) => {
              const Icon = c.Icon;
              return (
                <div key={i} className="card">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 ${c.color} rounded-xl flex-shrink-0`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 leading-tight">{c.label}</p>
                      <p className="text-xl font-bold text-gray-900">{c.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Date Range Stats */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-500" />
          <h2 className="text-base font-bold text-gray-700 uppercase tracking-wide text-sm">Stats by Date Range</h2>
        </div>

        {/* Date pickers */}
        <div className="card mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From</label>
              <input
                type="date"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); if (e.target.value > endDate) setEndDate(e.target.value); }}
                className="input-field text-sm py-1.5 w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)}
                className="input-field text-sm py-1.5 w-auto"
              />
            </div>
            <button
              onClick={() => { setStartDate(todayStr()); setEndDate(todayStr()); }}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                const d = new Date();
                const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
                setStartDate(firstDay);
                setEndDate(todayStr());
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
            >
              This Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rangeCards.map((c, i) => {
            const Icon = c.Icon;
            return (
              <div key={i} className="card">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 ${c.color} rounded-xl flex-shrink-0`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">{c.label}</p>
                    <p className="text-xl font-bold text-gray-900">{c.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && !loading && (
          <p className="text-center text-sm text-gray-400 mt-4 py-4">No bookings in this date range.</p>
        )}
      </div>
    </div>
  );
};

// ─── BOOKINGS SECTION ──────────────────────────────────────────
const BookingsSection = ({ bookings, loading, onMarkPaid }) => {
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const dayBookings = bookings.filter(b => b.rawDate === selectedDate);
  const dayRevenue  = dayBookings.reduce((s, b) => s + b.paid, 0);
  const dayPending  = dayBookings.filter(b => b.status === 'Advance Paid').reduce((s, b) => s + b.balance, 0);

  // Quick date navigation
  const shiftDate = (days) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const displayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="p-6 space-y-5">
      {/* Date filter bar */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors font-bold text-sm"
          >
            ←
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Calendar size={16} className="text-green-700 flex-shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="input-field text-sm py-1.5"
            />
          </div>
          <button
            onClick={() => shiftDate(1)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors font-bold text-sm"
          >
            →
          </button>
          <button
            onClick={() => setSelectedDate(todayStr())}
            className="px-3 py-1.5 text-xs font-semibold bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 pl-1">{displayDate}</p>
      </div>

      {/* Day summary chips */}
      {dayBookings.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold">
            <Calendar size={14} />
            {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">
            <IndianRupee size={14} />
            {formatPrice(dayRevenue)} collected
          </div>
          {dayPending > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-xl text-sm font-semibold">
              <AlertCircle size={14} />
              {formatPrice(dayPending)} pending
            </div>
          )}
        </div>
      )}

      {/* Bookings list */}
      <div className="card">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          Bookings for {selectedDate === todayStr() ? 'Today' : displayDate.split(',').slice(0, 2).join(',')}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : dayBookings.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Calendar size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">No bookings on this day</p>
            <p className="text-sm mt-1 text-gray-400">Try a different date.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Customer', 'Contact', 'Time Slots', 'Status', 'Amount', 'Action'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayBookings.map(b => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900 text-sm">{b.customerName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">{b.phone}</p>
                        <p className="text-xs text-gray-400">{b.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-700 max-w-52">{b.time}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${getStatusColor(b.status)}`}>{b.status}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900 text-sm">{formatPrice(b.amount)}</p>
                        <p className="text-xs text-green-700">Paid: {formatPrice(b.paid)}</p>
                        {b.balance > 0 && <p className="text-xs text-orange-600">Due: {formatPrice(b.balance)}</p>}
                      </td>
                      <td className="py-3 px-4">
                        {b.status === 'Advance Paid' ? (
                          <button
                            onClick={() => onMarkPaid(b)}
                            className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-green-700">
                            <CheckCircle size={15} />
                            <span className="text-xs font-medium">Settled</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {dayBookings.map(b => (
                <div key={b.id} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{b.customerName}</p>
                      <p className="text-xs text-gray-500">{b.phone}</p>
                    </div>
                    <span className={`badge ${getStatusColor(b.status)}`}>{b.status}</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1 mb-3">
                    <p><span className="font-medium">Slots:</span> {b.time}</p>
                    <p>
                      <span className="font-medium">Total:</span> {formatPrice(b.amount)}
                      <span className="text-green-700 ml-2">Paid: {formatPrice(b.paid)}</span>
                      {b.balance > 0 && <span className="text-orange-600 ml-2">Due: {formatPrice(b.balance)}</span>}
                    </p>
                  </div>
                  {b.status === 'Advance Paid' && (
                    <button
                      onClick={() => onMarkPaid(b)}
                      className="w-full py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl transition-colors"
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
  );
};

// ─── SLOTS SECTION ─────────────────────────────────────────────
const SlotsSection = ({ showToast }) => {
  const [prices, setPrices]         = useState(getSlotPrices());
  const [editingHour, setEditingHour] = useState(null);
  const [editValue, setEditValue]   = useState('');

  const startEdit = (hour) => {
    setEditingHour(hour);
    setEditValue(String(prices[hour] ?? 1000));
  };

  const cancelEdit = () => setEditingHour(null);

  const saveEdit = (hour) => {
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val < 0) { showToast('Enter a valid price', 'error'); return; }
    const updated = { ...prices, [hour]: val };
    setPrices(updated);
    saveSlotPrices(updated);
    setEditingHour(null);
    showToast(`Price updated to ${formatPrice(val)}`);
  };

  const handleKeyDown = (e, hour) => {
    if (e.key === 'Enter') saveEdit(hour);
    if (e.key === 'Escape') cancelEdit();
  };

  const resetAll = () => {
    setPrices({ ...DEFAULT_PRICES });
    saveSlotPrices({ ...DEFAULT_PRICES });
    setEditingHour(null);
    showToast('All prices reset to defaults');
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 mt-0.5">
            Click <strong>Edit</strong> on any slot to change its price. Changes apply immediately for all users.
          </p>
        </div>
        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
        >
          <RotateCcw size={14} />
          Reset to Defaults
        </button>
      </div>

      <div className="space-y-4">
        {SLOT_GROUPS.map(({ label, timeRange, hours, Icon, color, bg }) => (
          <div key={label} className="card">
            {/* Group header */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 ${bg} rounded-lg`}>
                <Icon size={16} className={color} />
              </div>
              <span className="font-bold text-gray-800">{label}</span>
              <span className="text-gray-400 text-xs">{timeRange}</span>
            </div>

            {/* Slot rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {hours.map(hour => {
                const endHour  = hour === 23 ? 0 : hour + 1;
                const isEditing = editingHour === hour;

                return (
                  <div
                    key={hour}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 border-2 transition-all ${
                      isEditing ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-700">
                        {formatHour(hour)} – {formatHour(endHour)}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-500">₹</span>
                        <input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => handleKeyDown(e, hour)}
                          className="w-20 border border-green-400 rounded-lg px-2 py-1 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400/30"
                          autoFocus
                          min="0"
                        />
                        <button
                          onClick={() => saveEdit(hour)}
                          className="p-1.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                        >
                          <CheckCircle size={13} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-green-700">
                          {formatPrice(prices[hour] ?? 1000)}
                        </span>
                        <button
                          onClick={() => startEdit(hour)}
                          className="p-1.5 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN ADMIN DASHBOARD ──────────────────────────────────────
const AdminDashboard = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const section   = location.pathname.split('/')[2] || 'dashboard'; // dashboard | bookings | slots

  const [bookings,       setBookings]       = useState([]);
  const [stats,          setStats]          = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [showModal,      setShowModal]      = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updating,       setUpdating]       = useState(false);
  const [toast,          setToast]          = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) navigate('/admin/login');
  }, [navigate]);

  useEffect(() => { loadDashboard(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        supabase.rpc('get_all_bookings_for_admin'),
        supabase.rpc('get_admin_stats'),
      ]);
      if (bookingsRes.error) throw bookingsRes.error;
      if (statsRes.error)    throw statsRes.error;

      const formatted = (bookingsRes.data || []).map(b => ({
        id:           b.id,
        customerName: b.customer_name  || 'Unknown',
        email:        b.customer_email || '',
        phone:        b.customer_phone || '—',
        date:         new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
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
      console.error('Admin load error:', err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMarkPaid = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const confirmMarkPaid = async () => {
    if (!selectedBooking) return;
    setUpdating(true);
    try {
      const { error } = await supabase.rpc('admin_update_booking_status', {
        p_booking_id: selectedBooking.id,
        p_new_status: 'fully_paid',
      });
      if (error) throw error;

      setBookings(prev => prev.map(b =>
        b.id === selectedBooking.id
          ? { ...b, status: 'Fully Paid', paid: b.amount, balance: 0 }
          : b
      ));
      if (stats) {
        setStats(prev => ({
          ...prev,
          pendingPayments: Math.max(0, prev.pendingPayments - selectedBooking.balance),
          totalRevenue:    prev.totalRevenue + selectedBooking.balance,
        }));
      }
      setShowModal(false);
      setSelectedBooking(null);
      showToast('Marked as fully paid!');
    } catch (err) {
      console.error(err);
      showToast('Failed to update booking', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const sectionTitles = {
    dashboard: { title: 'Dashboard',    sub: 'Revenue & booking stats' },
    bookings:  { title: 'Bookings',     sub: 'Day-wise booking management' },
    slots:     { title: 'Slot Pricing', sub: 'Manage time slot prices'   },
  };
  const { title, sub } = sectionTitles[section] || sectionTitles.dashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="admin-content">
        {/* Page header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-500 text-sm">{sub}</p>
            </div>
            <button
              onClick={loadDashboard}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>

        {/* Section content */}
        {section === 'dashboard' && (
          <DashboardSection bookings={bookings} stats={stats} loading={loading} />
        )}
        {section === 'bookings' && (
          <BookingsSection bookings={bookings} loading={loading} onMarkPaid={handleMarkPaid} />
        )}
        {section === 'slots' && (
          <SlotsSection showToast={showToast} />
        )}
      </div>

      {/* Confirm mark-paid modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Full Payment</h3>
            <div className="bg-green-50 rounded-xl p-4 mb-5 space-y-1.5">
              <p className="text-sm">
                <span className="text-gray-500">Customer: </span>
                <span className="font-semibold">{selectedBooking.customerName}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Date: </span>
                <span className="font-semibold">{selectedBooking.date}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Balance to collect: </span>
                <span className="font-bold text-orange-600">{formatPrice(selectedBooking.balance)}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowModal(false); setSelectedBooking(null); }}
                disabled={updating}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkPaid}
                disabled={updating}
                className="flex-1 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {updating
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : 'Confirm Paid'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-2xl ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-700'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

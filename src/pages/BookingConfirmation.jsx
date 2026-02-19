import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Mail, Phone, IndianRupee, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import PaymentModal from '../components/PaymentModal';
import { formatPrice, calculateAdvance, calculateBalance } from '../utils/priceUtils';
import { formatDate } from '../utils/dateUtils';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  const { createBooking, showToast, clearSelectedSlots } = useBooking();

  const [slots, setSlots] = useState([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState('advance'); // 'advance' | 'full'

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }
    const slotsData = location.state?.slots;
    if (!slotsData || slotsData.length === 0) {
      navigate('/', { replace: true });
      return;
    }
    setSlots(slotsData);
  }, [isLoggedIn, location.state, navigate]);

  if (!slots.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const totalPrice = slots.reduce((sum, s) => sum + s.price, 0);
  const advanceAmount = calculateAdvance(totalPrice);
  const balanceAmount = calculateBalance(totalPrice, advanceAmount);
  const slotDate = slots[0]?.date;
  const payAmount = paymentMode === 'full' ? totalPrice : advanceAmount;

  const handleProceedToPayment = () => {
    if (!agreeToTerms) {
      showToast('Please agree to the cancellation policy', 'error');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentId) => {
    const isFullPay = paymentMode === 'full';
    const bookingData = {
      date:              formatDate(slotDate),
      fullDate:          slotDate,
      time:              slots.map(s => s.time).join(', '),
      slots:             slots.map(s => s.time),
      slotsData:         slots,           // raw slot objects — needed for booking_slots DB insert
      slotCount:         slots.length,
      status:            isFullPay ? 'Fully Paid' : 'Advance Paid',
      advancePaid:       payAmount,
      totalPrice,
      balanceDue:        isFullPay ? 0 : balanceAmount,
      customerName:      user.name,
      phone:             user.phone || '',
      email:             user.email,
      razorpayPaymentId: paymentId || null,
    };

    await createBooking(bookingData);
    clearSelectedSlots();
    setShowPaymentModal(false);
    navigate('/my-bookings');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <header className="header-gradient text-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-lg font-bold">Confirm Booking</h1>
            <p className="text-white/70 text-xs">Review and proceed to payment</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-5 max-w-2xl space-y-4">

        {/* Slot Summary */}
        <div className="card">
          <div className="flex items-center gap-2 text-emerald-600 mb-4">
            <Calendar size={18} />
            <h2 className="font-bold text-gray-900">Booking Summary</h2>
          </div>

          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-semibold text-sm text-gray-900">{formatDate(slotDate)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Duration</p>
              <p className="font-semibold text-sm text-gray-900">
                {slots.length} hour{slots.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Individual slot list */}
          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between bg-emerald-50 rounded-xl px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{slot.time}</p>
                    <p className="text-xs text-gray-500">1 Hour</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-600">{formatPrice(slot.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="card">
          <div className="flex items-center gap-2 text-emerald-600 mb-4">
            <IndianRupee size={18} />
            <h2 className="font-bold text-gray-900">Pricing Details</h2>
          </div>

          <div className="space-y-2.5">
            {slots.length > 1 && slots.map((slot) => (
              <div key={slot.id} className="flex justify-between text-sm">
                <span className="text-gray-500">{slot.time}</span>
                <span className="font-medium text-gray-700">{formatPrice(slot.price)}</span>
              </div>
            ))}

            <div className="border-t border-gray-100 pt-2.5">
              <div className="flex justify-between font-semibold text-gray-800">
                <span>Total ({slots.length} slot{slots.length > 1 ? 's' : ''})</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Advance Payment (30%)</span>
              <span className="font-semibold text-emerald-600">{formatPrice(advanceAmount)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Balance Due (at venue)</span>
              <span className="font-semibold text-orange-500">{formatPrice(balanceAmount)}</span>
            </div>

            {/* Payment Mode Toggle */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2 font-medium">Choose payment option:</p>
              <div className="flex rounded-xl overflow-hidden border border-gray-200">
                <button
                  onClick={() => setPaymentMode('advance')}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                    paymentMode === 'advance'
                      ? 'bg-green-800 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Advance 30%
                </button>
                <button
                  onClick={() => setPaymentMode('full')}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                    paymentMode === 'full'
                      ? 'bg-green-800 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Full Payment
                </button>
              </div>
            </div>

            {/* Pay Now Banner */}
            <div className="rounded-2xl overflow-hidden mt-3" style={{ background: 'linear-gradient(135deg, #14532d, #166534)' }}>
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs">
                    {paymentMode === 'full' ? 'Full Payment' : 'Pay Now (Advance 30%)'}
                  </p>
                  <p className="text-white font-extrabold text-2xl">{formatPrice(payAmount)}</p>
                </div>
                {paymentMode === 'advance' && (
                  <div className="text-right">
                    <p className="text-white/70 text-xs">Balance at venue</p>
                    <p className="text-white font-bold">{formatPrice(balanceAmount)}</p>
                  </div>
                )}
                {paymentMode === 'full' && (
                  <div className="text-right">
                    <p className="text-white/70 text-xs">Nothing due</p>
                    <p className="text-white font-bold">at venue</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Your Details */}
        <div className="card">
          <div className="flex items-center gap-2 text-emerald-600 mb-4">
            <User size={18} />
            <h2 className="font-bold text-gray-900">Your Details</h2>
          </div>

          <div className="space-y-3">
            {[
              { Icon: User,  label: 'Name',  value: user.name },
              { Icon: Phone, label: 'Phone', value: user.phone || 'Not set — add in profile' },
              { Icon: Mail,  label: 'Email', value: user.email },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <Icon size={14} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">Cancellation Policy</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Free cancellation up to <strong>2 hours before</strong> your slot.
                Advance payment is non-refundable after that window.
              </p>
            </div>
          </label>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleProceedToPayment}
          disabled={!agreeToTerms}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
            agreeToTerms ? 'btn-gradient text-white shadow-lg active:scale-[0.98]' : 'btn-disabled'
          }`}
        >
          {agreeToTerms
            ? `Proceed to Payment · ${formatPrice(payAmount)}`
            : 'Accept cancellation policy to continue'}
        </button>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={payAmount}
        totalAmount={totalPrice}
        isFullPayment={paymentMode === 'full'}
        userName={user.name}
        userEmail={user.email}
        userPhone={user.phone}
        bookingDescription={`${slots.length} slot${slots.length > 1 ? 's' : ''} · ${formatDate(slotDate)}`}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default BookingConfirmation;

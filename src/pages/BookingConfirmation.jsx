import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Mail, Phone, IndianRupee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import PaymentModal from '../components/PaymentModal';
import { formatPrice, calculateAdvance, calculateBalance } from '../utils/priceUtils';
import { formatDate } from '../utils/dateUtils';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  const { createBooking, showToast } = useBooking();

  const [slot, setSlot] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }

    // Get slot from location state
    const slotData = location.state?.slot;
    if (!slotData) {
      navigate('/', { replace: true });
      return;
    }

    setSlot(slotData);
  }, [isLoggedIn, location.state, navigate]);

  if (!slot) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const advanceAmount = calculateAdvance(slot.price);
  const balanceAmount = calculateBalance(slot.price, advanceAmount);

  const handleProceedToPayment = () => {
    if (!agreeToTerms) {
      showToast('Please agree to the cancellation policy', 'error');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    // Create booking
    const bookingData = {
      date: formatDate(slot.date),
      fullDate: slot.date,
      time: slot.time,
      status: 'Advance Paid',
      advancePaid: advanceAmount,
      totalPrice: slot.price,
      balanceDue: balanceAmount,
      customerName: user.name,
      phone: user.phone,
      email: user.email,
    };

    await createBooking(bookingData);
    setShowPaymentModal(false);
    navigate('/my-bookings');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="hover:bg-green-700 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Confirm Booking</h1>
            <p className="text-green-100 text-sm">Review and proceed to payment</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Slot Details Card */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 text-green-600 mb-3">
            <Calendar size={20} />
            <h2 className="text-lg font-bold text-gray-900">Slot Details</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">{formatDate(slot.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={18} className="text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-semibold text-gray-900">{slot.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={18} className="text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold text-gray-900">1 Hour</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Breakdown Card */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <IndianRupee size={20} />
            <h2 className="text-lg font-bold text-gray-900">Pricing Details</h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Slot Price</span>
              <span className="font-semibold text-gray-900">{formatPrice(slot.price)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Advance Payment (30%)</span>
              <span className="font-semibold text-green-600">{formatPrice(advanceAmount)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Balance (Pay at venue)</span>
              <span className="font-semibold text-gray-900">{formatPrice(balanceAmount)}</span>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Pay Now</span>
                <span className="text-2xl font-bold text-green-600">{formatPrice(advanceAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Your Details Card */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <User size={20} />
            <h2 className="text-lg font-bold text-gray-900">Your Details</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User size={18} className="text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone size={18} className="text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={18} className="text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="card mb-4 bg-yellow-50 border-yellow-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div className="text-sm">
              <p className="font-semibold text-gray-900 mb-1">
                I agree to the cancellation policy
              </p>
              <p className="text-gray-600">
                Cancellation is allowed up to 2 hours before the slot time. Advance payment is non-refundable after that.
              </p>
            </div>
          </label>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleProceedToPayment}
          disabled={!agreeToTerms}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${agreeToTerms
              ? 'btn-primary shadow-lg'
              : 'btn-disabled'
            }`}
        >
          Proceed to Payment
        </button>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={advanceAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default BookingConfirmation;

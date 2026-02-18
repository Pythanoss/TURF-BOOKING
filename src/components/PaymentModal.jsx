import { X, Shield, Zap } from 'lucide-react';
import { formatPrice } from '../utils/priceUtils';

// Razorpay Key ID from environment variable
// Add VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXX to your .env file
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const PaymentModal = ({
  isOpen,
  onClose,
  amount,
  totalAmount,
  userName,
  userEmail,
  userPhone,
  bookingDescription,
  onPaymentSuccess,
}) => {
  if (!isOpen) return null;

  const isRazorpayReady = !!RAZORPAY_KEY && typeof window !== 'undefined' && !!window.Razorpay;

  const handleRazorpayPayment = () => {
    if (!isRazorpayReady) {
      // Razorpay not configured — run in demo/mock mode
      handleMockPayment();
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: amount * 100, // Razorpay expects amount in paise (₹1 = 100 paise)
      currency: 'INR',
      name: 'TurfBook',
      description: bookingDescription || 'Turf Slot Booking — Advance Payment',
      image: '/icons/icon-192x192.png',
      handler: function (response) {
        // Payment successful — response contains razorpay_payment_id
        onPaymentSuccess(response.razorpay_payment_id);
      },
      prefill: {
        name:    userName  || '',
        email:   userEmail || '',
        contact: userPhone || '',
      },
      notes: {
        booking_description: bookingDescription,
      },
      theme: {
        color: '#059669',
      },
      modal: {
        ondismiss: function () {
          // User closed Razorpay modal without paying
          onClose();
        },
        escape: true,
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on('payment.failed', function (response) {
      console.error('Payment failed:', response.error.description);
      onClose();
    });

    razorpay.open();
  };

  const handleMockPayment = async () => {
    // Simulated payment — used when Razorpay key is not yet configured
    // Replace by connecting to real Razorpay once keys are set up
    await new Promise(resolve => setTimeout(resolve, 1500));
    onPaymentSuccess(null); // null = no real payment ID in demo mode
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full relative"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Top handle (mobile UX) */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full"></div>
        </div>

        <div className="px-6 pb-8 pt-3">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">⚽</span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Complete Payment</h2>
            {bookingDescription && (
              <p className="text-sm text-gray-500 mt-1">{bookingDescription}</p>
            )}
          </div>

          {/* Amount banner */}
          <div
            className="rounded-2xl p-5 mb-5 text-center"
            style={{ background: 'linear-gradient(135deg, #064e3b, #059669)' }}
          >
            <p className="text-emerald-200 text-xs mb-1 font-medium">ADVANCE TO PAY NOW (30%)</p>
            <p className="text-white text-4xl font-extrabold">{formatPrice(amount)}</p>
            {totalAmount && totalAmount !== amount && (
              <p className="text-emerald-200 text-xs mt-2">
                Total: {formatPrice(totalAmount)} · Remaining paid at venue
              </p>
            )}
          </div>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-5">
            <Shield size={13} className="text-emerald-500" />
            <span>
              {isRazorpayReady
                ? 'Secured by Razorpay · 256-bit SSL encryption'
                : 'Demo mode — no real payment will be charged'}
            </span>
          </div>

          {/* Pay button */}
          <button
            onClick={handleRazorpayPayment}
            className="w-full btn-gradient text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Zap size={18} />
            {isRazorpayReady
              ? `Pay ${formatPrice(amount)} with Razorpay`
              : `Simulate Payment · ${formatPrice(amount)}`}
          </button>

          {isRazorpayReady ? (
            <p className="text-center text-xs text-gray-400 mt-3">
              UPI · Cards · Net Banking · Wallets
            </p>
          ) : (
            <p className="text-center text-xs text-gray-400 mt-3">
              Add <code className="bg-gray-100 px-1 rounded">VITE_RAZORPAY_KEY_ID</code> to .env to enable real payments
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

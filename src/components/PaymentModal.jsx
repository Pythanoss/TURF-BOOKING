import { useState } from 'react';
import { CreditCard, Smartphone, Building2, X } from 'lucide-react';
import { formatPrice } from '../utils/priceUtils';

const PaymentModal = ({ isOpen, onClose, amount, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('upi');

  if (!isOpen) return null;

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: Smartphone },
    { id: 'card', name: 'Card', icon: CreditCard },
    { id: 'netbanking', name: 'Net Banking', icon: Building2 },
  ];

  const handlePayment = async () => {
    // TODO: Replace with actual Razorpay integration
    // Example: const razorpay = new Razorpay({ key: 'YOUR_KEY', amount: amount * 100 })

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    onPaymentSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
        <p className="text-gray-600 mb-6">Choose your payment method</p>

        {/* Amount */}
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
          <p className="text-3xl font-bold text-green-600">{formatPrice(amount)}</p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3 mb-6">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${selectedMethod === method.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                  }`}
              >
                <div className={`p-2 rounded-full ${selectedMethod === method.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                  <Icon size={20} />
                </div>
                <span className="font-medium">{method.name}</span>
                <div className="ml-auto">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id
                      ? 'border-green-500'
                      : 'border-gray-300'
                    }`}>
                    {selectedMethod === method.id && (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              `Pay ${formatPrice(amount)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

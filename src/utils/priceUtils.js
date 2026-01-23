// Format price in Indian Rupees
export const formatPrice = (amount) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Calculate advance payment (30%)
export const calculateAdvance = (totalAmount) => {
  return Math.round(totalAmount * 0.3);
};

// Calculate balance payment
export const calculateBalance = (totalAmount, advancePaid) => {
  return totalAmount - advancePaid;
};

// Get payment status badge color
export const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'advance paid':
      return 'badge-warning';
    case 'fully paid':
      return 'badge-success';
    case 'completed':
      return 'badge-info';
    case 'cancelled':
      return 'badge-danger';
    default:
      return 'badge-info';
  }
};

// Get slot status color
export const getSlotStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'available':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'booked':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

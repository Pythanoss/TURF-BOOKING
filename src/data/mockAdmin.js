// Mock admin data for dashboard
// TODO: Fetch admin data from database
// Example: const { data } = await supabase.from('admin_stats').select('*')

export const mockAdminStats = {
  todayBookings: 12,
  totalRevenue: 24000,
  pendingPayments: 8400,
  totalCustomers: 156,
};

export const mockAdminBookings = [
  {
    id: 1,
    customerName: "Rahul Sharma",
    email: "rahul@example.com",
    phone: "+91 98765 43210",
    date: "Today, Jan 24",
    time: "6:00 AM - 7:00 AM",
    status: "Advance Paid",
    amount: 1000,
    paid: 300,
    balance: 700,
    createdAt: "2026-01-24T05:30:00",
  },
  {
    id: 2,
    customerName: "Priya Singh",
    email: "priya@example.com",
    phone: "+91 98765 43211",
    date: "Today, Jan 24",
    time: "7:00 PM - 8:00 PM",
    status: "Fully Paid",
    amount: 1200,
    paid: 1200,
    balance: 0,
    createdAt: "2026-01-23T16:45:00",
  },
  {
    id: 3,
    customerName: "Amit Patel",
    email: "amit@example.com",
    phone: "+91 98765 43212",
    date: "Today, Jan 24",
    time: "8:00 PM - 9:00 PM",
    status: "Advance Paid",
    amount: 1200,
    paid: 360,
    balance: 840,
    createdAt: "2026-01-24T12:20:00",
  },
  {
    id: 4,
    customerName: "Sneha Reddy",
    email: "sneha@example.com",
    phone: "+91 98765 43213",
    date: "Today, Jan 24",
    time: "5:00 PM - 6:00 PM",
    status: "Fully Paid",
    amount: 1200,
    paid: 1200,
    balance: 0,
    createdAt: "2026-01-23T10:00:00",
  },
];

// Update booking status (mock)
export const updateBookingStatus = (bookingId, newStatus) => {
  // TODO: Update booking status in database
  // Example: await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)

  console.log(`Booking ${bookingId} status updated to ${newStatus}`);
  return { success: true, message: "Booking updated successfully" };
};

// Mock admin credentials
export const mockAdminCredentials = {
  email: "admin@turf.com",
  password: "admin123",
};

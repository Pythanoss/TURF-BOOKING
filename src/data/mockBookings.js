// Mock bookings data for user
// TODO: Fetch user bookings from database
// Example: const { data } = await supabase.from('bookings').select('*').eq('user_id', userId)

export const mockUserBookings = [
  {
    id: 1,
    date: "Tomorrow, Jan 25",
    fullDate: "2026-01-25",
    time: "6:00 AM - 7:00 AM",
    status: "Advance Paid",
    advancePaid: 300,
    totalPrice: 1000,
    balanceDue: 700,
    customerName: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul@example.com",
    createdAt: "2026-01-24T10:30:00",
  },
  {
    id: 2,
    date: "Today, Jan 24",
    fullDate: "2026-01-24",
    time: "7:00 PM - 8:00 PM",
    status: "Fully Paid",
    advancePaid: 1200,
    totalPrice: 1200,
    balanceDue: 0,
    customerName: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul@example.com",
    createdAt: "2026-01-23T14:20:00",
  },
  {
    id: 3,
    date: "Jan 20, 2026",
    fullDate: "2026-01-20",
    time: "5:00 PM - 6:00 PM",
    status: "Completed",
    advancePaid: 1200,
    totalPrice: 1200,
    balanceDue: 0,
    customerName: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul@example.com",
    createdAt: "2026-01-19T09:15:00",
  },
];

// Filter bookings by status
export const getUpcomingBookings = (bookings) => {
  return bookings.filter(b =>
    b.status === "Advance Paid" || b.status === "Fully Paid"
  );
};

export const getPastBookings = (bookings) => {
  return bookings.filter(b => b.status === "Completed");
};

// Add a new booking (mock)
export const addBooking = (bookingData) => {
  // TODO: Save booking to database
  // Example: await supabase.from('bookings').insert({ user_id, slot_id, amount, status: 'Advance Paid' })

  const newBooking = {
    id: Date.now(),
    ...bookingData,
    createdAt: new Date().toISOString(),
  };

  return newBooking;
};

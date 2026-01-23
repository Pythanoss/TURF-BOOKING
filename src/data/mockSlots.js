// Mock time slots data for turf booking
// TODO: Replace with API call to fetch slots from backend
// Example: const response = await fetch('/api/slots?date=' + selectedDate)

export const generateTimeSlots = (date) => {
  const slots = [];

  // Generate slots from 6 AM to 11 PM
  for (let hour = 6; hour < 23; hour++) {
    const startTime = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
    const endHour = hour + 1;
    const endTime = `${endHour > 12 ? endHour - 12 : endHour}:00 ${endHour >= 12 ? 'PM' : 'AM'}`;

    // Determine price based on time (peak hours are more expensive)
    let price = 800;
    if (hour >= 10 && hour < 17) {
      price = 1000; // Mid-day pricing
    } else if (hour >= 17 && hour < 22) {
      price = 1200; // Peak evening pricing
    }

    // Mock different statuses for demonstration
    let status = 'available';
    if (hour === 7 || hour === 19) {
      status = 'booked'; // Mock some booked slots
    } else if (hour === 9) {
      status = 'closed'; // Mock a closed slot
    }

    slots.push({
      id: `slot-${hour}`,
      startTime,
      endTime,
      time: `${startTime} - ${endTime}`,
      price,
      status, // 'available', 'booked', 'closed'
      date: date,
    });
  }

  return slots;
};

// Get available slots only
export const getAvailableSlots = (date) => {
  return generateTimeSlots(date).filter(slot => slot.status === 'available');
};

// Check if a slot is available
export const isSlotAvailable = (slotId, date) => {
  const slots = generateTimeSlots(date);
  const slot = slots.find(s => s.id === slotId);
  return slot && slot.status === 'available';
};

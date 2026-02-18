// Time slots from 7 AM to 1 AM (18 slots, 1 hour each).
// Slot status is now driven by the `bookedHours` array fetched from Supabase
// via the `get_booked_hours(check_date)` RPC function.
// The `generateTimeSlots` / `getSlotGroups` functions are pure (no DB calls here).

const SLOT_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0];

const formatHour = (hour) => {
  if (hour === 0)  return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12)   return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
};

const getSlotPrice = (hour) => {
  if (hour >= 7  && hour < 10) return 800;   // Morning
  if (hour >= 10 && hour < 17) return 1000;  // Afternoon
  if (hour >= 17 && hour < 22) return 1200;  // Peak evening
  return 1000;                               // Late night (10 PM – 1 AM)
};

/**
 * Generate all 18 time slots for a given date.
 * @param {string} date      - 'YYYY-MM-DD'
 * @param {number[]} bookedHours - array of start hours that are already booked
 *                                 (returned by Supabase RPC get_booked_hours)
 */
export const generateTimeSlots = (date, bookedHours = []) => {
  return SLOT_HOURS.map((hour) => {
    const endHour   = hour === 23 ? 0 : hour + 1;
    const startTime = formatHour(hour);
    const endTime   = formatHour(endHour);
    const status    = bookedHours.includes(hour) ? 'booked' : 'available';

    return {
      id: `slot-${hour}`,
      hour,
      startTime,
      endTime,
      time: `${startTime} - ${endTime}`,
      price: getSlotPrice(hour),
      status,
      date,
    };
  });
};

export const getAvailableSlots = (date, bookedHours = []) =>
  generateTimeSlots(date, bookedHours).filter(s => s.status === 'available');

export const isSlotAvailable = (slotId, date, bookedHours = []) => {
  const slot = generateTimeSlots(date, bookedHours).find(s => s.id === slotId);
  return slot?.status === 'available';
};

/**
 * Group slots by time-of-day for the Home page display.
 * @param {string} date
 * @param {number[]} bookedHours
 */
export const getSlotGroups = (date, bookedHours = []) => {
  const slots = generateTimeSlots(date, bookedHours);
  return [
    { label: 'Morning',   timeRange: '7 AM – 12 PM', slots: slots.filter(s => s.hour >= 7  && s.hour < 12) },
    { label: 'Afternoon', timeRange: '12 PM – 5 PM', slots: slots.filter(s => s.hour >= 12 && s.hour < 17) },
    { label: 'Evening',   timeRange: '5 PM – 10 PM', slots: slots.filter(s => s.hour >= 17 && s.hour < 22) },
    { label: 'Night',     timeRange: '10 PM – 1 AM', slots: slots.filter(s => s.hour >= 22 || s.hour === 0) },
  ];
};

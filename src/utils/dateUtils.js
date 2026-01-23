import { format, addDays, isToday, isTomorrow, parseISO } from 'date-fns';

// Format date for display
export const formatDate = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, 'MMM dd')}`;
  } else if (isTomorrow(dateObj)) {
    return `Tomorrow, ${format(dateObj, 'MMM dd')}`;
  } else {
    return format(dateObj, 'MMM dd, yyyy');
  }
};

// Format date for input field (YYYY-MM-DD)
export const formatDateForInput = (date) => {
  return format(date, 'yyyy-MM-dd');
};

// Get today's date
export const getToday = () => {
  return new Date();
};

// Get tomorrow's date
export const getTomorrow = () => {
  return addDays(new Date(), 1);
};

// Get date object from string
export const parseDate = (dateString) => {
  return parseISO(dateString);
};

// Get display name for date
export const getDateDisplayName = (dateString) => {
  const date = parseDate(dateString);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, MMM dd');
};

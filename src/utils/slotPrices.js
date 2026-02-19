// Persistent slot price storage via localStorage.
// Admin edits prices here; user-facing slot generation reads from here.

const STORAGE_KEY = 'turf_slot_prices';

export const DEFAULT_PRICES = {
  7: 800, 8: 800, 9: 800,
  10: 1000, 11: 1000, 12: 1000, 13: 1000, 14: 1000, 15: 1000, 16: 1000,
  17: 1200, 18: 1200, 19: 1200, 20: 1200, 21: 1200,
  22: 1000, 23: 1000, 0: 1000,
};

export const getSlotPrices = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_PRICES, ...JSON.parse(stored) } : { ...DEFAULT_PRICES };
  } catch {
    return { ...DEFAULT_PRICES };
  }
};

export const saveSlotPrices = (prices) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prices));
};

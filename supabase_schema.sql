-- ============================================================
-- TurfBook — Supabase Database Schema
-- Run these commands in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── 1. PROFILES ─────────────────────────────────────────────
-- Extends Supabase auth.users with display info.
-- Auto-populated via trigger on new user signup.

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile row when a new user signs up via Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── 2. BOOKINGS ─────────────────────────────────────────────
-- One row per booking session (may contain multiple 1-hour slots).

CREATE TABLE IF NOT EXISTS public.bookings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date                  DATE NOT NULL,
  slot_count            INTEGER NOT NULL DEFAULT 1,     -- number of 1-hr slots booked
  total_price           INTEGER NOT NULL,               -- total in rupees
  advance_paid          INTEGER NOT NULL,               -- 30% advance (in rupees)
  balance_due           INTEGER NOT NULL DEFAULT 0,     -- remaining 70% (in rupees)
  status                TEXT NOT NULL DEFAULT 'advance_paid'
                          CHECK (status IN ('advance_paid', 'fully_paid', 'completed', 'cancelled')),
  razorpay_payment_id   TEXT,                          -- from Razorpay on success
  razorpay_order_id     TEXT,                          -- if order creation is implemented
  razorpay_signature    TEXT,                          -- for server-side verification
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin policy: service_role key bypasses RLS automatically.
-- For a custom admin role, add: (auth.jwt() ->> 'role' = 'admin')


-- ─── 3. BOOKING SLOTS ────────────────────────────────────────
-- One row per 1-hour slot within a booking.
-- Allows checking availability by querying start_hour + date.

CREATE TABLE IF NOT EXISTS public.booking_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  start_hour  INTEGER NOT NULL,   -- 0–23 (24-hr). 0 = midnight (12 AM).
  end_hour    INTEGER NOT NULL,   -- start_hour + 1 (wraps: 23 → 0)
  start_time  TEXT NOT NULL,      -- display string e.g. "7:00 AM"
  end_time    TEXT NOT NULL,      -- display string e.g. "8:00 AM"
  time_range  TEXT NOT NULL,      -- e.g. "7:00 AM - 8:00 AM"
  price       INTEGER NOT NULL,   -- slot price in rupees
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view slots for their bookings"
  ON public.booking_slots FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert slots for their bookings"
  ON public.booking_slots FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
  );


-- ─── 4. PAYMENTS ─────────────────────────────────────────────
-- Payment audit trail — one row per payment attempt.

CREATE TABLE IF NOT EXISTS public.payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_payment_id   TEXT UNIQUE,          -- Razorpay payment ID (rzp_*)
  razorpay_order_id     TEXT,
  razorpay_signature    TEXT,
  amount                INTEGER NOT NULL,      -- amount in rupees
  currency              TEXT DEFAULT 'INR',
  status                TEXT NOT NULL DEFAULT 'created'
                          CHECK (status IN ('created', 'authorized', 'captured', 'refunded', 'failed')),
  method                TEXT,                  -- 'upi', 'card', 'netbanking', 'wallet'
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert payment records"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ─── 5. AUTO-UPDATE updated_at TRIGGER ───────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─── 6. HELPER FUNCTIONS ─────────────────────────────────────

-- Returns true if a specific hour slot is free on a given date
CREATE OR REPLACE FUNCTION public.is_slot_available(
  check_date DATE,
  check_hour INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM public.booking_slots bs
    JOIN public.bookings b ON b.id = bs.booking_id
    WHERE b.date = check_date
      AND bs.start_hour = check_hour
      AND b.status NOT IN ('cancelled')
  );
END;
$$ LANGUAGE plpgsql;

-- Returns all booked start_hours for a given date (for slot availability check)
CREATE OR REPLACE FUNCTION public.get_booked_hours(check_date DATE)
RETURNS TABLE (start_hour INTEGER) AS $$
BEGIN
  RETURN QUERY
    SELECT DISTINCT bs.start_hour
    FROM public.booking_slots bs
    JOIN public.bookings b ON b.id = bs.booking_id
    WHERE b.date = check_date
      AND b.status NOT IN ('cancelled');
END;
$$ LANGUAGE plpgsql;


-- ─── 7. USEFUL INDEXES ───────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_bookings_user_id   ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date       ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status     ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_slots_booking_id ON public.booking_slots(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_slots_date_hour  ON public.booking_slots(start_hour);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);


-- ─── DONE ────────────────────────────────────────────────────
-- After running this schema:
-- 1. Enable Google OAuth in Supabase Dashboard → Auth → Providers → Google
-- 2. Add Google Client ID + Secret from Google Cloud Console
-- 3. Set redirect URL: https://<your-project>.supabase.co/auth/v1/callback
-- 4. In your app: uncomment Supabase calls in AuthContext.jsx and BookingContext.jsx
-- 5. Remove mock data imports and replace with real Supabase queries

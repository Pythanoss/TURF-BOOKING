-- ============================================================
-- TurfBook — Admin Access Functions
-- Run these in Supabase Dashboard → SQL Editor → New Query
-- These use SECURITY DEFINER to bypass RLS for admin reads.
-- ============================================================

-- ─── 1. GET ALL BOOKINGS (for admin dashboard) ────────────────
-- Returns all bookings with customer info and aggregated slot times.
-- Uses SECURITY DEFINER so it runs as the DB owner, bypassing RLS.
-- Called via: supabase.rpc('get_all_bookings_for_admin')

CREATE OR REPLACE FUNCTION public.get_all_bookings_for_admin()
RETURNS TABLE (
  id                    UUID,
  user_id               UUID,
  date                  DATE,
  slot_count            INTEGER,
  total_price           INTEGER,
  advance_paid          INTEGER,
  balance_due           INTEGER,
  status                TEXT,
  razorpay_payment_id   TEXT,
  created_at            TIMESTAMPTZ,
  customer_name         TEXT,
  customer_email        TEXT,
  customer_phone        TEXT,
  time_ranges           TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.user_id,
    b.date,
    b.slot_count,
    b.total_price,
    b.advance_paid,
    b.balance_due,
    b.status,
    b.razorpay_payment_id,
    b.created_at,
    p.name          AS customer_name,
    p.email         AS customer_email,
    p.phone         AS customer_phone,
    ARRAY_AGG(bs.time_range ORDER BY bs.start_hour) AS time_ranges
  FROM public.bookings b
  LEFT JOIN public.profiles p      ON p.id        = b.user_id
  LEFT JOIN public.booking_slots bs ON bs.booking_id = b.id
  GROUP BY
    b.id, b.user_id, b.date, b.slot_count, b.total_price, b.advance_paid,
    b.balance_due, b.status, b.razorpay_payment_id, b.created_at,
    p.name, p.email, p.phone
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── 2. UPDATE BOOKING STATUS (admin action) ──────────────────
-- Allows admin to mark a booking as fully_paid.
-- Called via: supabase.rpc('admin_update_booking_status', { p_booking_id, p_new_status })

CREATE OR REPLACE FUNCTION public.admin_update_booking_status(
  p_booking_id UUID,
  p_new_status TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate allowed status values
  IF p_new_status NOT IN ('advance_paid', 'fully_paid', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %', p_new_status;
  END IF;

  UPDATE public.bookings
  SET    status     = p_new_status,
         balance_due = CASE WHEN p_new_status = 'fully_paid' THEN 0 ELSE balance_due END,
         updated_at = NOW()
  WHERE  id = p_booking_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── 3. GET ADMIN STATS ───────────────────────────────────────
-- Returns today's booking count, total advance revenue, and pending balances.
-- Called via: supabase.rpc('get_admin_stats')

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  today_bookings    BIGINT,
  total_revenue     BIGINT,
  pending_payments  BIGINT,
  total_customers   BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE date = CURRENT_DATE)                          AS today_bookings,
    COALESCE(SUM(advance_paid), 0)                                       AS total_revenue,
    COALESCE(SUM(balance_due) FILTER (WHERE status = 'advance_paid'), 0) AS pending_payments,
    COUNT(DISTINCT user_id)                                              AS total_customers
  FROM public.bookings
  WHERE status != 'cancelled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── DONE ────────────────────────────────────────────────────
-- After running this file, the admin dashboard will automatically
-- use these functions for real data instead of mock data.

/*
# Create availability, pricing_rules, promo_codes tables

1. New Tables
  - `availability` - tracks blocked dates per property
  - `pricing_rules` - dynamic pricing rules per property
  - `promo_codes` - discount codes

2. Security
  - RLS enabled on all tables
  - Availability and pricing_rules: public read, host write
  - Promo codes: public read (for validation), admin/host create
*/

-- Availability
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_blocked boolean NOT NULL DEFAULT true,
  UNIQUE(property_id, date)
);

CREATE INDEX IF NOT EXISTS idx_availability_property_date ON availability(property_id, date);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_availability" ON availability;
CREATE POLICY "select_availability" ON availability FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_availability" ON availability;
CREATE POLICY "insert_availability" ON availability FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM properties WHERE properties.id = property_id AND properties.host_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_availability" ON availability;
CREATE POLICY "update_availability" ON availability FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_id AND properties.host_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_id AND properties.host_id = auth.uid()));

DROP POLICY IF EXISTS "delete_availability" ON availability;
CREATE POLICY "delete_availability" ON availability FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE properties.id = property_id AND properties.host_id = auth.uid())
  );

-- Pricing Rules
CREATE TABLE IF NOT EXISTS pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  rule_type text NOT NULL CHECK (rule_type IN ('weekend_surcharge', 'seasonal', 'long_stay_discount', 'last_minute_discount')),
  value numeric NOT NULL,
  start_date date,
  end_date date,
  min_nights int,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pricing_rules_property ON pricing_rules(property_id);

ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_pricing_rules" ON pricing_rules;
CREATE POLICY "select_pricing_rules" ON pricing_rules FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_pricing_rules" ON pricing_rules;
CREATE POLICY "insert_pricing_rules" ON pricing_rules FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM properties WHERE properties.id = property_id AND properties.host_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_pricing_rules" ON pricing_rules;
CREATE POLICY "update_pricing_rules" ON pricing_rules FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_id AND properties.host_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_id AND properties.host_id = auth.uid()));

DROP POLICY IF EXISTS "delete_pricing_rules" ON pricing_rules;
CREATE POLICY "delete_pricing_rules" ON pricing_rules FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM properties WHERE properties.id = property_id AND properties.host_id = auth.uid())
  );

-- Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  max_uses int,
  used_count int NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_by uuid REFERENCES profiles(id),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_promo_codes" ON promo_codes;
CREATE POLICY "select_promo_codes" ON promo_codes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_promo_codes" ON promo_codes;
CREATE POLICY "insert_promo_codes" ON promo_codes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "update_promo_codes" ON promo_codes;
CREATE POLICY "update_promo_codes" ON promo_codes FOR UPDATE
  TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "delete_promo_codes" ON promo_codes;
CREATE POLICY "delete_promo_codes" ON promo_codes FOR DELETE
  TO authenticated USING (auth.uid() = created_by);

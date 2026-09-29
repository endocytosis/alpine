/*
# Create properties table

1. New Tables
  - `properties`
    - `id` (uuid, PK)
    - `host_id` (uuid, FK to profiles)
    - `title` (text)
    - `description` (text)
    - `city` (text)
    - `state` (text)
    - `country` (text)
    - `property_type` (text: resort, villa, cabin, hotel, apartment, cottage)
    - `amenities` (text[])
    - `images` (text[])
    - `base_price` (numeric)
    - `max_guests` (int)
    - `bedrooms` (int)
    - `bathrooms` (int)
    - `cancellation_policy` (text: flexible, moderate, strict)
    - `booking_mode` (text: instant, request)
    - `status` (text: active, pending, inactive)
    - `created_at`, `updated_at`

2. Security
  - RLS enabled
  - Anyone authenticated can read active properties
  - Hosts can CRUD their own properties
*/

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  city text NOT NULL,
  state text,
  country text NOT NULL DEFAULT 'United States',
  property_type text NOT NULL DEFAULT 'resort' CHECK (property_type IN ('resort', 'villa', 'cabin', 'hotel', 'apartment', 'cottage')),
  amenities text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  base_price numeric NOT NULL DEFAULT 0 CHECK (base_price >= 0),
  max_guests int NOT NULL DEFAULT 2,
  bedrooms int NOT NULL DEFAULT 1,
  bathrooms int NOT NULL DEFAULT 1,
  cancellation_policy text NOT NULL DEFAULT 'flexible' CHECK (cancellation_policy IN ('flexible', 'moderate', 'strict')),
  booking_mode text NOT NULL DEFAULT 'instant' CHECK (booking_mode IN ('instant', 'request')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_properties_host ON properties(host_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(base_price);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Everyone can read active properties (even anon for public browsing)
DROP POLICY IF EXISTS "select_active_properties" ON properties;
CREATE POLICY "select_active_properties" ON properties FOR SELECT
  TO anon, authenticated USING (status = 'active' OR host_id = auth.uid());

DROP POLICY IF EXISTS "insert_own_properties" ON properties;
CREATE POLICY "insert_own_properties" ON properties FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "update_own_properties" ON properties;
CREATE POLICY "update_own_properties" ON properties FOR UPDATE
  TO authenticated USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "delete_own_properties" ON properties;
CREATE POLICY "delete_own_properties" ON properties FOR DELETE
  TO authenticated USING (auth.uid() = host_id);

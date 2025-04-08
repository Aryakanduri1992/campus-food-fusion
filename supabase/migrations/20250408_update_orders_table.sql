
-- Add columns for delivery information to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_partner TEXT,
ADD COLUMN IF NOT EXISTS delivery_phone TEXT,
ADD COLUMN IF NOT EXISTS delivery_email TEXT,
ADD COLUMN IF NOT EXISTS estimated_time TEXT,
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_city TEXT,
ADD COLUMN IF NOT EXISTS delivery_pincode TEXT,
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;

-- Add status column to delivery_partners_emails if it doesn't exist
ALTER TABLE public.delivery_partners_emails
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available';

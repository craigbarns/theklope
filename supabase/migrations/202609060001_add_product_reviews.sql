-- Migration: Add product reviews and review stats
-- Purpose: Create tables, views, and RLS policies for the review system

-- 1. Create table for product reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  product_id text NOT NULL,
  customer_email text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  author_name text NOT NULL,
  title text,
  comment text NOT NULL,
  verified_purchase boolean DEFAULT true,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  
  -- Prevent multiple reviews for the same product in a single order
  CONSTRAINT unique_review_per_order_product UNIQUE (order_id, product_id)
);

-- Enable RLS on the table
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS product_reviews_product_id_idx ON public.product_reviews (product_id);
CREATE INDEX IF NOT EXISTS product_reviews_status_idx ON public.product_reviews (status);

-- 2. Create view for review stats
-- This view aggregates published reviews for each product
DROP VIEW IF EXISTS public.product_review_stats CASCADE;

CREATE VIEW public.product_review_stats AS
SELECT 
  product_id,
  count(*) as review_count,
  round(avg(rating)::numeric, 1) as average_rating
FROM public.product_reviews
WHERE status = 'published'
GROUP BY product_id;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Allow service_role full access to product_reviews" ON public.product_reviews;
CREATE POLICY "Allow service_role full access to product_reviews"
  ON public.product_reviews
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated admins to read and update reviews via the client
DROP POLICY IF EXISTS "Authenticated admins can manage product reviews" ON public.product_reviews;
CREATE POLICY "Authenticated admins can manage product reviews"
  ON public.product_reviews
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

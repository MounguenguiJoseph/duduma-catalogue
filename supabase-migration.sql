-- ============================================================
-- Migration Duduma Catalogue — à exécuter dans Supabase SQL Editor
-- ============================================================

-- 1. Colonnes supplémentaires sur products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- 2. Table variantes produits
CREATE TABLE IF NOT EXISTS public.product_variants (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID         NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size         VARCHAR(20),
  color        VARCHAR(50),
  color_hex    VARCHAR(7)   NOT NULL DEFAULT '#000000',
  price_adjustment INTEGER  NOT NULL DEFAULT 0,
  stock        INTEGER      NOT NULL DEFAULT 0,
  sku          VARCHAR(100) UNIQUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku        ON public.product_variants(sku);

-- 3. Row Level Security — lecture publique uniquement
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (is_active = true);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read variants" ON public.product_variants;
CREATE POLICY "Public read variants" ON public.product_variants
  FOR SELECT USING (true);

-- 4. Activer tous les produits existants
UPDATE public.products SET is_active = true WHERE is_active IS NULL;

-- Option A: Evolve existing categories in place. Keeps all existing rows and IDs.
-- listings.category_id is unchanged; existing data is preserved.
-- Run this on your existing DB. If parent_id already exists (e.g. from Hibernate), skip or comment out step 1.

-- Step 1: Add parent_id if the table was created before subcategories existed.
-- If you get "Duplicate column name" or "Duplicate key name", the column/index already exist; skip or comment out that line.
ALTER TABLE categories ADD COLUMN parent_id BIGINT NULL AFTER slug;
ALTER TABLE categories ADD KEY idx_categories_parent_id (parent_id);
-- Optional: add FK for referential integrity (run after step 2 so parent rows exist):
-- ALTER TABLE categories ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL;

-- Step 2: Insert root (parent) categories only if they don't exist (match by slug).
-- Uses INSERT IGNORE so existing rows are never overwritten; IDs stay the same.
INSERT IGNORE INTO categories (name, slug, parent_id) VALUES
  ('Trading Cards', 'trading-cards', NULL),
  ('Luxury', 'luxury', NULL),
  ('Comics', 'comics', NULL),
  ('Memorabilia', 'memorabilia', NULL),
  ('LEGO', 'lego', NULL),
  ('Figures', 'figures', NULL),
  ('Coins & Bullion', 'coins-bullion', NULL),
  ('Fine Art and Limited Prints', 'fine-art-limited-prints', NULL),
  ('Other', 'other', NULL);

-- Step 3: Map old flat categories into the new hierarchy (existing rows keep their id).
-- Listings that pointed to these ids still point to the same row; we only set parent_id and names.
UPDATE categories c
SET c.parent_id = (SELECT id FROM (SELECT id FROM categories WHERE slug = 'trading-cards' LIMIT 1) t),
    c.name = 'Pokemon cards',
    c.slug = 'pokemon-cards'
WHERE c.slug = 'pokemon';

-- Keep "Sports Cards" as the name; only set parent so it becomes a subcategory of Trading Cards.
UPDATE categories c
SET c.parent_id = (SELECT id FROM (SELECT id FROM categories WHERE slug = 'trading-cards' LIMIT 1) t)
WHERE c.slug = 'sports-cards';

UPDATE categories c
SET c.name = 'LEGO',
    c.slug = 'lego',
    c.parent_id = NULL
WHERE c.slug = 'lego';

-- Step 4: Insert subcategories that don't exist yet (by slug). Parent resolved by slug.
-- Pokemon cards: added here (no existing 'pokemon' row to update in Step 3).
INSERT INTO categories (name, slug, parent_id)
SELECT 'Pokemon cards', 'pokemon-cards', c.id FROM categories c
WHERE c.slug = 'trading-cards' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'pokemon-cards') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Magic: The Gathering', 'magic-the-gathering', c.id FROM categories c
WHERE c.slug = 'trading-cards' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'magic-the-gathering') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Yu-gi-oh', 'yu-gi-oh', c.id FROM categories c
WHERE c.slug = 'trading-cards' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'yu-gi-oh') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Watches', 'watches', c.id FROM categories c
WHERE c.slug = 'luxury' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'watches') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Designer Bags', 'designer-bags', c.id FROM categories c
WHERE c.slug = 'luxury' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'designer-bags') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Marvel', 'marvel', c.id FROM categories c
WHERE c.slug = 'comics' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'marvel') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'DC', 'dc', c.id FROM categories c
WHERE c.slug = 'comics' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'dc') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Autographed Items', 'autographed-items', c.id FROM categories c
WHERE c.slug = 'memorabilia' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'autographed-items') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Star Wars', 'star-wars', c.id FROM categories c
WHERE c.slug = 'lego' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'star-wars') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Hot Toys', 'hot-toys', c.id FROM categories c
WHERE c.slug = 'figures' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'hot-toys') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Gold Coins', 'gold-coins', c.id FROM categories c
WHERE c.slug = 'coins-bullion' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'gold-coins') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Silver Coins', 'silver-coins', c.id FROM categories c
WHERE c.slug = 'coins-bullion' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'silver-coins') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Rare Mint Errors', 'rare-mint-errors', c.id FROM categories c
WHERE c.slug = 'coins-bullion' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'rare-mint-errors') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Historical Currency', 'historical-currency', c.id FROM categories c
WHERE c.slug = 'coins-bullion' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'historical-currency') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Rare Coins', 'rare-coins', c.id FROM categories c
WHERE c.slug = 'coins-bullion' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'rare-coins') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Signed Prints', 'signed-prints', c.id FROM categories c
WHERE c.slug = 'fine-art-limited-prints' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'signed-prints') LIMIT 1;

INSERT INTO categories (name, slug, parent_id)
SELECT 'Numbered Editions', 'numbered-editions', c.id FROM categories c
WHERE c.slug = 'fine-art-limited-prints' AND NOT EXISTS (SELECT 1 FROM categories c2 WHERE c2.slug = 'numbered-editions') LIMIT 1;

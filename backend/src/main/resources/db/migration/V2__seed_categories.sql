-- Category tree with stable IDs (matches demo listing seed in V4).

INSERT INTO categories (id, name, slug, parent_id) VALUES
(1, 'LEGO', 'lego', NULL),
(2, 'Trading Cards', 'trading-cards', NULL),
(4, 'Sports Cards', 'sports-cards', 2),
(7, 'Luxury', 'luxury', NULL),
(8, 'Comics', 'comics', NULL),
(9, 'Memorabilia', 'memorabilia', NULL),
(10, 'Figures', 'figures', NULL),
(11, 'Coins & Bullion', 'coins-bullion', NULL),
(12, 'Fine Art and Limited Prints', 'fine-art-limited-prints', NULL),
(13, 'Other', 'other', NULL),
(25, 'Pokemon cards', 'pokemon-cards', 2),
(26, 'Magic: The Gathering', 'magic-the-gathering', 2),
(27, 'Yu-gi-oh', 'yu-gi-oh', 2),
(28, 'Watches', 'watches', 7),
(29, 'Designer Bags', 'designer-bags', 7),
(30, 'Marvel', 'marvel', 8),
(31, 'DC', 'dc', 8),
(32, 'Autographed Items', 'autographed-items', 9),
(33, 'Star Wars', 'star-wars', 1),
(34, 'Hot Toys', 'hot-toys', 10),
(35, 'Gold Coins', 'gold-coins', 11),
(36, 'Silver Coins', 'silver-coins', 11),
(37, 'Rare Mint Errors', 'rare-mint-errors', 11),
(38, 'Historical Currency', 'historical-currency', 11),
(39, 'Rare Coins', 'rare-coins', 11),
(40, 'Signed Prints', 'signed-prints', 12),
(41, 'Numbered Editions', 'numbered-editions', 12);

ALTER TABLE categories AUTO_INCREMENT = 100;

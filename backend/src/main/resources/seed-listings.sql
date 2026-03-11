-- Seed listings for seller_id = 2. Run against your existing authentix DB.
-- Category IDs: 25=Pokemon cards, 4=Sports Cards, 26=Magic, 27=Yu-gi-oh, 28=Watches, 29=Designer Bags,
-- 30=Marvel, 31=DC, 32=Autographed Items, 33=Star Wars, 34=Hot Toys, 35=Gold Coins, 36=Silver Coins,
-- 37=Rare Mint Errors, 38=Historical Currency, 39=Rare Coins, 40=Signed Prints, 41=Numbered Editions, 13=Other

SET @seller_id = 2;
SET @now = NOW();

INSERT INTO listings (seller_id, category_id, title, description, price, item_condition, shipping_option, zip_code, city, state, status, created_at, updated_at) VALUES
-- Trading Cards > Pokémon Cards (25)
(@seller_id, 25, 'Pikachu Illustrator Promo (PSA 5)', 'Rare Japanese Pikachu Illustrator promo card. PSA graded 5. Iconic collector''s piece with original slab included.', 85000.00, 'Graded', 'SHIP', '90012', 'Los Angeles', 'California', 'ACTIVE', @now, @now),

-- Trading Cards > Sports Cards (4)
(@seller_id, 4, '1986 Fleer Michael Jordan Rookie #57 (PSA 7)', 'Authentic 1986 Fleer MJ rookie card. PSA graded 7 Near Mint. Highly collectible investment piece.', 9500.00, 'Graded', 'SHIP', '60601', 'Chicago', 'Illinois', 'ACTIVE', @now, @now),
(@seller_id, 4, '2018 Luka Dončić Prizm Silver Rookie', '2018 Panini Prizm Silver Rookie. Sharp corners and strong centering.', 1800.00, 'Very good', 'SHIP', '75201', 'Dallas', 'Texas', 'ACTIVE', @now, @now),
(@seller_id, 4, '2000 Tom Brady Bowman Rookie #236', 'Iconic Tom Brady rookie card. Clean surface and well-centered.', 2200.00, 'Very good', 'SHIP', '02108', 'Boston', 'Massachusetts', 'ACTIVE', @now, @now),
(@seller_id, 4, '2020 Joe Burrow Prizm Rookie Auto', 'Autographed Joe Burrow rookie card. Certified auto with protective case.', 3500.00, 'Excellent', 'SHIP', '45202', 'Cincinnati', 'Ohio', 'ACTIVE', @now, @now),
(@seller_id, 4, '1952 Topps Willie Mays #261', 'Classic vintage Topps card. Strong color and moderate corner wear.', 4800.00, 'Good', 'SHIP', '94102', 'San Francisco', 'California', 'ACTIVE', @now, @now),
(@seller_id, 4, '2011 Mike Trout Topps Update Rookie', 'Mike Trout RC US175. Clean copy stored in magnetic holder.', 900.00, 'Near mint', 'SHIP', '92805', 'Anaheim', 'California', 'ACTIVE', @now, @now),

-- Trading Cards > Magic: The Gathering (26)
(@seller_id, 26, 'Black Lotus Unlimited (HP)', 'Unlimited Black Lotus. Heavily played condition but authentic. Great binder copy.', 9500.00, 'Heavily played', 'SHIP', '98101', 'Seattle', 'Washington', 'ACTIVE', @now, @now),
(@seller_id, 26, 'Mox Sapphire Revised', 'Revised Edition Mox Sapphire. Light play with minor edge wear.', 3200.00, 'Very good', 'SHIP', '80202', 'Denver', 'Colorado', 'ACTIVE', @now, @now),

-- Trading Cards > Yu-Gi-Oh (27)
(@seller_id, 27, 'Blue-Eyes White Dragon 1st Edition LOB-001', '1st Edition Legend of Blue Eyes print. Strong gloss and minimal scratches.', 4500.00, 'Near mint', 'SHIP', '33101', 'Miami', 'Florida', 'ACTIVE', @now, @now),
(@seller_id, 27, 'Dark Magician Girl MFC-000 Secret Rare', 'Highly sought-after Secret Rare. Stored in sleeve since pull.', 1800.00, 'Excellent', 'SHIP', '32801', 'Orlando', 'Florida', 'ACTIVE', @now, @now),

-- Luxury > Watches (28)
(@seller_id, 28, 'Omega Speedmaster Professional Moonwatch', 'Hesalite crystal Moonwatch. Manual wind. Includes box and warranty card.', 5200.00, 'Excellent', 'SHIP', '77002', 'Houston', 'Texas', 'ACTIVE', @now, @now),

-- Luxury > Designer Bags (29)
(@seller_id, 29, 'Louis Vuitton Neverfull MM Damier Ebene', 'Gently used Neverfull MM. Includes pouch and dust bag. No cracks or major wear.', 1400.00, 'Very good', 'SHIP', '10001', 'New York', 'New York', 'ACTIVE', @now, @now),
(@seller_id, 29, 'Chanel Classic Flap Medium Caviar Leather', 'Black caviar leather with gold hardware. Includes authenticity card and box.', 6200.00, 'Excellent', 'SHIP', '90210', 'Beverly Hills', 'California', 'ACTIVE', @now, @now),

-- Comics > Marvel (30)
(@seller_id, 30, 'Incredible Hulk #181', 'First full appearance of Wolverine. CGC 6.5 with off-white pages.', 9500.00, 'Graded', 'SHIP', 'M5H', 'Toronto', 'Ontario', 'ACTIVE', @now, @now),

-- Comics > DC (31)
(@seller_id, 31, 'Batman #1 (1940)', 'Golden Age issue featuring Joker and Catwoman. Restored copy.', 75000.00, 'Restored', 'SHIP', '60611', 'Chicago', 'Illinois', 'ACTIVE', @now, @now),
(@seller_id, 31, 'Showcase #4', 'First appearance of Silver Age Flash. CGC 4.0.', 12000.00, 'Graded', 'SHIP', '75219', 'Dallas', 'Texas', 'ACTIVE', @now, @now),

-- Memorabilia > Autographed Items (32)
(@seller_id, 32, 'Kobe Bryant Signed Lakers Jersey (UDA Certified)', 'Authentic UDA hologram certification. Framed display included.', 8500.00, 'Excellent', 'SHIP', '90015', 'Los Angeles', 'California', 'ACTIVE', @now, @now),
(@seller_id, 32, 'Stan Lee Signed Marvel Poster', 'Hand-signed by Stan Lee at 2017 Comic-Con. Includes COA.', 1200.00, 'Very good', 'SHIP', '92101', 'San Diego', 'California', 'ACTIVE', @now, @now),

-- LEGO > Star Wars (33)
(@seller_id, 33, 'LEGO Star Wars Millennium Falcon 75192 (UCS)', 'Complete with box and instructions. 100% verified pieces.', 700.00, 'Very good', 'SHIP', '89109', 'Las Vegas', 'Nevada', 'ACTIVE', @now, @now),
(@seller_id, 33, 'LEGO Star Wars Imperial Star Destroyer 75252', 'Built once and displayed. Includes original box.', 650.00, 'Excellent', 'SHIP', '85004', 'Phoenix', 'Arizona', 'ACTIVE', @now, @now),

-- Figures > Hot Toys (34)
(@seller_id, 34, 'Hot Toys Iron Man Mark LXXXV (Endgame)', 'Movie Masterpiece series. Complete with accessories and box.', 450.00, 'Excellent', 'SHIP', '95112', 'San Jose', 'California', 'ACTIVE', @now, @now),
(@seller_id, 34, 'Hot Toys Darth Vader (Rogue One)', 'Deluxe edition with light-up features. Museum pose only.', 400.00, 'Very good', 'SHIP', '32819', 'Orlando', 'Florida', 'ACTIVE', @now, @now),

-- Coins & Bullion > Gold Coins (35)
(@seller_id, 35, '2023 American Gold Eagle 1 oz', 'Brilliant Uncirculated 1 oz gold coin in protective capsule.', 2150.00, 'Uncirculated', 'SHIP', '77010', 'Houston', 'Texas', 'ACTIVE', @now, @now),
(@seller_id, 35, '1915 Austrian Gold Ducat', 'Restrike gold ducat. Excellent luster and detail.', 240.00, 'Very good', 'SHIP', '33131', 'Miami', 'Florida', 'ACTIVE', @now, @now),

-- Coins & Bullion > Silver Coins (36)
(@seller_id, 36, '2022 American Silver Eagle 1 oz', 'BU condition in mint tube packaging.', 32.00, 'Uncirculated', 'SHIP', '80203', 'Denver', 'Colorado', 'ACTIVE', @now, @now),
(@seller_id, 36, '1898 Morgan Silver Dollar', 'Strong details with natural toning.', 95.00, 'Very good', 'SHIP', '64106', 'Kansas City', 'Missouri', 'ACTIVE', @now, @now),

-- Coins & Bullion > Rare Mint Errors (37)
(@seller_id, 37, '1955 Doubled Die Lincoln Cent', 'Famous doubled die obverse. Strong doubling visible.', 2200.00, 'Very good', 'SHIP', '19106', 'Philadelphia', 'Pennsylvania', 'ACTIVE', @now, @now),
(@seller_id, 37, '2000 Sacagawea "Cheerios" Dollar', 'Rare early reverse pattern variant.', 3200.00, 'Excellent', 'SHIP', '55401', 'Minneapolis', 'Minnesota', 'ACTIVE', @now, @now),

-- Coins & Bullion > Historical Currency (38)
(@seller_id, 38, '1863 Civil War Confederate $10 Note', 'Genuine Confederate States note with visible signatures.', 450.00, 'Good', 'SHIP', '23219', 'Richmond', 'Virginia', 'ACTIVE', @now, @now),
(@seller_id, 38, '1928 $1 Silver Certificate', 'Blue seal note with crisp edges.', 120.00, 'Very good', 'SHIP', '20004', 'Washington', 'DC', 'ACTIVE', @now, @now),

-- Coins & Bullion > Rare Coins (39)
(@seller_id, 39, '1909-S VDB Lincoln Cent', 'Key date cent with clear mint mark.', 1400.00, 'Fine', 'SHIP', '94104', 'San Francisco', 'California', 'ACTIVE', @now, @now),
(@seller_id, 39, '1916-D Mercury Dime', 'Key date Mercury dime. Strong detail for grade.', 3200.00, 'Very good', 'SHIP', '80204', 'Denver', 'Colorado', 'ACTIVE', @now, @now),

-- Fine Art & Limited Prints > Signed Prints (40)
(@seller_id, 40, 'Salvador Dalí Signed Lithograph', 'Hand-signed lithograph with certificate of authenticity.', 2800.00, 'Excellent', 'SHIP', '33132', 'Miami', 'Florida', 'ACTIVE', @now, @now),
(@seller_id, 40, 'Leroy Neiman Signed Sports Print', 'Vibrant signed print, professionally framed.', 950.00, 'Very good', 'SHIP', '60614', 'Chicago', 'Illinois', 'ACTIVE', @now, @now),

-- Fine Art & Limited Prints > Numbered Editions (41)
(@seller_id, 41, 'Banksy "Girl with Balloon" Numbered Edition', 'Limited numbered print. Certificate included.', 15000.00, 'Excellent', 'SHIP', 'SW1A', 'London', 'UK', 'ACTIVE', @now, @now),
(@seller_id, 41, 'Shepard Fairey Limited Edition Screen Print (#125/500)', 'Hand-numbered edition with embossed seal.', 1200.00, 'Excellent', 'SHIP', '90013', 'Los Angeles', 'California', 'ACTIVE', @now, @now),

-- Other (13)
(@seller_id, 13, 'Vintage 1980s Nintendo Game & Watch', 'Fully functional handheld with original battery cover.', 180.00, 'Good', 'SHIP', '98109', 'Seattle', 'Washington', 'ACTIVE', @now, @now),
(@seller_id, 13, 'Signed First Edition "The Hobbit" (1978 Print)', 'First edition printing signed by illustrator. Dust jacket included.', 2200.00, 'Very good', 'SHIP', '02110', 'Boston', 'Massachusetts', 'ACTIVE', @now, @now);

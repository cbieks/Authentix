-- Remove currency column from listings (prices are now USD only).
-- Run in MySQL: mysql -u authentix -p authentix < scripts/drop-listing-currency.sql

ALTER TABLE listings DROP COLUMN currency;

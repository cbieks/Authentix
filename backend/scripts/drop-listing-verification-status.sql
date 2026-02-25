-- Remove verification_status column from listings.
-- Run in MySQL: mysql -u authentix -p authentix < scripts/drop-listing-verification-status.sql

ALTER TABLE listings DROP COLUMN verification_status;

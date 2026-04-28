-- Rotate demo account password to a non-public credential.
-- Keep the demo user and seeded listings while invalidating old known password values.

UPDATE users
SET password_hash = '$2y$10$k0yl936hO6gr3MBlaBvQDOABf.8YQKf65tl97xPWwAdnMfRWjn6xG',
    updated_at = NOW(6)
WHERE email = 'demo@authentix.local';

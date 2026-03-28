-- Set team demo login to plaintext "password" (BCrypt via Spring BCryptPasswordEncoder, strength 10).
-- Independent from user id 2 — teammates use demo@authentix.local without sharing that account's password.

UPDATE users
SET password_hash = '$2a$10$hlRcf9RBlhTpboGcZ15uYeougxmN1Hc7SVZLb/rTPXv4NJMb.uuy2',
    updated_at = NOW(6)
WHERE email = 'demo@authentix.local';

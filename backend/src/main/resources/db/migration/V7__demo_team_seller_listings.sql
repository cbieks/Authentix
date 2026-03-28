-- Shared team demo seller for seeded listings 6-44 (Pikachu Illustrator through Hobbit).
-- Login: demo@authentix.local / password (same BCrypt as V3).
-- Listings 1-5 stay on seller_id = 2 from V4 (Charizard, Amazing Fantasy, booster box, LEGO Rex, Rolex).

INSERT INTO users (id, email, password_hash, display_name, contact_visible, created_at, updated_at) VALUES
(3, 'demo@authentix.local', '$2a$10$9OH5rxKQse95gMNXhDZxOuqC3S678nTugwnPongBAVh58ESUsPpY6', 'Authentix Demo', 1, NOW(6), NOW(6));

UPDATE listings SET seller_id = 3 WHERE id BETWEEN 6 AND 44;

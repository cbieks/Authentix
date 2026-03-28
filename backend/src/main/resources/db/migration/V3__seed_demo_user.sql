-- Demo seller for seeded listings (password: "password" — change in real deployments).

INSERT INTO users (id, email, password_hash, display_name, contact_visible, created_at, updated_at) VALUES
(2, 'cameronbieker12@icloud.com', '$2a$10$9OH5rxKQse95gMNXhDZxOuqC3S678nTugwnPongBAVh58ESUsPpY6', 'Cameron Bieker', 1, NOW(6), NOW(6));

ALTER TABLE users AUTO_INCREMENT = 100;

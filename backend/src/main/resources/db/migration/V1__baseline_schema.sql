-- Baseline schema for Authentix (matches JPA entities). Used with spring.jpa.hibernate.ddl-auto=validate + Flyway.

CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  profile_photo_url MEDIUMTEXT,
  bio TEXT,
  contact_info VARCHAR(255),
  contact_visible BIT(1) NOT NULL,
  stripe_connect_account_id VARCHAR(255),
  discovery_zip_code VARCHAR(20),
  discovery_country VARCHAR(2),
  discovery_updated_at DATETIME(6),
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  parent_id BIGINT,
  UNIQUE KEY uk_categories_slug (slug),
  KEY idx_categories_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE listings (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  seller_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(19,2) NOT NULL,
  item_condition VARCHAR(255),
  shipping_option VARCHAR(255) NOT NULL,
  zip_code VARCHAR(20),
  city VARCHAR(100),
  state VARCHAR(100),
  status VARCHAR(255) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  KEY idx_listings_status (status),
  KEY idx_listings_category_id (category_id),
  KEY idx_listings_seller_id (seller_id),
  KEY idx_listings_created_at (created_at),
  CONSTRAINT fk_listings_seller FOREIGN KEY (seller_id) REFERENCES users (id),
  CONSTRAINT fk_listings_category FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE listing_images (
  listing_id BIGINT NOT NULL,
  sort_order INT NOT NULL,
  url MEDIUMTEXT,
  PRIMARY KEY (listing_id, sort_order),
  CONSTRAINT fk_listing_images_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE watchlist (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  listing_id BIGINT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  UNIQUE KEY uk_watchlist_user_listing (user_id, listing_id),
  KEY idx_watchlist_user_id (user_id),
  KEY idx_watchlist_listing_id (listing_id),
  CONSTRAINT fk_watchlist_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_watchlist_listing FOREIGN KEY (listing_id) REFERENCES listings (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  buyer_id BIGINT NOT NULL,
  listing_id BIGINT NOT NULL,
  stripe_payment_intent_id VARCHAR(255) NOT NULL,
  amount DECIMAL(19,2) NOT NULL,
  platform_fee DECIMAL(19,2) NOT NULL,
  seller_payout DECIMAL(19,2) NOT NULL,
  status VARCHAR(255) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  ship_line1 VARCHAR(255),
  ship_line2 VARCHAR(255),
  ship_city VARCHAR(100),
  ship_state VARCHAR(100),
  ship_postal_code VARCHAR(20),
  ship_country VARCHAR(2),
  ship_phone VARCHAR(50),
  UNIQUE KEY uk_orders_stripe_payment_intent_id (stripe_payment_intent_id),
  KEY idx_orders_buyer_id (buyer_id),
  KEY idx_orders_listing_id (listing_id),
  KEY idx_orders_status (status),
  CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users (id),
  CONSTRAINT fk_orders_listing FOREIGN KEY (listing_id) REFERENCES listings (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE addresses (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL,
  phone VARCHAR(50),
  is_default BIT(1) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  KEY idx_addresses_user_id (user_id),
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE messages (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  listing_id BIGINT NOT NULL,
  sender_id BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  body TEXT NOT NULL,
  is_read BIT(1) NOT NULL,
  created_at DATETIME(6) NOT NULL,
  KEY idx_messages_listing_id (listing_id),
  KEY idx_messages_receiver_id (receiver_id),
  KEY idx_messages_created_at (created_at),
  CONSTRAINT fk_messages_listing FOREIGN KEY (listing_id) REFERENCES listings (id),
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users (id),
  CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE watchlist_folders (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(80) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_watchlist_folders_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uq_watchlist_folder_user_name
        UNIQUE (user_id, name)
);

CREATE TABLE watchlist_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    folder_id BIGINT NOT NULL,
    listing_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_watchlist_items_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_watchlist_items_folder
        FOREIGN KEY (folder_id) REFERENCES watchlist_folders(id) ON DELETE CASCADE,
    CONSTRAINT fk_watchlist_items_listing
        FOREIGN KEY (listing_id) REFERENCES listings(id),
    CONSTRAINT uq_watchlist_folder_listing
        UNIQUE (folder_id, listing_id)
);
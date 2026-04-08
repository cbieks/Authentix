package com.authentix.authentix.watchlist;

import com.authentix.authentix.entity.Listing;
import com.authentix.authentix.entity.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "watchlist_items",
    uniqueConstraints = @UniqueConstraint(columnNames = {"folder_id", "listing_id"})
)
public class WatchlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "folder_id", nullable = false)
    private WatchlistFolder folder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public User getUser() { return user; }
    public WatchlistFolder getFolder() { return folder; }
    public Listing getListing() { return listing; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setFolder(WatchlistFolder folder) { this.folder = folder; }
    public void setListing(Listing listing) { this.listing = listing; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
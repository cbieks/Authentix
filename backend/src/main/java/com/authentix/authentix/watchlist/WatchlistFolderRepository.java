package com.authentix.authentix.watchlist;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchlistFolderRepository extends JpaRepository<WatchlistFolder, Long> {
    List<WatchlistFolder> findByUserIdOrderByCreatedAtAsc(Long userId);
    Optional<WatchlistFolder> findByIdAndUserId(Long id, Long userId);
    boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);
}
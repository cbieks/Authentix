package com.authentix.authentix.watchlist;

import com.authentix.authentix.entity.Listing;
import com.authentix.authentix.entity.User;
import com.authentix.authentix.repository.ListingRepository;
import com.authentix.authentix.repository.UserRepository;
import com.authentix.authentix.security.AuthenticatedUser;
import com.authentix.authentix.watchlist.WatchlistDtos.AddItemRequest;
import com.authentix.authentix.watchlist.WatchlistDtos.CreateFolderRequest;
import com.authentix.authentix.watchlist.WatchlistDtos.RenameFolderRequest;
import com.authentix.authentix.watchlist.WatchlistDtos.WatchlistFolderDto;
import com.authentix.authentix.watchlist.WatchlistDtos.WatchlistItemDto;
import jakarta.transaction.Transactional;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class WatchlistFolderService {

    private final WatchlistFolderRepository folderRepository;
    private final WatchlistItemRepository itemRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    public WatchlistFolderService(
        WatchlistFolderRepository folderRepository,
        WatchlistItemRepository itemRepository,
        ListingRepository listingRepository,
        UserRepository userRepository
    ) {
        this.folderRepository = folderRepository;
        this.itemRepository = itemRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
    }

    public List<WatchlistFolderDto> listFolders(AuthenticatedUser auth) {
        User user = currentUser(auth);
        return folderRepository.findByUserIdOrderByCreatedAtAsc(user.getId())
            .stream()
            .map(this::toDto)
            .toList();
    }

    public WatchlistFolderDto createFolder(AuthenticatedUser auth, CreateFolderRequest req) {
        User user = currentUser(auth);
        String name = normalizeName(req.name());

        if (folderRepository.existsByUserIdAndNameIgnoreCase(user.getId(), name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Folder already exists");
        }

        WatchlistFolder folder = new WatchlistFolder();
        folder.setUser(user);
        folder.setName(name);

        return toDto(folderRepository.save(folder));
    }

    public WatchlistFolderDto renameFolder(AuthenticatedUser auth, Long folderId, RenameFolderRequest req) {
        User user = currentUser(auth);
        WatchlistFolder folder = folderRepository.findByIdAndUserId(folderId, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));

        String name = normalizeName(req.name());

        if (folderRepository.existsByUserIdAndNameIgnoreCase(user.getId(), name)
            && !folder.getName().equalsIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Folder already exists");
        }

        folder.setName(name);
        return toDto(folderRepository.save(folder));
    }

    public void deleteFolder(AuthenticatedUser auth, Long folderId) {
        User user = currentUser(auth);
        WatchlistFolder folder = folderRepository.findByIdAndUserId(folderId, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));

        folderRepository.delete(folder);
    }

    public WatchlistFolderDto addItem(AuthenticatedUser auth, Long folderId, AddItemRequest req) {
        User user = currentUser(auth);

        WatchlistFolder folder = folderRepository.findByIdAndUserId(folderId, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));

        Listing listing = listingRepository.findById(req.listingId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));

        Optional<WatchlistItem> existing = itemRepository.findByFolderIdAndListingId(folderId, listing.getId());
        if (existing.isPresent()) {
            return toDto(folder);
        }

        WatchlistItem item = new WatchlistItem();
        item.setUser(user);
        item.setFolder(folder);
        item.setListing(listing);
        itemRepository.save(item);

        return toDto(folder);
    }

    public WatchlistFolderDto removeItem(AuthenticatedUser auth, Long folderId, Long listingId) {
        User user = currentUser(auth);

        WatchlistFolder folder = folderRepository.findByIdAndUserId(folderId, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));

        WatchlistItem item = itemRepository.findByFolderIdAndListingId(folderId, listingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"));

        itemRepository.delete(item);
        return toDto(folder);
    }

    private User currentUser(AuthenticatedUser auth) {
        if (auth == null || auth.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in");
        }

        return userRepository.findById(auth.getUserId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private String normalizeName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Folder name is required");
        }
        return name.trim();
    }

    private WatchlistFolderDto toDto(WatchlistFolder folder) {
        List<WatchlistItemDto> items = folder.getItems().stream()
            .sorted(Comparator.comparing(i -> i.getListing().getPrice()))
            .map(this::toItemDto)
            .toList();

        return new WatchlistFolderDto(folder.getId(), folder.getName(), items);
    }

    private WatchlistItemDto toItemDto(WatchlistItem item) {
        Listing listing = item.getListing();

        List<String> images = listing.getImages() == null ? List.of() : listing.getImages();
        String categoryName = listing.getCategory() != null ? listing.getCategory().getName() : null;

        return new WatchlistItemDto(
            item.getId(),
            listing.getId(),
            listing.getTitle(),
            listing.getPrice(),
            categoryName,
            images
        );
    }
}
package com.authentix.authentix.watchlist;

import com.authentix.authentix.security.AuthenticatedUser;
import com.authentix.authentix.watchlist.WatchlistDtos.AddItemRequest;
import com.authentix.authentix.watchlist.WatchlistDtos.CreateFolderRequest;
import com.authentix.authentix.watchlist.WatchlistDtos.RenameFolderRequest;
import com.authentix.authentix.watchlist.WatchlistDtos.WatchlistFolderDto;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me/watchlist-folders")
public class WatchlistFolderController {

    private final WatchlistFolderService service;

    public WatchlistFolderController(WatchlistFolderService service) {
        this.service = service;
    }

    @GetMapping
    public List<WatchlistFolderDto> listFolders(@AuthenticationPrincipal AuthenticatedUser auth) {
        return service.listFolders(auth);
    }

    @PostMapping
    public WatchlistFolderDto createFolder(
        @AuthenticationPrincipal AuthenticatedUser auth,
        @RequestBody CreateFolderRequest req
    ) {
        return service.createFolder(auth, req);
    }

    @PatchMapping("/{folderId}")
    public WatchlistFolderDto renameFolder(
        @PathVariable Long folderId,
        @AuthenticationPrincipal AuthenticatedUser auth,
        @RequestBody RenameFolderRequest req
    ) {
        return service.renameFolder(auth, folderId, req);
    }

    @DeleteMapping("/{folderId}")
    public void deleteFolder(
        @PathVariable Long folderId,
        @AuthenticationPrincipal AuthenticatedUser auth
    ) {
        service.deleteFolder(auth, folderId);
    }

    @PostMapping("/{folderId}/items")
    public WatchlistFolderDto addItem(
        @PathVariable Long folderId,
        @AuthenticationPrincipal AuthenticatedUser auth,
        @RequestBody AddItemRequest req
    ) {
        return service.addItem(auth, folderId, req);
    }

    @DeleteMapping("/{folderId}/items/{listingId}")
    public WatchlistFolderDto removeItem(
        @PathVariable Long folderId,
        @PathVariable Long listingId,
        @AuthenticationPrincipal AuthenticatedUser auth
    ) {
        return service.removeItem(auth, folderId, listingId);
    }
}
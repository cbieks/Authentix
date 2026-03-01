package com.authentix.authentix.controller;

import com.authentix.authentix.dto.AddressDto;
import com.authentix.authentix.dto.CreateAddressRequest;
import com.authentix.authentix.dto.UpdateAddressRequest;
import com.authentix.authentix.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressDto>> getMyAddresses() {
        return ResponseEntity.ok(addressService.getMyAddresses());
    }

    @PostMapping
    public ResponseEntity<AddressDto> create(@Valid @RequestBody CreateAddressRequest request) {
        return ResponseEntity.ok(addressService.create(request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AddressDto> update(@PathVariable Long id, @Valid @RequestBody UpdateAddressRequest request) {
        return ResponseEntity.ok(addressService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        addressService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

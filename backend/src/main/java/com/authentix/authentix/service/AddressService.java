package com.authentix.authentix.service;

import com.authentix.authentix.dto.AddressDto;
import com.authentix.authentix.dto.CreateAddressRequest;
import com.authentix.authentix.dto.UpdateAddressRequest;
import com.authentix.authentix.entity.Address;
import com.authentix.authentix.entity.User;
import com.authentix.authentix.repository.AddressRepository;
import com.authentix.authentix.repository.UserRepository;
import com.authentix.authentix.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        AuthenticatedUser auth = (AuthenticatedUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return auth.getUserId();
    }

    public List<AddressDto> getMyAddresses() {
        Long userId = getCurrentUserId();
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                .map(AddressDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDto create(CreateAddressRequest request) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (request.isDefault()) {
            addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).forEach(a -> {
                a.setDefault(false);
                addressRepository.save(a);
            });
        }
        Address address = Address.builder()
                .user(user)
                .line1(request.getLine1())
                .line2(request.getLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry() != null ? request.getCountry().toUpperCase() : null)
                .phone(request.getPhone())
                .isDefault(request.isDefault())
                .build();
        address = addressRepository.save(address);
        return AddressDto.fromEntity(address);
    }

    @Transactional
    public AddressDto update(Long id, UpdateAddressRequest request) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUser().getId().equals(getCurrentUserId())) {
            throw new IllegalArgumentException("Not authorized to update this address");
        }
        if (request.getLine1() != null) address.setLine1(request.getLine1());
        if (request.getLine2() != null) address.setLine2(request.getLine2());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getState() != null) address.setState(request.getState());
        if (request.getPostalCode() != null) address.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) address.setCountry(request.getCountry().toUpperCase());
        if (request.getPhone() != null) address.setPhone(request.getPhone());
        if (request.getIsDefault() != null) {
            if (request.getIsDefault()) {
                addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(address.getUser().getId()).forEach(a -> {
                    a.setDefault(false);
                    addressRepository.save(a);
                });
            }
            address.setDefault(request.getIsDefault());
        }
        address = addressRepository.save(address);
        return AddressDto.fromEntity(address);
    }

    @Transactional
    public void delete(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUser().getId().equals(getCurrentUserId())) {
            throw new IllegalArgumentException("Not authorized to delete this address");
        }
        addressRepository.delete(address);
    }

    public Address getAddressForUser(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Address does not belong to user");
        }
        return address;
    }
}

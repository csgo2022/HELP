package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.Address;
import com.mutualaid.security.CurrentUser;
import com.mutualaid.service.mini.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ApiResponse<List<Address>> getAddresses(@CurrentUser Long userId) {
        return ApiResponse.success(addressService.getAddresses(userId));
    }

    @PostMapping
    public ApiResponse<Address> createAddress(@CurrentUser Long userId, @RequestBody Map<String, Object> body) {
        return ApiResponse.success(addressService.createAddress(userId,
                (String) body.get("name"),
                (String) body.get("phone"),
                (String) body.get("address"),
                Boolean.TRUE.equals(body.get("isDefault"))));
    }

    @PutMapping("/{id}")
    public ApiResponse<Address> updateAddress(@PathVariable Long id, @CurrentUser Long userId,
                                               @RequestBody Map<String, Object> body) {
        return ApiResponse.success(addressService.updateAddress(id, userId,
                (String) body.get("name"),
                (String) body.get("phone"),
                (String) body.get("address"),
                Boolean.TRUE.equals(body.get("isDefault"))));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAddress(@PathVariable Long id, @CurrentUser Long userId) {
        addressService.deleteAddress(id, userId);
        return ApiResponse.success();
    }
}

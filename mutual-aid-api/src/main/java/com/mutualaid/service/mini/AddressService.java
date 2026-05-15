package com.mutualaid.service.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.entity.Address;
import com.mutualaid.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    public List<Address> getAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDesc(userId);
    }

    @Transactional
    public Address createAddress(Long userId, String name, String phone, String addressText, boolean isDefault) {
        if (isDefault) {
            clearDefaultFlag(userId);
        }
        Address address = new Address();
        address.setUserId(userId);
        address.setName(name);
        address.setPhone(phone);
        address.setAddress(addressText);
        address.setIsDefault(isDefault);
        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(Long id, Long userId, String name, String phone, String addressText, boolean isDefault) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new BusinessException("地址不存在"));

        if (!address.getUserId().equals(userId)) {
            throw new BusinessException("无权修改该地址");
        }

        if (isDefault) {
            clearDefaultFlag(userId);
        }

        if (name != null) address.setName(name);
        if (phone != null) address.setPhone(phone);
        if (addressText != null) address.setAddress(addressText);
        address.setIsDefault(isDefault);

        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Long id, Long userId) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new BusinessException("地址不存在"));
        if (!address.getUserId().equals(userId)) {
            throw new BusinessException("无权删除该地址");
        }
        addressRepository.delete(address);
    }

    private void clearDefaultFlag(Long userId) {
        List<Address> addresses = addressRepository.findByUserIdOrderByIsDefaultDesc(userId);
        for (Address addr : addresses) {
            if (addr.getIsDefault()) {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            }
        }
    }
}

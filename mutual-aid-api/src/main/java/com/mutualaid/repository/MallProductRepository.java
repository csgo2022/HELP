package com.mutualaid.repository;

import com.mutualaid.model.entity.MallProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MallProductRepository extends JpaRepository<MallProduct, Long> {
    List<MallProduct> findByStatus(String status);
}

package com.mutualaid.repository;

import com.mutualaid.model.entity.OrderLogistics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderLogisticsRepository extends JpaRepository<OrderLogistics, Long> {
    List<OrderLogistics> findByOrderIdOrderByTimeAsc(Long orderId);
}

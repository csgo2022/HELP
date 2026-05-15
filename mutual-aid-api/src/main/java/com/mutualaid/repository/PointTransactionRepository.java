package com.mutualaid.repository;

import com.mutualaid.model.entity.PointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    List<PointTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<PointTransaction> findByUserIdAndTypeAndCreatedAtAfter(Long userId, String type, LocalDateTime after);
}

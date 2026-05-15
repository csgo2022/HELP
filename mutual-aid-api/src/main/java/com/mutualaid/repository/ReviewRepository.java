package com.mutualaid.repository;

import com.mutualaid.model.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTaskId(Long taskId);
    List<Review> findByToUserId(Long toUserId);
    List<Review> findByFromUserId(Long fromUserId);
}

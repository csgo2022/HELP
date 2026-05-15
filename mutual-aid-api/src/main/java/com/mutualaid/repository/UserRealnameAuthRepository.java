package com.mutualaid.repository;

import com.mutualaid.model.entity.UserRealnameAuth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRealnameAuthRepository extends JpaRepository<UserRealnameAuth, Long> {
    Optional<UserRealnameAuth> findByUserId(Long userId);
    List<UserRealnameAuth> findByStatus(String status);
}

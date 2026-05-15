package com.mutualaid.service.admin;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.entity.User;
import com.mutualaid.model.entity.UserRealnameAuth;
import com.mutualaid.repository.UserRealnameAuthRepository;
import com.mutualaid.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserRealnameAuthRepository realnameAuthRepository;

    public Page<User> getUsers(String keyword, String role, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (keyword != null && !keyword.isEmpty()) {
                predicates.add(cb.or(
                        cb.like(root.get("name"), "%" + keyword + "%"),
                        cb.like(root.get("phone"), "%" + keyword + "%")
                ));
            }
            if (role != null && !role.isEmpty()) {
                predicates.add(cb.equal(root.get("role"), role));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return userRepository.findAll(spec, pageable);
    }

    public User getUserDetail(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));
    }

    @Transactional
    public void toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        user.setStatus(user.getStatus() == 0 ? 1 : 0);
        userRepository.save(user);
    }

    public List<UserRealnameAuth> getPendingRealnameAuths() {
        return realnameAuthRepository.findByStatus("PENDING");
    }

    @Transactional
    public void reviewRealnameAuth(Long id, String status, String rejectReason) {
        UserRealnameAuth auth = realnameAuthRepository.findById(id)
                .orElseThrow(() -> new BusinessException("认证记录不存在"));
        auth.setStatus(status);
        if ("REJECTED".equals(status)) {
            auth.setRejectReason(rejectReason);
        }
        realnameAuthRepository.save(auth);
    }
}

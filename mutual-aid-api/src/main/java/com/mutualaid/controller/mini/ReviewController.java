package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.Review;
import com.mutualaid.model.entity.User;
import com.mutualaid.model.vo.ReviewVO;
import com.mutualaid.repository.ReviewRepository;
import com.mutualaid.repository.UserRepository;
import com.mutualaid.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mini/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @GetMapping("/sent")
    public ApiResponse<List<ReviewVO>> getSentReviews(@CurrentUser Long userId) {
        List<Review> reviews = reviewRepository.findByFromUserId(userId);
        return ApiResponse.success(reviews.stream().map(this::toVO).toList());
    }

    @GetMapping("/received")
    public ApiResponse<List<ReviewVO>> getReceivedReviews(@CurrentUser Long userId) {
        List<Review> reviews = reviewRepository.findByToUserId(userId);
        return ApiResponse.success(reviews.stream().map(this::toVO).toList());
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<ReviewVO>> getUserReviews(@PathVariable Long userId) {
        List<Review> reviews = reviewRepository.findByToUserId(userId);
        return ApiResponse.success(reviews.stream().map(this::toVO).toList());
    }

    private ReviewVO toVO(Review review) {
        ReviewVO vo = new ReviewVO();
        vo.setId(review.getId());
        vo.setTaskId(review.getTaskId());
        vo.setRating(review.getRating());
        vo.setComment(review.getComment());
        vo.setCreatedAt(review.getCreatedAt());
        vo.setFromUserId(review.getFromUserId());
        userRepository.findById(review.getFromUserId()).ifPresent(u -> {
            vo.setFromUserName(u.getName());
            vo.setFromUserAvatar(u.getAvatar());
        });
        return vo;
    }
}

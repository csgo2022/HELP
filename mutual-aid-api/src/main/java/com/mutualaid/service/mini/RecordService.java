package com.mutualaid.service.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.entity.PointTransaction;
import com.mutualaid.model.entity.Review;
import com.mutualaid.model.entity.ServiceRecord;
import com.mutualaid.model.entity.ServiceTask;
import com.mutualaid.model.entity.VolunteerProfile;
import com.mutualaid.repository.PointTransactionRepository;
import com.mutualaid.repository.ReviewRepository;
import com.mutualaid.repository.ServiceRecordRepository;
import com.mutualaid.repository.ServiceTaskRepository;
import com.mutualaid.repository.VolunteerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final ServiceRecordRepository recordRepository;
    private final ReviewRepository reviewRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final ServiceTaskRepository taskRepository;
    private final PointTransactionRepository pointTransactionRepository;

    public List<ServiceRecord> getMyRecords(Long volunteerId) {
        return recordRepository.findByVolunteerIdOrderByCreatedAtDesc(volunteerId);
    }

    public ServiceRecord getRecordDetail(Long id) {
        return recordRepository.findById(id)
                .orElseThrow(() -> new BusinessException("记录不存在"));
    }

    public Map<String, Object> getTodayStats(Long userId) {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        // Today's completed task hours
        List<ServiceTask> todayTasks = taskRepository
                .findByVolunteerIdAndStatusAndUpdatedAtAfter(userId, "COMPLETED", todayStart);
        BigDecimal todayHours = todayTasks.stream()
                .map(t -> t.getRewardHours() != null ? t.getRewardHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Today's earned points
        List<PointTransaction> todayPoints = pointTransactionRepository
                .findByUserIdAndTypeAndCreatedAtAfter(userId, "EARN", todayStart);
        int points = todayPoints.stream().mapToInt(PointTransaction::getAmount).sum();

        return Map.of("todayHours", todayHours, "todayPoints", points);
    }

    @Transactional
    public void submitReview(Long fromUserId, Long taskId, Long toUserId, int rating, String comment) {
        // 1. Save review
        Review review = new Review();
        review.setTaskId(taskId);
        review.setFromUserId(fromUserId);
        review.setToUserId(toUserId);
        review.setRating(rating);
        review.setComment(comment);
        reviewRepository.save(review);

        // 2. Recalculate average rating for this volunteer
        VolunteerProfile profile = volunteerProfileRepository.findByUserId(toUserId)
                .orElseThrow(() -> new BusinessException("志愿者信息不存在"));

        List<Review> allReviews = reviewRepository.findByToUserId(toUserId);
        BigDecimal sum = BigDecimal.ZERO;
        for (Review r : allReviews) {
            sum = sum.add(BigDecimal.valueOf(r.getRating()));
        }
        BigDecimal avgRating = sum.divide(BigDecimal.valueOf(allReviews.size()), 1, RoundingMode.HALF_UP);
        profile.setRating(avgRating);
        volunteerProfileRepository.save(profile);
    }
}

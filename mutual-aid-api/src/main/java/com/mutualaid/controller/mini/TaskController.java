package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.dto.CreateTaskRequest;
import com.mutualaid.model.entity.ServiceTask;
import com.mutualaid.model.vo.CompletionInfoVO;
import com.mutualaid.model.dto.ReviewRequest;
import com.mutualaid.model.entity.Review;
import com.mutualaid.model.vo.ReviewVO;
import com.mutualaid.repository.ReviewRepository;
import com.mutualaid.repository.UserRepository;
import com.mutualaid.service.mini.RecordService;
import com.mutualaid.model.vo.TaskVO;
import com.mutualaid.security.CurrentUser;
import com.mutualaid.service.mini.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mini/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final RecordService recordService;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ApiResponse<List<ServiceTask>> getAvailableTasks() {
        return ApiResponse.success(taskService.getAvailableTasks());
    }

    @GetMapping("/my")
    public ApiResponse<List<ServiceTask>> getMyTasks(@CurrentUser Long userId) {
        return ApiResponse.success(taskService.getMyTasks(userId));
    }

    @PostMapping
    public ApiResponse<ServiceTask> createTask(@CurrentUser Long userId,
                                                @Valid @RequestBody CreateTaskRequest request) {
        return ApiResponse.success(taskService.createTask(userId, request));
    }

    @GetMapping("/{id}")
    public ApiResponse<TaskVO> getTaskDetail(@PathVariable Long id) {
        return ApiResponse.success(taskService.getTaskDetail(id));
    }

    @PostMapping("/{id}/apply")
    public ApiResponse<Void> applyTask(@PathVariable Long id, @CurrentUser Long userId) {
        taskService.applyTask(id, userId);
        return ApiResponse.success();
    }

    @PostMapping("/{id}/assign")
    public ApiResponse<Void> assignVolunteer(@PathVariable Long id,
                                              @CurrentUser Long userId,
                                              @RequestBody Map<String, Long> body) {
        taskService.assignVolunteer(id, userId, body.get("volunteerId"));
        return ApiResponse.success();
    }

    @GetMapping("/{id}/applicants")
    public ApiResponse<List<com.mutualaid.model.vo.ApplicantVO>> getApplicants(
            @PathVariable Long id) {
        return ApiResponse.success(taskService.getApplicants(id));
    }

    @GetMapping("/my-applications")
    public ApiResponse<List<ServiceTask>> getMyApplications(@CurrentUser Long userId) {
        return ApiResponse.success(taskService.getMyApplications(userId));
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<Void> cancelTask(@PathVariable Long id, @CurrentUser Long userId) {
        taskService.cancelTask(id, userId);
        return ApiResponse.success();
    }

    @PostMapping("/{id}/submit-completion")
    public ApiResponse<Void> submitCompletion(@PathVariable Long id,
                                               @CurrentUser Long userId,
                                               @RequestBody Map<String, Object> body) {
        String summary = (String) body.get("summary");
        @SuppressWarnings("unchecked")
        List<String> photoUrls = (List<String>) body.get("photoUrls");
        taskService.submitCompletion(id, userId, summary, photoUrls);
        return ApiResponse.success();
    }

    @GetMapping("/{id}/completion-info")
    public ApiResponse<CompletionInfoVO> getCompletionInfo(@PathVariable Long id) {
        return ApiResponse.success(taskService.getCompletionInfo(id));
    }

    @PostMapping("/{id}/confirm")
    public ApiResponse<Void> confirmCompletion(@PathVariable Long id, @CurrentUser Long userId) {
        taskService.confirmCompletion(id, userId);
        return ApiResponse.success();
    }

    @PostMapping("/{id}/review")
    public ApiResponse<Void> submitReview(@CurrentUser Long userId,
                                          @PathVariable Long id,
                                          @RequestBody ReviewRequest request) {
        recordService.submitReview(userId, id, request.getToUserId(), request.getRating(), request.getComment());
        return ApiResponse.success();
    }

    @GetMapping("/{id}/review")
    public ApiResponse<ReviewVO> getTaskReview(@PathVariable Long id) {
        List<Review> reviews = reviewRepository.findByTaskId(id);
        if (reviews.isEmpty()) {
            return ApiResponse.success(null);
        }
        Review review = reviews.get(0);
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
        return ApiResponse.success(vo);
    }
}

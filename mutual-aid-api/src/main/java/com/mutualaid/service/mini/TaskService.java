package com.mutualaid.service.mini;

import com.mutualaid.common.exception.BusinessException;
import com.mutualaid.model.dto.CreateTaskRequest;
import com.mutualaid.model.entity.ServiceRecord;
import com.mutualaid.model.entity.ServiceTask;
import com.mutualaid.model.entity.ServiceTaskApplicant;
import com.mutualaid.model.vo.ApplicantVO;
import com.mutualaid.model.vo.TaskVO;
import com.mutualaid.model.entity.ServicePhoto;
import com.mutualaid.model.vo.CompletionInfoVO;
import com.mutualaid.model.entity.PointTransaction;
import com.mutualaid.model.entity.User;
import com.mutualaid.model.entity.VolunteerProfile;
import com.mutualaid.repository.PointTransactionRepository;
import com.mutualaid.repository.ServiceRecordRepository;
import com.mutualaid.repository.ServicePhotoRepository;
import com.mutualaid.repository.ServiceTaskApplicantRepository;
import com.mutualaid.repository.ServiceTaskRepository;
import com.mutualaid.repository.UserRepository;
import com.mutualaid.repository.VolunteerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final ServiceTaskRepository taskRepository;
    private final ServiceTaskApplicantRepository applicantRepository;
    private final UserRepository userRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final ServicePhotoRepository servicePhotoRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final ServiceRecordRepository serviceRecordRepository;
    private final LeaderboardService leaderboardService;

    public List<ServiceTask> getAvailableTasks() {
        return taskRepository.findByStatus("PENDING");
    }

    public List<ServiceTask> getMyTasks(Long requesterId) {
        return taskRepository.findByRequesterIdOrderByCreatedAtDesc(requesterId);
    }

    @Transactional
    public ServiceTask createTask(Long requesterId, CreateTaskRequest request) {
        ServiceTask task = new ServiceTask();
        task.setType(request.getType());
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setAddress(request.getAddress());
        task.setAppointmentDate(request.getAppointmentDate());
        task.setAppointmentTime(request.getAppointmentTime());
        task.setDuration(request.getDuration());
        task.setRewardHours(request.getRewardHours());
        task.setRemarks(request.getRemarks());
        task.setRequesterId(requesterId);
        task.setStatus("PENDING");
        return taskRepository.save(task);
    }

    public TaskVO getTaskDetail(Long taskId) {
        ServiceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));
        return convertToVO(task);
    }

    public List<ApplicantVO> getApplicants(Long taskId) {
        return applicantRepository.findByTaskId(taskId).stream().map(a -> {
            ApplicantVO vo = new ApplicantVO();
            vo.setId(a.getId());
            vo.setVolunteerId(a.getVolunteerId());
            vo.setStatus(a.getStatus());
            userRepository.findById(a.getVolunteerId()).ifPresent(u -> {
                vo.setName(u.getName());
                vo.setAvatar(u.getAvatar());
                vo.setPhone(u.getPhone());
            });
            volunteerProfileRepository.findByUserId(a.getVolunteerId()).ifPresent(p -> {
                vo.setTotalHours(p.getTotalHours());
                vo.setRating(p.getRating());
                vo.setServiceCount(p.getServiceCount());
                vo.setVerified(p.getVerified());
                vo.setIsGold(p.getIsGold());
            });
            return vo;
        }).toList();
    }

    @Transactional
    public void applyTask(Long taskId, Long volunteerId) {
        ServiceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));

        if (!"PENDING".equals(task.getStatus())) {
            throw new BusinessException("该任务当前不可报名");
        }

        if (applicantRepository.existsByTaskIdAndVolunteerId(taskId, volunteerId)) {
            throw new BusinessException("您已报名该任务");
        }

        ServiceTaskApplicant applicant = new ServiceTaskApplicant();
        applicant.setTaskId(taskId);
        applicant.setVolunteerId(volunteerId);
        applicant.setStatus("PENDING");
        applicantRepository.save(applicant);

        task.setStatus("MATCHING");
        taskRepository.save(task);
    }

    public List<ServiceTask> getMyApplications(Long volunteerId) {
        List<Long> taskIds = applicantRepository.findByVolunteerIdOrderByCreatedAtDesc(volunteerId)
                .stream().map(ServiceTaskApplicant::getTaskId).toList();
        if (taskIds.isEmpty()) return List.of();
        return taskRepository.findByIdIn(taskIds);
    }

    @Transactional
    public void cancelTask(Long taskId, Long requesterId) {
        ServiceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));

        if (!task.getRequesterId().equals(requesterId)) {
            throw new BusinessException("只有发布者可以取消任务");
        }

        if (!"PENDING".equals(task.getStatus()) && !"MATCHING".equals(task.getStatus())) {
            throw new BusinessException("当前状态不可取消");
        }

        task.setStatus("CANCELLED");
        taskRepository.save(task);
    }

    @Transactional
    public void assignVolunteer(Long taskId, Long requesterId, Long volunteerId) {
        ServiceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));

        if (!task.getRequesterId().equals(requesterId)) {
            throw new BusinessException("只有发布者可以选定志愿者");
        }

        task.setVolunteerId(volunteerId);
        task.setStatus("IN_PROGRESS");
        taskRepository.save(task);
    }

    @Transactional
    public void submitCompletion(Long taskId, Long volunteerId, String summary, List<String> photoUrls) {
        ServiceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));

        if (!task.getVolunteerId().equals(volunteerId)) {
            throw new BusinessException("只有指派的志愿者可以提交");
        }
        if (!"IN_PROGRESS".equals(task.getStatus())) {
            throw new BusinessException("当前状态不可提交");
        }

        if (summary != null) {
            task.setSummary(summary);
        }

        if (photoUrls != null) {
            for (String url : photoUrls) {
                ServicePhoto photo = new ServicePhoto();
                photo.setTaskId(taskId);
                photo.setImageUrl(url);
                servicePhotoRepository.save(photo);
            }
        }

        task.setStatus("PENDING_CONFIRM");
        taskRepository.save(task);
    }

    public CompletionInfoVO getCompletionInfo(Long taskId) {
        ServiceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));

        List<String> photos = servicePhotoRepository.findByTaskId(taskId)
                .stream().map(ServicePhoto::getImageUrl).toList();

        CompletionInfoVO vo = new CompletionInfoVO();
        vo.setPhotos(photos);
        vo.setSummary(task.getSummary());
        return vo;
    }

    @Transactional
    public void confirmCompletion(Long taskId, Long requesterId) {
        ServiceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("任务不存在"));

        if (!task.getRequesterId().equals(requesterId)) {
            throw new BusinessException("只有发布者可以确认完成");
        }
        if (!"PENDING_CONFIRM".equals(task.getStatus())) {
            throw new BusinessException("当前状态不可确认");
        }

        task.setStatus("COMPLETED");
        taskRepository.save(task);

        // 自动为志愿者增加服务时长和积分
        Long volunteerId = task.getVolunteerId();
        if (volunteerId != null) {
            BigDecimal rewardHours = task.getRewardHours() != null ? task.getRewardHours() : BigDecimal.ZERO;

            VolunteerProfile profile = volunteerProfileRepository.findByUserId(volunteerId)
                    .orElseThrow(() -> new BusinessException("志愿者信息不存在"));
            profile.setServiceCount(profile.getServiceCount() + 1);
            profile.setTotalHours(profile.getTotalHours().add(rewardHours));
            volunteerProfileRepository.save(profile);
            leaderboardService.clearCache();

            // 1 小时 = 10 积分
            int pointsToAdd = rewardHours.multiply(BigDecimal.TEN).intValue();
            if (pointsToAdd > 0) {
                User user = userRepository.findById(volunteerId)
                        .orElseThrow(() -> new BusinessException("用户不存在"));
                user.setPoints(user.getPoints() + pointsToAdd);
                userRepository.save(user);

                PointTransaction pt = new PointTransaction();
                pt.setUserId(volunteerId);
                pt.setType("EARN");
                pt.setAmount(pointsToAdd);
                pt.setBalanceAfter(user.getPoints());
                pt.setReferenceType("TASK");
                pt.setReferenceId(taskId);
                pointTransactionRepository.save(pt);
            }


            // 写入 ServiceRecord
            ServiceRecord record = new ServiceRecord();
            record.setTaskId(taskId);
            record.setVolunteerId(volunteerId);
            record.setTitle(task.getTitle());
            record.setTime(LocalDateTime.now());
            record.setLocation(task.getAddress());
            record.setDuration(task.getRewardHours() != null ? task.getRewardHours().toString() : null);
            record.setStatus("COMPLETED");
            record.setSummary(task.getSummary());
            userRepository.findById(task.getRequesterId()).ifPresent(u -> record.setClient(u.getName()));
            serviceRecordRepository.save(record);
        }
    }

    private TaskVO convertToVO(ServiceTask task) {
        TaskVO vo = new TaskVO();
        vo.setId(task.getId());
        vo.setType(task.getType());
        vo.setTitle(task.getTitle());
        vo.setDescription(task.getDescription());
        vo.setAddress(task.getAddress());
        vo.setStatus(task.getStatus());
        vo.setAppointmentDate(task.getAppointmentDate());
        vo.setAppointmentTime(task.getAppointmentTime());
        vo.setDuration(task.getDuration());
        vo.setRewardHours(task.getRewardHours());
        vo.setCreatedAt(task.getCreatedAt());

        userRepository.findById(task.getRequesterId()).ifPresent(u -> vo.setRequesterName(u.getName()));
        if (task.getVolunteerId() != null) {
            vo.setVolunteerId(task.getVolunteerId());
            userRepository.findById(task.getVolunteerId()).ifPresent(u -> {
                vo.setVolunteerName(u.getName());
                vo.setVolunteerAvatar(u.getAvatar());
                vo.setVolunteerPhone(u.getPhone());
            });
            volunteerProfileRepository.findByUserId(task.getVolunteerId()).ifPresent(p -> {
                vo.setVolunteerRating(p.getRating() != null ? p.getRating().intValue() : 0);
                vo.setVolunteerServiceCount(p.getServiceCount() != null ? p.getServiceCount() : 0);
            });
        }

        long applicantCount = applicantRepository.findByTaskId(task.getId()).size();
        vo.setApplicantCount((int) applicantCount);

        return vo;
    }
}

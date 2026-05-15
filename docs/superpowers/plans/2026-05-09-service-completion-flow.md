# 服务完成流程 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 实现完整的服务完成流程：志愿者上传服务照片+小结 → 老人查看并确认 → 老人评分 → 志愿者获得积分

**Architecture:** 后端新增 service_photo 表 + PENDING_CONFIRM 状态 + 3 个新端点，改造现有 review 端点联动积分发放。志愿者端新增提交完成页，老人端增加照片预览和确认按钮。

**Tech Stack:** Spring Boot 3.2.5, JPA, MySQL, Flyway, 阿里云 OSS, 微信小程序

---

### Task 1: Flyway 迁移 + ServicePhoto 实体 + Repository

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\resources\db\migration\V3__add_service_photo.sql`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\ServicePhoto.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\ServicePhotoRepository.java`
- Modify: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\ServiceTask.java`

- [ ] **Step 1: 创建 Flyway 迁移文件 V3__add_service_photo.sql**

```sql
-- 服务照片表
CREATE TABLE `service_photo` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `task_id` BIGINT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`task_id`) REFERENCES `service_task`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ServiceTask 增加 summary 字段
ALTER TABLE `service_task` ADD COLUMN `summary` TEXT DEFAULT NULL AFTER `remarks`;
```

- [ ] **Step 2: 创建 ServicePhoto 实体**

```java
package com.mutualaid.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "service_photo")
public class ServicePhoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id", nullable = false)
    private Long taskId;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

- [ ] **Step 3: 创建 ServicePhotoRepository**

```java
package com.mutualaid.repository;

import com.mutualaid.model.entity.ServicePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServicePhotoRepository extends JpaRepository<ServicePhoto, Long> {
    List<ServicePhoto> findByTaskId(Long taskId);
}
```

- [ ] **Step 4: ServiceTask 添加 summary 字段**

```java
// 在 remarks 字段之后添加：
@Column(columnDefinition = "TEXT")
private String summary;
```

- [ ] **Step 5: 创建 CompletionInfoVO**

```java
package com.mutualaid.model.vo;

import lombok.Data;
import java.util.List;

@Data
public class CompletionInfoVO {
    private List<String> photos;
    private String summary;
}
```

### Task 2: 后端 Service 层 — submitCompletion + getCompletionInfo + confirmCompletion

**Files:**
- Modify: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\TaskService.java`

TaskService 注入 ServicePhotoRepository 和 OssUploadService，新增三个方法：

- [ ] **Step 1: 注入新依赖**

```java
// 在 TaskService 现有注入后添加：
private final ServicePhotoRepository servicePhotoRepository;
```

- [ ] **Step 2: submitCompletion 方法（接收照片 URL 列表 + 备注）**

```java
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
```

- [ ] **Step 3: getCompletionInfo 方法**

```java
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
```

- [ ] **Step 4: confirmCompletion 方法**

```java
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
}
```

### Task 3: 后端 Controller 端点

**Files:**
- Modify: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\TaskController.java`

- [ ] **Step 1: 添加三个新端点**

```java
// 需要 import:
import java.util.Map;
import java.util.List;

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
```

### Task 4: 后端 Review + 奖励发放

**Files:**
- Modify: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\RecordService.java`
- Modify: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\RecordController.java`

- [ ] **Step 1: RecordService 注入新依赖**

```java
// 在现有注入后添加：
private final ServiceTaskRepository taskRepository;
private final VolunteerProfileRepository volunteerProfileRepository;
private final UserRepository userRepository;
private final PointTransactionRepository pointTransactionRepository;
```

- [ ] **Step 2: 改造 submitReview 方法添加奖励发放**

```java
@Transactional
public void submitReview(Long fromUserId, Long taskId, Long toUserId, int rating, String comment) {
    // 1. 保存评价
    Review review = new Review();
    review.setTaskId(taskId);
    review.setFromUserId(fromUserId);
    review.setToUserId(toUserId);
    review.setRating(rating);
    review.setComment(comment);
    reviewRepository.save(review);

    // 2. 获取任务奖励时长
    ServiceTask task = taskRepository.findById(taskId)
            .orElseThrow(() -> new BusinessException("任务不存在"));
    BigDecimal rewardHours = task.getRewardHours() != null ? task.getRewardHours() : BigDecimal.ZERO;

    // 3. 更新志愿者档案
    VolunteerProfile profile = volunteerProfileRepository.findByUserId(toUserId)
            .orElseThrow(() -> new BusinessException("志愿者信息不存在"));
    profile.setServiceCount(profile.getServiceCount() + 1);
    profile.setTotalHours(profile.getTotalHours().add(rewardHours));

    // 4. 重新计算平均评分
    List<Review> allReviews = reviewRepository.findByToUserId(toUserId);
    BigDecimal sum = BigDecimal.ZERO;
    for (Review r : allReviews) {
        sum = sum.add(BigDecimal.valueOf(r.getRating()));
    }
    BigDecimal avgRating = sum.divide(BigDecimal.valueOf(allReviews.size()), 1, RoundingMode.HALF_UP);
    profile.setRating(avgRating);
    volunteerProfileRepository.save(profile);

    // 5. 发放积分（1小时 = 10积分）
    int pointsToAdd = rewardHours.multiply(BigDecimal.TEN).intValue();
    if (pointsToAdd > 0) {
        User user = userRepository.findById(toUserId)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        user.setPoints(user.getPoints() + pointsToAdd);
        userRepository.save(user);

        PointTransaction pt = new PointTransaction();
        pt.setUserId(toUserId);
        pt.setType("EARN");
        pt.setAmount(pointsToAdd);
        pt.setBalanceAfter(user.getPoints());
        pt.setReferenceType("TASK");
        pt.setReferenceId(taskId);
        pointTransactionRepository.save(pt);
    }
}
```

- [ ] **Step 3: 更新 RecordController.submitReview 方法**

当前方法接收 `@PathVariable Long id`（recordId），但 ReviewService 需要 taskId。更新 Controller 传递参数：

```java
@PostMapping("/{id}/review")
public ApiResponse<Void> submitReview(@CurrentUser Long userId,
                                      @PathVariable Long id,
                                      @RequestBody ReviewRequest request) {
    // id 是 recordId，但实际需要 taskId
    recordService.submitReview(userId, request.getTaskId(), request.getToUserId(), request.getRating(), request.getComment());
    return ApiResponse.success();
}
```

注意：去除 `@Valid` 如果 ReviewRequest 验证导致问题，或者确保 ReviewRequest 的字段验证正确。

### Task 5: 志愿者端 API + 提交完成页面

**Files:**
- Modify: `D:\互助养老3\互助养老小程序\utils\api.js`
- Create: `D:\互助养老3\互助养老小程序\pages\submit-completion\submit-completion.js`
- Create: `D:\互助养老3\互助养老小程序\pages\submit-completion\submit-completion.wxml`
- Create: `D:\互助养老3\互助养老小程序\pages\submit-completion\submit-completion.wxss`
- Create: `D:\互助养老3\互助养老小程序\pages\submit-completion\submit-completion.json`

- [ ] **Step 1: api.js 新增方法**

```js
// 在 getMyApplications 后添加：
submitCompletion(taskId, data) { return req.post(`/tasks/${taskId}/submit-completion`, data); },
getCompletionInfo(taskId) { return req.get(`/tasks/${taskId}/completion-info`); },
uploadTempFile(filePath) { return req.uploadFile('/upload', filePath); },
```

注意：需要后端添加一个通用文件上传端点 `POST /api/mini/upload`，用于前端先上传照片获取 URL。

- [ ] **Step 2: 后端新增通用文件上传端点**

在 `TaskController` 或新建 `UploadController`：

```java
@RestController
@RequestMapping("/api/mini")
@RequiredArgsConstructor
public class UploadController {

    private final OssUploadService ossUploadService;

    @PostMapping("/upload")
    public ApiResponse<String> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        String url = ossUploadService.uploadAvatar(file);
        return ApiResponse.success(url);
    }
}
```

- [ ] **Step 2: request.js 新增 uploadFiles 方法**

```js
function uploadFiles(url, filePaths, formData) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    const header = {};
    if (token) header['Authorization'] = `Bearer ${token}`;

    // 微信小程序不支持多文件同时上传，逐个上传后提交
    let uploaded = [];
    let index = 0;
    function uploadNext() {
      if (index >= filePaths.length) {
        // 全部上传完成，额外提交 summary
        if (formData && formData.summary) {
          // summary 通过单独的请求提交
        }
        resolve(uploaded);
        return;
      }
      wx.uploadFile({
        url: `${app.globalData.apiBaseUrl}${url}`,
        filePath: filePaths[index],
        name: 'files',
        header,
        formData: { summary: formData.summary || '' },
        success(res) {
          try {
            const body = JSON.parse(res.data);
            if (body.code === 200) {
              uploaded.push(body.data);
              index++;
              uploadNext();
            } else {
              reject(new Error(body.message || '上传失败'));
            }
          } catch (e) {
            reject(new Error('上传响应解析失败'));
          }
        },
        fail(err) {
          reject(new Error('网络错误'));
        }
      });
    }
    uploadNext();
  });
}
```

实际上，更简单的方式是单次上传携带 summary（微信小程序 uploadFile 不支持多 file 字段）。改为循环调用 uploadFile，每张图片单独上传，summary 放在最后一张或第一张的 formData 中。

更简单的实现：直接复用现有的 `req.uploadFile`（单文件），在页面中循环上传。

- [ ] **Step 3: 创建 submit-completion.json**

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "提交服务完成"
}
```

- [ ] **Step 4: 创建 submit-completion.wxml**

```xml
<top-app-bar title="提交服务完成" showBack="{{true}}"></top-app-bar>

<view class="completion-content">
  <view class="section">
    <text class="section-title">服务照片</text>
    <text class="section-desc">上传服务过程中的照片（最多9张）</text>
    <view class="photo-grid">
      <view class="photo-item" wx:for="{{photos}}" wx:key="index">
        <image class="photo-img" src="{{item}}" mode="aspectFill" />
        <view class="photo-remove" data-index="{{index}}" bindtap="removePhoto">✕</view>
      </view>
      <view class="photo-add" wx:if="{{photos.length < 9}}" bindtap="chooseImage">
        <text class="photo-add-icon">+</text>
        <text class="photo-add-text">添加照片</text>
      </view>
    </view>
  </view>

  <view class="section">
    <text class="section-title">服务小结</text>
    <text class="section-desc">描述服务过程和结果（选填）</text>
    <textarea class="summary-input" placeholder="请描述本次服务的内容和结果..." value="{{summary}}" bindinput="onSummaryInput" maxlength="500" />
    <text class="char-count">{{summary.length}}/500</text>
  </view>
</view>

<view class="bottom-bar">
  <view class="bottom-bar-inner">
    <button class="submit-btn" bindtap="submitCompletion" disabled="{{submitting}}">
      {{submitting ? '提交中...' : '提交完成'}}
    </button>
  </view>
</view>
```

- [ ] **Step 5: 创建 submit-completion.wxss**

```css
.completion-content {
  padding: 32rpx 40rpx 200rpx;
  max-width: 700rpx;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 48rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  margin-bottom: 12rpx;
}

.section-desc {
  font-size: 24rpx;
  color: #8c8c8c;
  display: block;
  margin-bottom: 24rpx;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.photo-item {
  width: 200rpx;
  height: 200rpx;
  position: relative;
}

.photo-img {
  width: 100%;
  height: 100%;
  border-radius: 24rpx;
  object-fit: cover;
}

.photo-remove {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.photo-add {
  width: 200rpx;
  height: 200rpx;
  border: 4rpx dashed #d4d4d4;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: #fafafa;
}

.photo-add-icon {
  font-size: 56rpx;
  color: #a1a1aa;
  line-height: 1;
}

.photo-add-text {
  font-size: 22rpx;
  color: #a1a1aa;
}

.summary-input {
  width: 100%;
  height: 240rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
  padding: 32rpx;
  font-size: 28rpx;
  line-height: 1.6;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #a1a1aa;
  margin-top: 8rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-top: 2rpx solid rgba(0,0,0,0.04);
  padding: 32rpx 40rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  z-index: 50;
}

.bottom-bar-inner {
  max-width: 700rpx;
  margin: 0 auto;
}

.submit-btn {
  width: 100%;
  height: 112rpx;
  background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  color: white;
  font-size: 34rpx;
  font-weight: 700;
  border-radius: 36rpx;
  border: none;
  box-shadow: 0 12rpx 32rpx rgba(255, 107, 53, 0.25);
  line-height: 112rpx;
}

.submit-btn:active { transform: scale(0.97); }
.submit-btn[disabled] { opacity: 0.6; }
```

- [ ] **Step 6: 创建 submit-completion.js**

```js
const api = require('../../utils/api');

Page({
  data: {
    taskId: '',
    photos: [],
    tempFiles: [],
    summary: '',
    submitting: false
  },

  onLoad(options) {
    this.setData({ taskId: options.id || '' });
  },

  chooseImage() {
    wx.chooseImage({
      count: 9 - this.data.photos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = [...this.data.tempFiles, ...res.tempFilePaths];
        const photos = tempFiles.map(p => p);
        this.setData({ tempFiles, photos: tempFiles });
      }
    });
  },

  removePhoto(e) {
    const index = e.currentTarget.dataset.index;
    const tempFiles = [...this.data.tempFiles];
    tempFiles.splice(index, 1);
    this.setData({ tempFiles, photos: tempFiles });
  },

  onSummaryInput(e) {
    this.setData({ summary: e.detail.value });
  },

  async submitCompletion() {
    const { taskId, tempFiles, summary } = this.data;
    if (tempFiles.length === 0) {
      wx.showToast({ title: '请至少上传一张照片', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: '上传照片中...', mask: true });

    try {
      // 1. 逐个上传照片到 OSS，获取 URL
      const photoUrls = [];
      for (const filePath of tempFiles) {
        const url = await api.uploadTempFile(filePath);
        photoUrls.push(url);
      }

      wx.showLoading({ title: '提交中...', mask: true });

      // 2. 调用 submit-completion 提交所有照片 URL + 小结
      await api.submitCompletion(taskId, {
        photoUrls,
        summary: summary || ''
      });

      wx.hideLoading();
      wx.showToast({ title: '提交成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (e) {
      wx.hideLoading();
      this.setData({ submitting: false });
      wx.showToast({ title: e.message || '提交失败', icon: 'none' });
    }
  }
});
```

### Task 6: 志愿者端 service-detail + records 状态适配

**Files:**
- Modify: `D:\互助养老3\互助养老小程序\pages\service-detail\service-detail.js`
- Modify: `D:\互助养老3\互助养老小程序\pages\service-detail\service-detail.wxml`
- Modify: `D:\互助养老3\互助养老小程序\pages\records\records.js`

- [ ] **Step 1: service-detail.js 增加 PENDING_CONFIRM 状态处理**

```js
// 在 mapStatus 函数中增加：
case 'PENDING_CONFIRM': return { text: '待确认', cls: 'pending_confirm' };
```

- [ ] **Step 2: service-detail.wxml 中 IN_PROGRESS 状态显示"完成服务"按钮**

将底部按钮从仅 PENDING/MATCHING 显示改为：
- PENDING/MATCHING → "立即报名"
- IN_PROGRESS → "完成服务"
- PENDING_CONFIRM → 显示"已提交，等待老人确认"

```xml
<view class="bottom-bar" wx:if="{{task.status === 'PENDING' || task.status === 'MATCHING'}}">
  <view class="bottom-bar-inner">
    <view class="signup-big-btn" bindtap="onSignup">
      <image class="handshake-icon" src="/images/icons/volunteer.svg" mode="aspectFit" />
      <text>立即报名</text>
    </view>
  </view>
</view>

<view class="bottom-bar" wx:elif="{{task.status === 'IN_PROGRESS'}}">
  <view class="bottom-bar-inner">
    <view class="signup-big-btn" bindtap="onCompleteService">
      <image class="handshake-icon" src="/images/icons/check-circle.svg" mode="aspectFit" />
      <text>完成服务</text>
    </view>
  </view>
</view>

<view class="bottom-bar bottom-bar-info" wx:elif="{{task.status === 'PENDING_CONFIRM'}}">
  <view class="bottom-bar-inner">
    <text class="pending-confirm-text">已提交完成信息，等待老人确认</text>
  </view>
</view>
```

- [ ] **Step 3: service-detail.js 添加 onCompleteService 方法**

```js
onCompleteService() {
  const { id } = this.data;
  if (!id) return;
  wx.navigateTo({ url: `/pages/submit-completion/submit-completion?id=${id}` });
},
```

- [ ] **Step 4: service-detail.wxss 添加 pending-confirm-text 样式**

```css
.bottom-bar-info {
  justify-content: center;
}

.pending-confirm-text {
  font-size: 28rpx;
  color: #ff8c42;
  font-weight: 600;
  text-align: center;
  display: block;
  padding: 20rpx 0;
}
```

- [ ] **Step 5: records.js 增加 PENDING_CONFIRM 状态显示**

```js
// 在 application 状态映射中增加：
case 'PENDING_CONFIRM': statusText = '待确认'; break;
```

同时可以通过修改 API 调用获取已报名任务列表时传入状态，或在 records.js 的 onLoad 中额外获取自己的进行中任务。

### Task 7: 老人端 API + 照片预览 + 确认按钮

**Files:**
- Modify: `D:\互助养老3\互助养老（老人端）\utils\api.js`
- Modify: `D:\互助养老3\互助养老（老人端）\pages\service_detail\service_detail.js`
- Modify: `D:\互助养老3\互助养老（老人端）\pages\service_detail\service_detail.wxml`

- [ ] **Step 1: api.js 新增方法**

```js
getCompletionInfo(taskId) { return req.get(`/tasks/${taskId}/completion-info`); },
confirmTask(taskId) { return req.post(`/tasks/${taskId}/confirm`); },
```

- [ ] **Step 2: service_detail.js 修改状态映射**

```js
// 修改 status 映射行
status: task.status === 'COMPLETED' ? 'completed' : task.status === 'CANCELLED' ? 'cancelled' : task.status === 'PENDING_CONFIRM' ? 'pending_confirm' : (task.status === 'IN_PROGRESS' || task.volunteerId ? 'in_progress' : 'waiting'),
```

- [ ] **Step 3: service_detail.js 添加加载完成信息和确认方法**

```js
async loadCompletionInfo() {
  try {
    const info = await api.getCompletionInfo(this.data.record.id);
    this.setData({ completionInfo: info });
  } catch (_) {}
},

async onConfirmCompletion() {
  try {
    const confirmed = await new Promise(resolve => {
      wx.showModal({
        title: '确认完成',
        content: '请确认志愿者已完成服务？',
        success: (res) => resolve(res.confirm)
      });
    });
    if (!confirmed) return;

    wx.showLoading({ title: '确认中...' });
    await api.confirmTask(this.data.record.id);
    wx.hideLoading();

    // 跳转到评价页面
    wx.navigateTo({
      url: `/pages/review/review?taskId=${this.data.record.id}&toUserId=${this.data.record.volunteer.id}`
    });
  } catch (e) {
    wx.hideLoading();
    wx.showToast({ title: e.message || '操作失败', icon: 'none' });
  }
},
```

在 onLoad 中，当状态为 PENDING_CONFIRM 时调用 loadCompletionInfo。

- [ ] **Step 4: service_detail.wxml 增加 PENDING_CONFIRM 展示**

在 volunteer-section 之后，增加照片预览区域：

```xml
<!-- Pending Confirm: Photos + Summary -->
<block wx:if="{{record.status === 'pending_confirm' && completionInfo}}">
  <view class="photo-section">
    <view class="section-label">服务照片</view>
    <scroll-view class="photo-scroll" scroll-x="{{true}}" show-scrollbar="{{false}}">
      <image class="photo-thumb" wx:for="{{completionInfo.photos}}" wx:key="index"
             src="{{item}}" mode="aspectFill" bindtap="previewPhoto" data-url="{{item}}" />
    </scroll-view>
    <text class="summary-text" wx:if="{{completionInfo.summary}}">{{completionInfo.summary}}</text>
  </view>

  <button class="confirm-btn" bindtap="onConfirmCompletion">确认完成</button>
</block>
```

- [ ] **Step 5: 添加 previewPhoto 方法**

```js
previewPhoto(e) {
  const url = e.currentTarget.dataset.url;
  wx.previewImage({ urls: this.data.completionInfo.photos, current: url });
},
```

- [ ] **Step 6: service_detail.wxss 添加新样式**

```css
.photo-section {
  background: #fff;
  border-radius: 48rpx;
  padding: 40rpx;
  margin: 32rpx 0;
  box-shadow: 0 8rpx 24rpx -8rpx rgba(0,0,0,0.06);
}

.section-label {
  font-size: 28rpx;
  font-weight: 700;
  margin-bottom: 24rpx;
  display: block;
}

.photo-scroll {
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  padding-bottom: 16rpx;
}

.photo-thumb {
  width: 200rpx;
  height: 200rpx;
  border-radius: 24rpx;
  margin-right: 16rpx;
  display: inline-block;
  flex-shrink: 0;
}

.summary-text {
  display: block;
  font-size: 26rpx;
  color: #52525b;
  line-height: 1.6;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #f0f0f0;
}

.confirm-btn {
  width: 100%;
  height: 112rpx;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #fff;
  border-radius: 48rpx;
  font-size: 34rpx;
  font-weight: 700;
  border: none;
  line-height: 112rpx;
  box-shadow: 0 12rpx 32rpx rgba(22, 163, 74, 0.25);
  margin: 32rpx 0;
}

.confirm-btn:active { transform: scale(0.96); }
```

### Task 8: 老人端 records 状态适配

**Files:**
- Modify: `D:\互助养老3\互助养老（老人端）\pages\records\records.js`
- Modify: `D:\互助养老3\互助养老（老人端）\pages\records\records.wxml`

- [ ] **Step 1: records.js mapStatus 增加 PENDING_CONFIRM**

```js
case 'PENDING_CONFIRM': return 'pending_confirm';
```

- [ ] **Step 2: filterRecords 调整——PENDING_CONFIRM 归入 active 标签**

```js
filterRecords() {
  const filtered = this.data.records.filter(r => {
    if (this.data.tab === 'active') return r.status !== 'completed' && r.status !== 'cancelled';
    if (this.data.tab === 'completed') return r.status === 'completed';
    return false;
  });
  this.setData({ filteredRecords: filtered });
},
```

（无需改动——PENDING_CONFIRM 不是 completed/cancelled，自然显示在 active 中）

- [ ] **Step 3: records.wxml 增加 pending_confirm 状态中文显示**

```xml
<text wx:elif="{{item.status === 'pending_confirm'}}">待确认</text>
```

### Task 9: goDetail 逻辑调整

**Files:**
- Modify: `D:\互助养老3\互助养老（老人端）\pages\records\records.js`
- Modify: `D:\互助养老3\互助养老小程序\pages\records\records.js`

- [ ] **Step 1: 老人端 goDetail 允许点击 pending_confirm**

当前老人端 `goDetail` 限制 `record.status !== 'completed' && record.status !== 'cancelled'`，PENDING_CONFIRM 状态默认允许进入详情，无需改动。

- [ ] **Step 2: 志愿者端 records 增加 PENDING_CONFIRM 状态显示**

```js
// 在 application 状态映射区域增加
const statusText = a.status === 'PENDING' ? '待审核' : a.status === 'MATCHING' ? '匹配中' : a.status === 'IN_PROGRESS' ? '进行中' : a.status === 'PENDING_CONFIRM' ? '待确认' : a.status || '';
```

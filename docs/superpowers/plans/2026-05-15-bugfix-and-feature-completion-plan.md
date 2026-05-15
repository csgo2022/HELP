# 互助养老项目 — BUG修复与功能补全 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复9项现存问题：通知系统、忘记密码、账户注销、ServiceRecord写入、排行榜缓存、积分兑换率、FAB按钮、后台字段不匹配

**Architecture:** 后端Spring Boot新增Notification实体/API/服务，TaskService中植入通知创建和ServiceRecord写入逻辑；LeaderboardService加Spring Cache+Caffeine缓存；UserService新增重置密码和注销接口。两个微信小程序加忘记密码页面、账户注销入口、通知轮询。管理后台修UserListView模板字段绑定。

**Tech Stack:** Java 17, Spring Boot 3.2.5, Spring Cache + Caffeine, Vue 3 + Element Plus, WeChat Mini-Program

---

### Task 1: 后端 — 新增Notification实体和Repository

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\model\entity\Notification.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\NotificationRepository.java`

- [ ] **Step 1: 创建 Notification 实体**

```java
package com.mutualaid.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 30)
    private String type;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String content;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

- [ ] **Step 2: 创建 NotificationRepository**

```java
package com.mutualaid.repository;

import com.mutualaid.model.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByUserIdAndIsReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId")
    void markAllAsRead(@Param("userId") Long userId);

    List<Notification> findByUserIdAndIsReadFalse(Long userId);
}
```

---

### Task 2: 后端 — 新增 NotificationService 和 NotificationController

**Files:**
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\NotificationService.java`
- Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\NotificationController.java`

- [ ] **Step 1: 创建 NotificationService**

```java
package com.mutualaid.service.mini;

import com.mutualaid.model.entity.Notification;
import com.mutualaid.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Page<Notification> getNotifications(Long userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("通知不存在"));
        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作该通知");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void createNotification(Long userId, String type, String title, String content, Long referenceId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setReferenceId(referenceId);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }
}
```

- [ ] **Step 2: 创建 NotificationController**

```java
package com.mutualaid.controller.mini;

import com.mutualaid.common.response.ApiResponse;
import com.mutualaid.model.entity.Notification;
import com.mutualaid.security.CurrentUser;
import com.mutualaid.service.mini.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mini/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<Page<Notification>> getNotifications(@CurrentUser Long userId,
                                                             @RequestParam(defaultValue = "0") int page,
                                                             @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(notificationService.getNotifications(userId, page, size));
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> getUnreadCount(@CurrentUser Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ApiResponse.success(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@CurrentUser Long userId, @PathVariable Long id) {
        notificationService.markAsRead(id, userId);
        return ApiResponse.success();
    }

    @PutMapping("/read-all")
    public ApiResponse<Void> markAllAsRead(@CurrentUser Long userId) {
        notificationService.markAllAsRead(userId);
        return ApiResponse.success();
    }
}
```

---

### Task 3: 后端 — TaskService 中植入通知创建 + ServiceRecord 写入

**Files:**
- Modify: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\TaskService.java`

- [ ] **Step 1: 在 TaskService 的 assignVolunteer 方法中添加通知**

在 `assignVolunteer()` 方法末尾（`taskRepository.save(task)` 之后），给志愿者创建通知：

```java
// 通知被分配的志愿者
notificationService.createNotification(
    volunteerId,
    "TASK_ASSIGNED",
    "您被分配了新任务",
    "任务「" + task.getTitle() + "」已分配给到您，请及时处理",
    taskId
);
```

需要在类的字段注入中增加 `NotificationService` 依赖：

```java
private final NotificationService notificationService;
```

- [ ] **Step 2: 在 applyTask() 方法中添加通知**

在 `applicantRepository.save(applicant)` 之后，通知任务发布者有人报名：

```java
// 通知任务发布者有人报名
notificationService.createNotification(
    task.getRequesterId(),
    "TASK_APPLIED",
    "有新志愿者报名",
    "志愿者已报名您的任务「" + task.getTitle() + "」，请前往确认",
    taskId
);
```

- [ ] **Step 3: 在 confirmCompletion() 中添加通知 + ServiceRecord 写入**

在积分增加逻辑（`pointTransactionRepository.save(pt)`）之后，添加通知：

```java
// 通知任务完成
notificationService.createNotification(
    task.getRequesterId(),
    "TASK_COMPLETED",
    "任务已完成",
    "任务「" + task.getTitle() + "」已完成，感谢您的信任",
    taskId
);
notificationService.createNotification(
    volunteerId,
    "TASK_COMPLETED",
    "服务已完成",
    "您完成的任务「" + task.getTitle() + "」已获确认，积分已到账",
    taskId
);
```

接着添加 ServiceRecord 写入逻辑（在积分逻辑之后）：

```java
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
// 设置 client 为任务发布者姓名
userRepository.findById(task.getRequesterId()).ifPresent(u -> record.setClient(u.getName()));
serviceRecordRepository.save(record);
```

需要在类字段中添加 `ServiceRecordRepository`：

```java
private final ServiceRecordRepository serviceRecordRepository;
```

并添加 import：
```java
import com.mutualaid.model.entity.ServiceRecord;
import com.mutualaid.repository.ServiceRecordRepository;
import com.mutualaid.service.mini.NotificationService;
import java.time.LocalDateTime;
```

- [ ] **Step 4: 引入所需的 import**

确保 TaskService.java 顶部添加这些 import：
```java
import com.mutualaid.model.entity.ServiceRecord;
import com.mutualaid.repository.ServiceRecordRepository;
import com.mutualaid.service.mini.NotificationService;
import java.time.LocalDateTime;
```

---

### Task 4: 后端 — 密码重置 + 账户注销

**Files:**
- Modify: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\UserService.java`
- Modify: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\UserController.java`
- Modify: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\AuthService.java`

- [ ] **Step 1: UserService 添加 resetPassword 和 deleteAccount**

```java
@Transactional
public void resetPassword(String phone, String newPassword) {
    User user = userRepository.findByPhone(phone)
            .orElseThrow(() -> new BusinessException("该手机号未注册"));
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);
}

@Transactional
public void deleteAccount(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("用户不存在"));
    // 软删除：status = 2
    user.setStatus(2);
    userRepository.save(user);
}
```

需要注入 `ElderlyFamilyRepository`、`AddressRepository` 等来清理关联数据。在 UserService 顶部添加字段：

```java
private final ElderlyFamilyRepository elderlyFamilyRepository;
private final AddressRepository addressRepository;
```

并添加清理逻辑到 deleteAccount（在 `user.setStatus(2)` 之前）：

```java
// 清理关联数据
elderlyFamilyRepository.deleteByUserId(userId);
addressRepository.deleteByUserId(userId);
```

检查这些 Repository 是否有对应方法。如果没有，需要添加。

- [ ] **Step 2: UserController 添加重置密码和注销端点**

```java
@PutMapping("/reset-password")
public ApiResponse<Void> resetPassword(@RequestBody Map<String, String> body) {
    userService.resetPassword(body.get("phone"), body.get("newPassword"));
    return ApiResponse.success();
}

@DeleteMapping("/account")
public ApiResponse<Void> deleteAccount(@CurrentUser Long userId) {
    userService.deleteAccount(userId);
    return ApiResponse.success();
}
```

- [ ] **Step 3: AuthService 登录时拦截 status=2 的已注销用户**

在 `AuthService.login()` 中，在 `status == 1` 的检查之后加入：

```java
if (user.getStatus() == 2) {
    throw new BusinessException("账号已注销");
}
```

---

### Task 5: 后端 — 排行榜缓存 + 积分兑换率 API

**Files:**
- Modify: `D:\互助养老3\mutual-aid-api\pom.xml` (加 caffeine 依赖)
- Modify: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\service\mini\LeaderboardService.java`
- Modify: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\controller\mini\MallController.java` (或新建 MallService)

- [ ] **Step 1: pom.xml 添加 Spring Cache + Caffeine 依赖**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

- [ ] **Step 2: 添加 Spring Boot 缓存配置类**

Create: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\config\CacheConfig.java`

```java
package com.mutualaid.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("leaderboard");
        manager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(10));
        return manager;
    }
}
```

- [ ] **Step 3: LeaderboardService 添加 @Cacheable**

```java
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@Cacheable(value = "leaderboard", key = "#period != null ? #period : 'all'")
public List<Map<String, Object>> getLeaderboard(String period) {
    // 原有实现保持不变
}
```

- [ ] **Step 4: 在 VolunteerProfile 更新时清除排行榜缓存**

在 `TaskService.confirmCompletion()` 中，更新 `volunteerProfileRepository.save(profile)` 之后添加缓存清除：

```java
// 在 confirmCompletion 方法中，profile 保存之后
clearLeaderboardCache();
```

需要在 TaskService 中注入 `CacheManager` 或使用 `@CacheEvict`。更简单的方式：在 LeaderboardService 中加一个 evict 方法：

```java
@CacheEvict(value = "leaderboard", allEntries = true)
public void clearCache() {
    // 空方法，注解生效
}
```

然后在 TaskService 中注入 LeaderboardService 并调用 `leaderboardService.clearCache()`。

- [ ] **Step 5: 积分兑换率 API**

创建 mall service 方法或使用已有的 MallService。已有 MallController，看看是否已有 rates 方法。

查看当前 MallController：
- `GET /point-mall/products` — 获取商品列表
- `GET /point-mall/balance` — 获取积分余额

添加新端点。如果已有 `MallService`，在其中添加：

```java
// 在 MallService 中
private final SysConfigRepository sysConfigRepository;

public Map<String, Object> getExchangeRate() {
    // 从 sys_config 表读取 exchange_rate
    // 默认值 1小时=10积分
    Integer rate = 10; // 默认
    SysConfig config = sysConfigRepository.findByConfigKey("point_exchange_rate");
    if (config != null && config.getConfigValue() != null) {
        try {
            rate = Integer.parseInt(config.getConfigValue());
        } catch (NumberFormatException ignored) {}
    }
    return Map.of("hoursPerPoint", 1.0 / rate, "pointsPerHour", rate);
}
```

在 MallController 中添加：

```java
@GetMapping("/exchange-rate")
public ApiResponse<Map<String, Object>> getExchangeRate() {
    return ApiResponse.success(mallService.getExchangeRate());
}
```

需要注入 `SysConfigRepository`。检查是否已存在。

```java
// 在 MallService 中已注入
private final SysConfigRepository sysConfigRepository;
```

---

### Task 6: 后端 — 清理关联数据的 Repository 方法补全

**Files:**
- Modify: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\ElderlyFamilyRepository.java`
- Modify: `D:\互助养老3\mutual-aid-api\src\main\java\com\mutualaid\repository\AddressRepository.java`

检查这两个 repository，如果没有 `deleteByUserId` 方法，需要添加：

- [ ] **Step 1: 如需要，在 ElderlyFamilyRepository 中添加**

```java
void deleteByUserId(Long userId);
```

- [ ] **Step 2: 如需要，在 AddressRepository 中添加**

```java
void deleteByUserId(Long userId);
```

---

### Task 7: 志愿者端小程序 — 移除 FAB 按钮

**Files:**
- Modify: `D:\互助养老3\互助养老小程序\pages\home\home.wxml` — 删除 FAB 块
- Modify: `D:\互助养老3\互助养老小程序\pages\home\home.js` — 删除 onFabTap
- Modify: `D:\互助养老3\互助养老小程序\pages\home\home.wxss` — 删除 FAB 样式
- Modify: `D:\互助养老3\互助养老小程序\pages\booking\booking.wxml` — 删除 FAB 块
- Modify: `D:\互助养老3\互助养老小程序\pages\booking\booking.js` — 删除 onFabTap
- Modify: `D:\互助养老3\互助养老小程序\pages\booking\booking.wxss` — 删除 FAB 样式

- [ ] **Step 1: home.wxml 删除 FAB 块**

删除末尾的：
```xml
<!-- FAB -->
<view class="fab-btn" bindtap="onFabTap">
  <image class="fab-icon" src="/images/icons/add.svg" mode="aspectFit" />
</view>
```

- [ ] **Step 2: home.js 删除 onFabTap 方法**

删除整个 `onFabTap() { wx.showToast({ title: '发布新需求', icon: 'none' }); },`

- [ ] **Step 3: home.wxss 删除 FAB 样式**

删除 `.fab-btn` 相关样式块（从 `/* FAB — 浮动按钮 */` 到 `}` 约 15 行）。

- [ ] **Step 4: booking.wxml 删除 FAB 块**

删除末尾的：
```xml
<view class="fab-btn" bindtap="onFabTap">
  <image class="fab-icon" src="/images/icons/add.svg" mode="aspectFit" />
</view>
```

- [ ] **Step 5: booking.js 删除 onFabTap 方法**

删除 `onFabTap() { wx.showToast({ title: '发布新需求', icon: 'none' }); }`

- [ ] **Step 6: booking.wxss 删除 FAB 样式**

删除 `.fab-btn` 及 `.fab-icon` 相关样式。

- [ ] **Step 7: 调整 booking 页面内容区域底部间距**

booking.wxss 中 `.booking-content` 的 padding-bottom 从 `180rpx` 改为 `48rpx`：
```css
.booking-content {
  padding: 32rpx 40rpx 48rpx;
}
```

- [ ] **Step 8: 调整 home 页面内容区域底部间距**

home.wxss 中 `.page-content` 的 padding-bottom 从 `200rpx` 改为 `48rpx`：
```css
.page-content {
  padding: 0 32rpx 48rpx;
}
```

---

### Task 8: 两个小程序 — 添加忘记密码页面

**Files 志愿者端:**
- Create: `D:\互助养老3\互助养老小程序\pages\forgot-password\forgot-password.wxml`
- Create: `D:\互助养老3\互助养老小程序\pages\forgot-password\forgot-password.js`
- Create: `D:\互助养老3\互助养老小程序\pages\forgot-password\forgot-password.wxss`
- Create: `D:\互助养老3\互助养老小程序\pages\forgot-password\forgot-password.json`
- Modify: `D:\互助养老3\互助养老小程序\app.json` — 注册新页面
- Modify: `D:\互助养老3\互助养老小程序\pages\login\login.wxml` — 加"忘记密码"链接
- Modify: `D:\互助养老3\互助养老小程序\utils\api.js` — 添加 resetPassword API

**Files 老人端:**
- Create: `D:\互助养老3\互助养老（老人端）\pages\forgot-password\forgot-password.wxml`
- Create: `D:\互助养老3\互助养老（老人端）\pages\forgot-password\forgot-password.js`
- Create: `D:\互助养老3\互助养老（老人端）\pages\forgot-password\forgot-password.wxss`
- Create: `D:\互助养老3\互助养老（老人端）\pages\forgot-password\forgot-password.json`
- Modify: `D:\互助养老3\互助养老（老人端）\app.json` — 注册新页面
- Modify: `D:\互助养老3\互助养老（老人端）\pages\login\login.wxml` — 加"忘记密码"链接
- Modify: `D:\互助养老3\互助养老（老人端）\utils\api.js` — 添加 resetPassword API

- [ ] **Step 1: 志愿者端 API 添加 resetPassword**

```javascript
// 在 D:\互助养老3\互助养老小程序\utils\api.js 中添加
resetPassword(phone, newPassword) { return req.put('/user/reset-password', { phone, newPassword }); },
```

- [ ] **Step 2: 老人端 API 添加 resetPassword**

```javascript
// 在 D:\互助养老3\互助养老（老人端）\utils\api.js 中添加
resetPassword(phone, newPassword) { return req.put('/user/reset-password', { phone, newPassword }); },
```

- [ ] **Step 3: 志愿者端创建 forgot-password 页面**

**wxml:**
```xml
<top-app-bar title="忘记密码" showBack="{{true}}"></top-app-bar>

<view class="page-content">
  <view class="form-card">
    <view class="form-title">重置密码</view>
    <view class="form-desc">请输入您注册时使用的手机号和新密码</view>

    <view class="form-group">
      <text class="form-label">手机号</text>
      <input class="form-input" type="text" placeholder="请输入手机号" maxlength="11" value="{{phone}}" bindinput="onPhoneInput" />
    </view>

    <view class="form-group">
      <text class="form-label">新密码</text>
      <input class="form-input" type="password" placeholder="请输入新密码" value="{{newPassword}}" bindinput="onPasswordInput" />
    </view>

    <view class="form-group">
      <text class="form-label">确认密码</text>
      <input class="form-input" type="password" placeholder="请再次输入新密码" value="{{confirmPassword}}" bindinput="onConfirmPasswordInput" />
    </view>

    <button class="submit-btn" bindtap="onSubmit" disabled="{{!canSubmit}}">重置密码</button>
  </view>
</view>
```

**js:**
```javascript
const api = require('../../utils/api');

Page({
  data: {
    phone: '',
    newPassword: '',
    confirmPassword: '',
    canSubmit: false
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
    this.checkForm();
  },

  onPasswordInput(e) {
    this.setData({ newPassword: e.detail.value });
    this.checkForm();
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value });
    this.checkForm();
  },

  checkForm() {
    const { phone, newPassword, confirmPassword } = this.data;
    this.setData({
      canSubmit: phone.length === 11 && newPassword.length >= 6 && newPassword === confirmPassword
    });
  },

  async onSubmit() {
    const { phone, newPassword, confirmPassword } = this.data;
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }
    try {
      await api.resetPassword(phone, newPassword);
      wx.showToast({ title: '重置成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (e) {
      wx.showToast({ title: e.message || '重置失败', icon: 'none' });
    }
  }
});
```

**wxss:**
```css
.page-content {
  padding: 40rpx;
}

.form-card {
  background: #ffffff;
  border-radius: 32rpx;
  padding: 48rpx;
  box-shadow: 0 8rpx 32rpx -8rpx rgba(148, 107, 82, 0.15);
}

.form-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #2c1810;
  margin-bottom: 12rpx;
}

.form-desc {
  font-size: 26rpx;
  color: #8a7a6e;
  margin-bottom: 40rpx;
}

.form-group {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: #4a3c33;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: #fbf2ed;
  border-radius: 20rpx;
  padding: 0 28rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  border: 2rpx solid transparent;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(145deg, #c7511f, #a83e12);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16rpx;
  border: none;
}

.submit-btn:active {
  transform: scale(0.97);
}
```

**json:**
```json
{
  "navigationStyle": "custom",
  "usingComponents": {
    "top-app-bar": "/components/top-app-bar/top-app-bar"
  }
}
```

- [ ] **Step 4: 志愿者端 app.json 注册 forgot-password 页面**

在 `pages` 数组中添加：
```json
"pages/forgot-password/forgot-password"
```

- [ ] **Step 5: 志愿者端 login.wxml 添加忘记密码链接**

在密码输入框后面合适位置添加：
```xml
<view class="forgot-password" bindtap="onForgotPassword">忘记密码？</view>
```

在 login.js 中添加：
```javascript
onForgotPassword() {
  wx.navigateTo({ url: '/pages/forgot-password/forgot-password' });
},
```

- [ ] **Step 6: 老人端重复 Step 3-5（路径前缀改为 `D:\互助养老3\互助养老（老人端）`）**

注意：老人端可能没有 `top-app-bar` 组件，使用原生导航。json 设置为：
```json
{
  "navigationBarTitleText": "忘记密码"
}
```

老人端 wxml 不使用 top-app-bar 组件，使用原生导航栏。

老人端 app.json 中添加 `"pages/forgot-password/forgot-password"`。

---

### Task 9: 两个小程序 — 通知轮询

**Files:**
- Modify: `D:\互助养老3\互助养老小程序\utils\api.js` — 添加通知 API
- Modify: `D:\互助养老3\互助养老小程序\app.js` — 添加轮询
- Modify: `D:\互助养老3\互助养老（老人端）\utils\api.js` — 添加通知 API
- Modify: `D:\互助养老3\互助养老（老人端）\app.js` — 添加轮询

- [ ] **Step 1: 志愿者端 api.js 添加通知 API**

```javascript
// 通知
getNotifications(page, size) { return req.get(`/notifications?page=${page || 0}&size=${size || 20}`); },
getUnreadCount() { return req.get('/notifications/unread-count'); },
markNotificationRead(id) { return req.put(`/notifications/${id}/read`); },
markAllNotificationsRead() { return req.put('/notifications/read-all'); },
```

- [ ] **Step 2: 老人端 api.js 添加通知 API**

同上。

- [ ] **Step 3: 志愿者端 app.js 添加轮询**

在 App 的 `onShow` 中添加：
```javascript
// 启动通知轮询
this.startNotificationPolling();
```

添加轮询方法：
```javascript
startNotificationPolling() {
  const token = wx.getStorageSync('token');
  if (!token) return;

  // 清除旧的定时器
  if (this._notificationTimer) {
    clearInterval(this._notificationTimer);
  }

  const req = require('./utils/request');
  this._notificationTimer = setInterval(() => {
    req.get('/notifications/unread-count').then(res => {
      const count = res.count || 0;
      if (count > 0) {
        // 设置 tabBar 徽标
        wx.setTabBarBadge({ index: 1, text: String(count) }).catch(() => {});
        // 如果页面可见，展示提示
        const pages = getCurrentPages();
        if (pages.length > 0) {
          const page = pages[pages.length - 1];
          if (page && page.route !== 'pages/login/login') {
            wx.showToast({ title: `您有 ${count} 条新通知`, icon: 'none', duration: 2000 });
          }
        }
      }
    }).catch(() => {});
  }, 30000); // 30 秒轮询
},
```

在 `onHide` 中清除定时器：
```javascript
onHide() {
  if (this._notificationTimer) {
    clearInterval(this._notificationTimer);
    this._notificationTimer = null;
  }
},
```

- [ ] **Step 4: 老人端 app.js 添加轮询**

老人端没有 tabBar，所以不需要 setTabBarBadge。简化版：

```javascript
// 在 App 中添加
onShow() {
  // 原有逻辑...
  this.startNotificationPolling();
},

onHide() {
  if (this._notificationTimer) {
    clearInterval(this._notificationTimer);
    this._notificationTimer = null;
  }
},

startNotificationPolling() {
  const token = wx.getStorageSync('token');
  if (!token) return;
  if (this._notificationTimer) clearInterval(this._notificationTimer);

  const req = require('./utils/request');
  this._notificationTimer = setInterval(() => {
    req.get('/notifications/unread-count').then(res => {
      const count = res.count || 0;
      if (count > 0) {
        wx.showToast({ title: `您有 ${count} 条新通知`, icon: 'none', duration: 2000 });
      }
    }).catch(() => {});
  }, 30000);
},
```

---

### Task 10: 志愿者端小程序 — 积分兑换率从接口读取

**Files:**
- Modify: `D:\互助养老3\互助养老小程序\pages\point-mall\point-mall.js`
- Modify: `D:\互助养老3\互助养老小程序\pages\point-mall\point-mall.wxml`

- [ ] **Step 1: point-mall.js — 加载汇率并动态生成 exchangeOptions**

在 `api` 的 `loadData` 中，在 `Promise.all` 里添加获取汇率：

```javascript
async loadData() {
  try {
    const [products, balance, rateRes] = await Promise.all([
      api.getProducts(),
      api.getPointsBalance(),
      api.getExchangeRate()
    ]);
    const rate = rateRes.pointsPerHour || 10;
    const options = [];
    [10, 20, 50].forEach(hours => {
      options.push({
        id: hours,
        title: `${hours} 小时服务时长`,
        desc: `兑换为 ${hours * rate} 积分，可在商城使用`,
        points: hours * rate
      });
    });
    this.setData({
      products: (products || []).map(p => ({
        id: p.id,
        name: p.name || '',
        points: p.pointsRequired || 0,
        badge: p.badge || '',
        image: p.image || '',
        description: p.description || ''
      })),
      exchangeOptions: options,
      points: balance || 0
    });
  } catch (e) {
    wx.showToast({ title: e.message, icon: 'none' });
  }
},
```

- [ ] **Step 2: 志愿者端 api.js 添加 getExchangeRate**

```javascript
getExchangeRate() { return req.get('/point-mall/exchange-rate'); },
```

---

### Task 11: 两个小程序 — 账户注销入口

**Files:**
- Modify: `D:\互助养老3\互助养老（老人端）\pages\account_security\account_security.js` — 添加注销处理
- Modify: `D:\互助养老3\互助养老小程序\pages\profile\profile.wxml` — 添加注销入口
- Modify: `D:\互助养老3\互助养老小程序\pages\profile\profile.js` — 添加注销处理
- Modify: `D:\互助养老3\互助养老小程序\utils\api.js` — 添加 deleteAccount API
- Modify: `D:\互助养老3\互助养老（老人端）\utils\api.js` — 添加 deleteAccount API

- [ ] **Step 1: 两个 api.js 添加 deleteAccount**

志愿者端：
```javascript
deleteAccount() { return req.del('/user/account'); },
```

老人端同上。

- [ ] **Step 2: 老人端 account_security.js 添加注销处理**

老人端 WXML 已有"注销账号"按钮，只需添加对应事件绑定：
```xml
<!-- 修改绑定 -->
<button class="danger-btn" bindtap="onDeleteAccount">注销账号</button>
```

```javascript
// 在 account_security.js 中添加
async onDeleteAccount() {
  wx.showModal({
    title: '确认注销',
    content: '注销后将无法找回您的任何数据，请谨慎操作',
    success: async (res) => {
      if (res.confirm) {
        try {
          await api.deleteAccount();
          wx.removeStorageSync('token');
          wx.removeStorageSync('user');
          wx.showToast({ title: '账号已注销', icon: 'success' });
          setTimeout(() => wx.redirectTo({ url: '/pages/login/login' }), 1500);
        } catch (e) {
          wx.showToast({ title: e.message || '注销失败', icon: 'none' });
        }
      }
    }
  });
},
```

需要 `const api = require('../../utils/api');` 在页面顶部。

- [ ] **Step 3: 志愿者端 profile.wxml 添加注销按钮**

在退出登录按钮之前/之后添加：
```xml
<view class="danger-btn" bindtap="onDeleteAccount">
  <image class="logout-icon" src="/images/icons/logout.svg" mode="aspectFit" />
  <text>注销账号</text>
</view>
```

样式复用 `.logout-btn` 样式，或者在 wxss 中添加共用样式。

- [ ] **Step 4: 志愿者端 profile.js 添加注销处理**

```javascript
async onDeleteAccount() {
  wx.showModal({
    title: '确认注销',
    content: '注销后将无法找回您的任何数据，请谨慎操作',
    success: async (res) => {
      if (res.confirm) {
        try {
          await api.deleteAccount();
          wx.removeStorageSync('token');
          wx.removeStorageSync('user');
          wx.showToast({ title: '账号已注销', icon: 'success' });
          setTimeout(() => wx.redirectTo({ url: '/pages/login/login' }), 1500);
        } catch (e) {
          wx.showToast({ title: e.message || '注销失败', icon: 'none' });
        }
      }
    }
  });
},
```

---

### Task 12: 管理后台 — UserListView 字段修复

**Files:**
- Modify: `D:\互助养老3\mutual-aid-admin\src\views\users\UserListView.vue`

- [ ] **Step 1: 修复 username 列**

替换：
```html
<el-table-column prop="username" label="用户名" width="140" />
```
为：
```html
<el-table-column prop="name" label="姓名" width="120" />
<el-table-column prop="phone" label="手机号" width="160" />
```

注意原有 `name` 列已存在，需要合并处理。原有：
```html
<el-table-column prop="id" label="ID" width="80" />
<el-table-column prop="username" label="用户名" width="140" />
<el-table-column prop="name" label="姓名" width="120" />
<el-table-column prop="phone" label="手机号" width="140" />
```

改为：
```html
<el-table-column prop="id" label="ID" width="80" />
<el-table-column prop="name" label="姓名" width="120" />
<el-table-column prop="phone" label="手机号" width="160" />
```

- [ ] **Step 2: 修复 status 列**

替换：
```html
<el-table-column prop="status" label="状态" width="80">
  <template #default="{ row }">
    <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'" size="small">
      {{ row.status === 'ACTIVE' ? '正常' : '禁用' }}
    </el-tag>
  </template>
</el-table-column>
```
为：
```html
<el-table-column prop="status" label="状态" width="80">
  <template #default="{ row }">
    <el-tag :type="row.status === 0 ? 'success' : row.status === 1 ? 'danger' : 'info'" size="small">
      {{ row.status === 0 ? '正常' : row.status === 1 ? '禁用' : '已注销' }}
    </el-tag>
  </template>
</el-table-column>
```

- [ ] **Step 3: 修复操作列中的 status 判断**

替换：
```html
<el-button
  size="small"
  :type="row.status === 'ACTIVE' ? 'warning' : 'success'"
  @click="handleToggleStatus(row)"
>
  {{ row.status === 'ACTIVE' ? '禁用' : '启用' }}
</el-button>
```
为：
```html
<el-button
  size="small"
  :type="row.status === 0 ? 'warning' : 'success'"
  @click="handleToggleStatus(row)"
  :disabled="row.status === 2"
>
  {{ row.status === 0 ? '禁用' : row.status === 1 ? '启用' : '已注销' }}
</el-button>
```

- [ ] **Step 4: 修复详情弹窗中的 status/username**

替换：
```html
<el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
```
为：
```html
<el-descriptions-item label="姓名">{{ currentUser.name }}</el-descriptions-item>
```

替换：
```html
<el-descriptions-item label="状态">{{ currentUser.status === 'ACTIVE' ? '正常' : '禁用' }}</el-descriptions-item>
```
为：
```html
<el-descriptions-item label="状态">{{ currentUser.status === 0 ? '正常' : currentUser.status === 1 ? '禁用' : '已注销' }}</el-descriptions-item>
```

- [ ] **Step 5: 隐藏对已注销用户的 toggle 操作（可选）**

操作列中用 `v-if` 只对 status 0/1 显示切换按钮：
```html
<el-button
  v-if="row.status !== 2"
  size="small"
  :type="row.status === 0 ? 'warning' : 'success'"
  @click="handleToggleStatus(row)"
>
  {{ row.status === 0 ? '禁用' : '启用' }}
</el-button>
<el-tag v-else size="small" type="info">已注销</el-tag>
```

---

### Task 13: 验证 — 编译和基本检查

- [ ] **Step 1: 后端编译检查**

```bash
cd D:/互助养老3/mutual-aid-api
mvn compile -q
```
预期：BUILD SUCCESS

- [ ] **Step 2: 管理后台编译检查**

```bash
cd D:/互助养老3/mutual-aid-admin
npm run build
```
预期：构建成功，无报错

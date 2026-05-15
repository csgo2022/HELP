# 服务完成流程设计方案

> **Goal:** 实现完整的服务完成流程：志愿者上传服务照片+小结 → 老人查看并确认 → 老人评分 → 志愿者获得积分

**Architecture:** 后端新增 service_photo 表存储照片，service_task 增加 summary 字段和 PENDING_CONFIRM 状态，复用现有 review 端点扩展奖励发放逻辑。前端志愿者端新增提交完成页，老人端修改服务详情页和记录页。

**Tech Stack:** Spring Boot 3.2.5 + JPA + MySQL + Flyway + 阿里云 OSS + 微信小程序

---

## 数据库变更

### 新增表 service_photo

```sql
CREATE TABLE `service_photo` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `task_id` BIGINT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`task_id`) REFERENCES `service_task`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### ServiceTask 变更
- 新增字段 `summary TEXT`（志愿者填写服务小结）
- 状态机增加 `PENDING_CONFIRM` 状态

### 状态流转
```
PENDING → MATCHING → IN_PROGRESS → PENDING_CONFIRM → COMPLETED
                                      ↑ 志愿者上传      ↑ 老人确认+评分
```

## 后端 API

### 1. 志愿者提交完成

`POST /api/mini/tasks/{id}/submit-completion`
- 请求：`multipart/form-data`（多张图片 + summary 文本）
- 权限：该任务的 volunteer
- 行为：上传照片到 OSS → 存 service_photo → 更新 task.summary → 状态变 PENDING_CONFIRM
- 响应：ApiResponse<Void>

### 2. 获取完成信息

`GET /api/mini/tasks/{id}/completion-info`
- 响应：
```json
{
  "photos": ["url1", "url2"],
  "summary": "服务小结内容"
}
```
- 权限：任务发布者（老人）和志愿者都可查看

### 3. 老人确认完成

`POST /api/mini/tasks/{id}/confirm`
- 权限：任务的 requester
- 行为：状态变 COMPLETED
- 响应：ApiResponse<Void>

### 4. 评分 + 奖励发放（改造现有端点）

`POST /api/mini/records/{recordId}/review`
- 请求体：{ taskId, toUserId, rating, comment }
- 行为：保存 review → `volunteer_profile.service_count + 1` → `total_hours += task.reward_hours` → 重新计算 `rating`（所有评价平均分） → `user.points += task.reward_hours × 10` → 写入 `point_transaction` 流水
- 响应：ApiResponse<Void>

## 前端页面

### 志愿者端

| 页面 | 改动 |
|---|---|
| service-detail | IN_PROGRESS 时底部按钮改为"完成服务"，点击跳转到 submit-completion 页 |
| submit-completion（新） | 多图片上传（wx.chooseImage，最多9张）+ 服务小结输入框，提交后跳转记录页 |
| records | 增加 PENDING_CONFIRM 状态显示"待确认" |
| api.js | 新增 submitCompletion、getCompletionInfo |

### 老人端

| 页面 | 改动 |
|---|---|
| service_detail | PENDING_CONFIRM 时显示照片列表（可预览）+ 服务小结 + "确认完成"按钮 |
| records | 增加 PENDING_CONFIRM 映射为"待确认" |
| api.js | 新增 getCompletionInfo、confirmTask |

## 积分规则

- 1 小时服务时长 = 10 积分
- `volunteer_profile.total_hours` 增加 `task.reward_hours`
- `volunteer_profile.rating` 重新计算为该志愿者所有评价的平均分
- `volunteer_profile.service_count` 加 1
- `user.points` 增加 `reward_hours × 10`
- 写入 `point_transaction` 流水（type=EARN, reference_type=TASK, reference_id=taskId）

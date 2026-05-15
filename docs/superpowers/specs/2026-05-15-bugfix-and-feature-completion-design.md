# 互助养老项目 — BUG修复与功能补全设计

## 概述

对现存问题进行集中修复，涵盖：通知系统、忘记密码、账户注销、ServiceRecord写入、排行榜缓存、积分兑换率动态化、志愿者端FAB按钮移除、管理后台字段不匹配等共9项。

---

## 1. 通知系统（新增）

### 1.1 数据模型

```
Notification
├── id            BIGINT (PK)
├── user_id       BIGINT (FK -> user.id)
├── type          ENUM: TASK_ASSIGNED / TASK_ACCEPTED / TASK_COMPLETED
├── title         VARCHAR(100)
├── content       VARCHAR(500)
├── reference_id  BIGINT (关联任务ID，可空)
├── is_read       BOOLEAN (default false)
├── created_at    DATETIME
```

### 1.2 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/mini/notifications` | 通知列表（分页，按时间倒序） |
| GET | `/api/mini/notifications/unread-count` | 未读通知数 |
| PUT | `/api/mini/notifications/{id}/read` | 标记单条已读 |
| PUT | `/api/mini/notifications/read-all` | 标记全部已读 |

### 1.3 事件触发点

在 `TaskService` 的三个位置植入通知创建逻辑：
- `assignTask()` → 志愿者被分配任务时 → 类型 `TASK_ASSIGNED`
- `applyTask()` + 被接受时 → 老人端收到 `TASK_ACCEPTED`
- `confirmCompletion()` → 任务完成 → 双方收 `TASK_COMPLETED`

### 1.4 前端轮询

- 两个小程序在 `app.js` 的 `onShow` 生命周期启动轮询
- 间隔：30秒
- 仅在用户已登录时执行
- 发现未读数 > 0 时用 `wx.showToast` / 红点提示
- 页面销毁时清除定时器

---

## 2. 忘记密码（新增）

### 2.1 后端 API

| 方法 | 路径 | 说明 |
|------|------|------|
| PUT | `/api/mini/user/reset-password` | 重置密码，body: `{phone, newPassword}` |

- 验证手机号是否存在
- 直接用新密码（BCrypt加密）更新
- 无需验证码（无短信服务，以手机号持有者为身份证明）

### 2.2 小程序页面

- 两个小程序各新增 `pages/forgot-password/forgot-password` 页面
- 流程：输入手机号 → 输入新密码 → 确认密码 → 提交

---

## 3. 账户注销（新增）

### 3.1 后端

| 方法 | 路径 | 说明 |
|------|------|------|
| DELETE | `/api/mini/user/account` | 注销当前用户 |

- 软删除：`user.status = 2`（新增 DELETED 枚举值）
- `AuthService.login()` 和 `JwtAuthenticationFilter` 中拦截 status=2 的用户，禁止登录
- 清理关联：删除 `ElderlyFamily` 绑定、`Address`、清空 `VolunteerProfile`
- 保留：`ServiceTask`、`ServiceRecord`、`PointTransaction`、`Review`（历史数据）

### 3.2 前端

- 两个小程序"账户安全"页面加"注销账户"按钮
- 点击后弹确认框，二次确认后调接口
- 成功后清除本地 token，跳转到登录页

---

## 4. ServiceRecord 表写入（修复）

### 4.1 问题

`TaskService.confirmCompletion()` 完成后只加了积分和时长，没有创建 `ServiceRecord` 记录。

### 4.2 修复

在 `confirmCompletion()` 方法末尾补充：

```java
ServiceRecord record = new ServiceRecord();
record.setTaskId(task.getId());
record.setVolunteerId(task.getVolunteerId());
record.setTitle(task.getTitle());
record.setTime(task.getUpdatedAt()); // 完成时间
record.setLocation(task.getAddress());
record.setDuration(task.getDuration());
record.setStatus("COMPLETED");
record.setSummary(task.getSummary());
serviceRecordRepository.save(record);
```

---

## 5. 排行榜缓存（优化）

### 5.1 方案

Spring Cache + Caffeine（内存缓存，无需额外基础设施）

### 5.2 实现

- 在 `LeaderboardService` 方法上加 `@Cacheable("leaderboard")`
- 当有志愿者时长变更时（`VolunteerProfile` 更新），调用 `@CacheEvict("leaderboard")` 清除缓存
- 缓存 TTL：5分钟

---

## 6. 志愿者端 FAB 按钮（移除）

直接删除首页和预约页的悬浮按钮元素及对应事件处理方法。

---

## 7. 积分兑换率动态化（修复）

### 7.1 后端

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/mini/point-mall/exchange-rate` | 返回 `{hoursPerPoint: 0.1}` 或类似格式 |

- 从 `sys_config` 表读取 `point_exchange_rate` 配置项
- 未配置时返回默认值（1小时=10积分）

### 7.2 前端

- 积分商城页面调该接口获取汇率
- 根据汇率动态生成兑换选项
- 删除硬编码的 `exchangeOptions` 数组

---

## 8. 管理后台字段修复

### 8.1 username → name/phone

`UserListView.vue` 中 `<el-table-column prop="username">` 改为展示 `name`（姓名）和 `phone`（手机号）两列，因为 `User` 实体没有 `username` 字段。

### 8.2 status 类型匹配

`UserListView.vue` 中 `row.status === 'ACTIVE'` 改为 `row.status === 0`（正常），`row.status === 1`（禁用）。

状态标签：0 → 绿色"正常"，1 → 红色"已禁用"。

---

## 影响范围

| 改动 | 后端 | 老人端小程序 | 志愿者端小程序 | 管理后台 |
|------|------|-------------|-------------|---------|
| 通知系统 | 新表+API+集成 | 轮询+提示 | 轮询+提示 | — |
| 忘记密码 | API | 新页面 | 新页面 | — |
| 账户注销 | API | 加入口 | 加入口 | — |
| ServiceRecord | TaskService修 | — | — | — |
| 排行榜缓存 | 加注解 | — | — | — |
| 积分兑换率 | API | — | 改页面 | — |
| FAB按钮 | — | — | 删除元素 | — |
| 后台字段 | — | — | — | 改模板 |

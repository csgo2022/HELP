# 互助养老（老人端）后端 API 对接设计方案

## 1. 概述

将互助养老老人端微信小程序从静态数据改为对接后端 API。无后端接口的页面保持现有静态数据不变。

### 对接原则

- 创建统一的 API 请求层，封装 `wx.request`，统一鉴权
- 逐页替换数据源，不改变页面 UI 和交互逻辑
- 后端 API 路径前缀为 `/api/mini/`

---

## 2. API 请求层设计

### 2.1 文件: `utils/request.js`

统一的 HTTP 请求封装：

- **baseURL**: 从 `app.js` 的 `globalData.apiBaseUrl` 读取，默认 `http://localhost:8080/api/mini`
- **请求拦截**: 每次请求自动从 `wx.getStorageSync('token')` 读取 accessToken，加到 `Authorization: Bearer {token}` header
- **响应处理**: 统一解析 `ApiResponse` 格式 `{code, message, data, timestamp}`，code=200 返回 data，否则 reject 错误
- **401 处理**: code=401 时清除 token，跳转登录页

```
// ApiResponse 格式
{ code: 200, message: "success", data: {...}, timestamp: 1234567890 }
```

### 2.2 文件: `utils/api.js`

域名化的 API 函数集合，每个后端接口对应一个函数：

```
auth/login(phone, password)
auth/register(phone, password, role)
user/profile()
user/updateProfile(data)
user/password(oldPassword, newPassword)
user/realnameAuth(realName, idCard)
announcements/list()
announcements/detail(id)
tasks/list()
tasks/my()
tasks/detail(id)
tasks/create(data)
tasks/applicants(taskId)
tasks/assign(taskId, volunteerId)
records/review(taskId, toUserId, rating, comment)
health/list()
health/create(image, note)
addresses/list()
addresses/create(data)
family/list()
family/create(familyName, familyPhone)
family/delete(id)
```

---

## 3. 认证流程

### 3.1 登录（`pages/login/login.js`）

| 步骤 | 说明 |
|------|------|
| 1. 用户输入手机号+密码 | 表单验证 |
| 2. 调用 `POST /api/mini/auth/login` | body: `{phone, password}` |
| 3. 成功后保存 | `wx.setStorageSync('token', accessToken)` + `wx.setStorageSync('user', {userId, role, name})` |
| 4. 跳转首页 | `wx.reLaunch({url: '/pages/home/home'})` |

### 3.2 注册（`pages/register/register.js`）

| 步骤 | 说明 |
|------|------|
| 1. 用户输入手机号+密码 | 表单验证 |
| 2. 调用 `POST /api/mini/auth/register` | body: `{phone, password, role: "ELDERLY"}` |
| 3. 成功后保存 token | 同登录 |
| 4. 跳转首页 | |

### 3.3 Token 管理

- token 存储在 `wx.getStorageSync('token')`
- 每次请求自动携带
- 收到 401 时清除 token 并跳转登录页

---

## 4. 页面对接明细

### 4.1 公告（announcements + announcement_detail）

**announcements 列表页** (`pages/announcements/announcements.js`):
- 替换 `require('./data')` → 调用 `GET /api/mini/announcements`
- 返回字段映射: `{id, title, date, category, content, publisher, isTop, status}`
- 后端 `content` 字段替代 `data.js` 中的 `content` 字段

**announcement_detail 详情页** (`pages/announcement_detail/announcement_detail.js`):
- 替换从 `data.js` 查找 → 调用 `GET /api/mini/announcements/{id}`
- 使用 URL 参数 `id` 作为路径参数

### 4.2 发布求助（request）

**request** (`pages/request/request.js`):
- 3 步向导表单，提交时调用 `POST /api/mini/tasks`
- body: `{type, title, description, address, appointmentDate, appointmentTime, duration, remarks}`
- 其中 `title` 根据所选服务类型自动生成
- 成功后跳转到 records 页

### 4.3 服务记录（records）

**records** (`pages/records/records.js`):
- 替换 `MOCK_RECORDS` → 调用 `GET /api/mini/tasks/my`
- 后端返回的 `ServiceTask` 需映射到前端 `record` 字段:
  - `id` → `id`
  - `type` → `type`
  - `title` → 显示标题
  - `status` → `status` (PENDING/waiting, IN_PROGRESS/in_progress, COMPLETED/completed)
  - `appointmentDate` + `appointmentTime` → `time`
  - `address` → `address`
  - `applicantCount` → applicants 数量判断

### 4.4 服务详情（service_detail）

**service_detail** (`pages/service_detail/service_detail.js`):
- 替换从 `MOCK_RECORDS` 查找 → 调用 `GET /api/mini/tasks/{id}`
- 获取报名者列表 → 调用 `GET /api/mini/tasks/{id}/applicants`
- 选择志愿者 → 调用 `POST /api/mini/tasks/{id}/assign` body: `{volunteerId}`
- **问题**: `ServiceTaskApplicant` 只包含 `volunteerId`，后端缺少按 ID 查用户信息的接口（`GET /api/mini/user/{id}`）。当前方案：报名者列表展示时保留简化显示（仅显示"X人已报名"），不展示姓名头像详情。待后端补充接口后再完善。

### 4.5 评价（review）

**review** (`pages/review/review.js`):
- 提交评价 → 调用 `POST /api/mini/records/{id}/review`
- body: `{taskId, toUserId, rating, comment}`
- `taskId` 和 `toUserId` 从上一页传入

### 4.6 健康管理（health）

**health** (`pages/health/health.js`):
- 查看记录 → 调用 `GET /api/mini/health-records`
- 上传记录 → 调用 `POST /api/mini/health-records` body: `{image, note}`

### 4.7 个人资料（edit_profile）

**edit_profile** (`pages/edit_profile/edit_profile.js`):
- 加载时 → 调用 `GET /api/mini/user/profile`
- 保存时 → 调用 `PUT /api/mini/user/profile`
- body: `{name, gender, birthDate, phone}`

### 4.8 修改密码（change_password）

**change_password** (`pages/change_password/change_password.js`):
- 提交 → 调用 `PUT /api/mini/user/password`
- body: `{oldPassword, newPassword}`

### 4.9 实名认证（realname_auth）

**realname_auth** (`pages/realname_auth/realname_auth.js`):
- 现状: 上传身份证正反面图片
- 后端接口: `POST /api/mini/user/realname-auth` 接受 `{realName, idCard}` 字符串
- **改**: 保留图片上传 UI，提交时调用后端接口传姓名+身份证号

### 4.10 地址管理（address_book + add_address）

**address_book** (`pages/address_book/address_book.js`):
- 加载列表 → 调用 `GET /api/mini/addresses`

**add_address** (`pages/add_address/add_address.js`):
- 保存 → 调用 `POST /api/mini/addresses` body: `{name, phone, address, isDefault}`

### 4.11 绑定家属（bind_family）

**bind_family** (`pages/bind_family/bind_family.js`):
- 加载列表 → 调用 `GET /api/mini/family-bindings`
- 绑定 → 调用 `POST /api/mini/family-bindings` body: `{familyName, familyPhone}`
- 解绑 → 调用 `DELETE /api/mini/family-bindings/{id}`

### 4.12 保持静态的页面

以下页面无后端改动:
- `home` — 纯导航，按钮跳转
- `profile` — 菜单列表
- `profile_settings` — 菜单列表
- `account_security` — 菜单列表
- `volunteer_detail` — 志愿者详情（后端缺少按ID查志愿者接口）
- `change_phone` — 换绑手机（后端无对应接口）

---

## 5. 实现步骤

| 步骤 | 文件 | 说明 |
|------|------|------|
| 1 | `utils/request.js` | 创建 HTTP 请求封装 |
| 2 | `utils/api.js` | 创建所有 API 函数 |
| 3 | `app.js` | 添加 apiBaseUrl 配置 |
| 4 | `pages/login/login.js` | 对接登录 API |
| 5 | `pages/register/register.js` | 对接注册 API |
| 6 | `pages/announcements/announcements.js` | 对接公告列表 |
| 7 | `pages/announcement_detail/announcement_detail.js` | 对接公告详情 |
| 8 | `pages/request/request.js` | 对接发布求助 |
| 9 | `pages/records/records.js` | 对接服务记录 |
| 10 | `pages/service_detail/service_detail.js` | 对接服务详情+选择志愿者 |
| 11 | `pages/review/review.js` | 对接评价 |
| 12 | `pages/health/health.js` | 对接健康记录 |
| 13 | `pages/edit_profile/edit_profile.js` | 对接个人资料 |
| 14 | `pages/change_password/change_password.js` | 对接修改密码 |
| 15 | `pages/realname_auth/realname_auth.js` | 对接实名认证 |
| 16 | `pages/address_book/address_book.js` | 对接地址列表 |
| 17 | `pages/add_address/add_address.js` | 对接新增地址 |
| 18 | `pages/bind_family/bind_family.js` | 对接绑定家属 |

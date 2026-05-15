# 互助养老平台 - 后端与管理员平台设计文档

## 1. 项目概述

为两个已有的微信小程序（互助养老小程序 + 互助养老（老人端））开发后端 API 服务和管理员平台。

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 后端框架 | Java Spring Boot | RESTful API 服务 |
| 数据库 | MySQL | 关系型数据库 |
| ORM | Spring Data JPA | 数据访问层 |
| 认证 | Spring Security + JWT | 用户认证与权限控制 |
| 管理后台 | Vue 3 + Element Plus | 管理员操作界面 |
| 构建工具 | Maven (后端) / Vite (前端) | - |

### 架构选择：统一后端 + 分离 Admin

```
互助养老小程序 ──→        ┌──────────────────┐         ┌────────┐
互助养老（老人端）──→     │  Spring Boot API  │ ←──→   │ MySQL  │
                         │  (单项目部署)      │         └────────┘
Vue Admin 管理后台 ──→   └──────────────────┘
```

- 一个 Spring Boot 项目同时服务两个小程序和管理后台
- 通过 `user.role` 区分志愿者(VOLUNTEER)、老人(ELDERLY)、管理员(ADMIN)
- API 路径按 `/api/mini/**`（小程序端）和 `/api/admin/**`（管理端）区分
- Vue 3 Admin 独立部署，使用 JWT 与后端通信

## 2. 项目目录结构

```
D:\互助养老3\
├── mutual-aid-api/                  (Spring Boot 后端)
│   ├── src/main/java/com/mutualaid/
│   │   ├── MutualAidApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java      (Spring Security 配置)
│   │   │   ├── JwtConfig.java           (JWT 配置)
│   │   │   ├── WebMvcConfig.java        (CORS 等)
│   │   │   └── SwaggerConfig.java       (API 文档)
│   │   ├── common/
│   │   │   ├── response/
│   │   │   │   ├── ApiResponse.java     (统一响应封装)
│   │   │   │   └── PageResult.java      (分页响应)
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── BusinessException.java
│   │   │   │   └── UnauthorizedException.java
│   │   │   └── enums/
│   │   │       ├── UserRoleEnum.java
│   │   │       ├── TaskStatusEnum.java
│   │   │       └── OrderStatusEnum.java
│   │   ├── security/
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── CurrentUser.java          (自定义注解)
│   │   │   └── UserDetailsImpl.java
│   │   ├── model/
│   │   │   ├── entity/                   (JPA 实体)
│   │   │   ├── dto/                      (请求 DTO)
│   │   │   └── vo/                       (响应 VO)
│   │   ├── repository/                   (JPA Repository)
│   │   ├── service/                      (业务逻辑层)
│   │   │   ├── user/
│   │   │   ├── service/
│   │   │   ├── announcement/
│   │   │   ├── mall/
│   │   │   └── leaderboard/
│   │   └── controller/
│   │       ├── mini/                     (小程序端 API)
│   │       │   ├── AuthController.java
│   │       │   ├── UserController.java
│   │       │   ├── TaskController.java
│   │       │   ├── RecordController.java
│   │       │   ├── AnnouncementController.java
│   │       │   ├── MallController.java
│   │       │   ├── LeaderboardController.java
│   │       │   ├── AddressController.java
│   │       │   ├── HealthController.java
│   │       │   └── FamilyController.java
│   │       └── admin/                    (管理端 API)
│   │           ├── AdminAuthController.java
│   │           ├── UserManageController.java
│   │           ├── ServiceManageController.java
│   │           ├── AnnouncementManageController.java
│   │           ├── MallManageController.java
│   │           ├── OrderManageController.java
│   │           ├── LeaderboardManageController.java
│   │           └── SystemConfigController.java
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/                 (Flyway 迁移脚本)
│           ├── V1__init_schema.sql
│           └── V2__seed_data.sql
│
├── mutual-aid-admin/                    (Vue 3 + Element Plus)
│   ├── src/
│   │   ├── api/                          (Axios API 封装)
│   │   │   ├── request.ts
│   │   │   ├── user.ts
│   │   │   ├── service.ts
│   │   │   ├── announcement.ts
│   │   │   ├── mall.ts
│   │   │   └── dashboard.ts
│   │   ├── router/
│   │   │   └── index.ts
│   │   ├── stores/                       (Pinia)
│   │   │   └── user.ts
│   │   ├── views/
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── user/
│   │   │   ├── service/
│   │   │   ├── announcement/
│   │   │   ├── mall/
│   │   │   ├── leaderboard/
│   │   │   └── settings/
│   │   ├── components/                   (公共组件)
│   │   └── layout/
│   │       ├── Sidebar.vue
│   │       ├── Navbar.vue
│   │       └── MainLayout.vue
│   └── package.json
│
├── 互助养老小程序/                       (已有，不改动)
├── 互助养老（老人端）/                   (已有，不改动)
└── docs/
    └── superpowers/specs/
        └── 2026-05-06-mutual-aid-backend-design.md
```

## 3. 数据库设计

### 3.1 用户体系

**user** — 统一用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| phone | VARCHAR(20) UNIQUE | 手机号 |
| password | VARCHAR(255) | 密码(bcrypt加密) |
| name | VARCHAR(50) | 姓名 |
| avatar | VARCHAR(500) | 头像URL |
| gender | TINYINT | 性别(0未知/1男/2女) |
| birth_date | DATE | 出生日期 |
| role | VARCHAR(20) | 角色: VOLUNTEER/ELDERLY/ADMIN |
| status | TINYINT | 状态(0正常/1禁用) |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

**volunteer_profile** — 志愿者扩展信息
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| user_id | BIGINT FK | 关联用户 |
| total_hours | DECIMAL(10,1) | 累计服务时长 |
| rating | DECIMAL(2,1) | 评分(0.0-5.0) |
| verified | TINYINT(1) | 是否认证 |
| is_gold | TINYINT(1) | 是否金牌志愿者 |
| service_count | INT | 服务次数 |

**user_realname_auth** — 实名认证
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| user_id | BIGINT FK | 关联用户 |
| real_name | VARCHAR(50) | 真实姓名 |
| id_card | VARCHAR(18) | 身份证号 |
| front_image | VARCHAR(500) | 身份证正面 |
| back_image | VARCHAR(500) | 身份证反面 |
| status | VARCHAR(20) | PENDING/APPROVED/REJECTED |
| reject_reason | VARCHAR(255) | 驳回原因 |

**elderly_family** — 老人家属绑定
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| user_id | BIGINT FK | 老人用户 |
| family_name | VARCHAR(50) | 家属姓名 |
| family_phone | VARCHAR(20) | 家属电话 |

### 3.2 服务体系

**service_type** — 服务类型
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| name | VARCHAR(50) | 名称(助餐/陪诊等) |
| icon | VARCHAR(100) | 图标 |
| sort_order | INT | 排序 |

**skill** — 技能标签
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| name | VARCHAR(50) | 技能名称 |
| icon | VARCHAR(100) | 图标 |

**volunteer_skill** — 志愿者-技能关联
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| volunteer_id | BIGINT FK | 志愿者 |
| skill_id | BIGINT FK | 技能 |

**service_task** — 服务任务需求
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| type | VARCHAR(50) | 服务类型 |
| title | VARCHAR(200) | 标题 |
| description | TEXT | 需求描述 |
| address | VARCHAR(500) | 服务地址 |
| status | VARCHAR(20) | PENDING/MATCHING/IN_PROGRESS/COMPLETED/CANCELLED |
| requester_id | BIGINT FK | 发起人(老人) |
| volunteer_id | BIGINT FK | 选定志愿者 |
| appointment_date | DATE | 预约日期 |
| appointment_time | VARCHAR(50) | 预约时间 |
| duration | VARCHAR(20) | 服务时长 |
| reward_hours | DECIMAL(4,1) | 奖励时长 |
| remarks | TEXT | 备注 |

**service_task_applicant** — 志愿者报名
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| task_id | BIGINT FK | 关联任务 |
| volunteer_id | BIGINT FK | 志愿者 |
| status | VARCHAR(20) | PENDING/ACCEPTED/REJECTED |

**service_record** — 服务记录（综合端显示）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| task_id | BIGINT FK | 关联任务 |
| volunteer_id | BIGINT FK | 志愿者 |
| title | VARCHAR(200) | 记录标题 |
| time | DATETIME | 服务时间 |
| location | VARCHAR(200) | 服务地点 |
| duration | VARCHAR(20) | 服务时长 |
| status | VARCHAR(20) | 状态 |
| client | VARCHAR(50) | 服务对象 |
| summary | TEXT | 服务总结 |
| created_at | DATETIME | 创建时间 |

**review** — 评价
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| task_id | BIGINT FK | 关联任务 |
| from_user_id | BIGINT FK | 评价人(老人) |
| to_user_id | BIGINT FK | 被评价人(志愿者) |
| rating | TINYINT | 评分(1-5) |
| comment | TEXT | 评价内容 |

### 3.3 公告

**announcement** — 公告
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| title | VARCHAR(200) | 标题 |
| date | DATE | 发布日期 |
| category | VARCHAR(50) | 分类 |
| content | TEXT | 内容(HTML) |
| publisher | VARCHAR(50) | 发布者 |
| views | INT | 浏览量 |
| is_top | TINYINT(1) | 是否置顶 |
| status | VARCHAR(20) | DRAFT/PUBLISHED |

### 3.4 积分商城

**mall_product** — 商品
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| name | VARCHAR(200) | 商品名 |
| description | TEXT | 描述 |
| points_required | INT | 所需积分 |
| stock | INT | 库存 |
| image | VARCHAR(500) | 图片 |
| badge | VARCHAR(50) | 角标 |
| status | VARCHAR(20) | ON_SHELF/OFF_SHELF |

**point_transaction** — 积分流水
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| user_id | BIGINT FK | 用户 |
| type | VARCHAR(20) | EARN/SPEND |
| amount | INT | 变动数量 |
| balance_after | INT | 变动后余额 |
| reference_type | VARCHAR(50) | 关联类型 |
| reference_id | BIGINT | 关联ID |

**orders** — 订单
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| order_no | VARCHAR(50) UNIQUE | 订单号 |
| user_id | BIGINT FK | 用户 |
| product_id | BIGINT FK | 商品 |
| quantity | INT | 数量 |
| total_points | INT | 消耗积分 |
| status | VARCHAR(20) | 状态 |
| recipient_name | VARCHAR(50) | 收件人 |
| recipient_phone | VARCHAR(20) | 联系电话 |
| address | VARCHAR(500) | 收货地址 |
| courier | VARCHAR(50) | 快递公司 |
| tracking_no | VARCHAR(100) | 运单号 |

**order_logistics** — 物流事件
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| order_id | BIGINT FK | 订单 |
| time | DATETIME | 事件时间 |
| status | VARCHAR(50) | 状态 |
| description | TEXT | 描述 |

### 3.5 其他

**address** — 地址
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| user_id | BIGINT FK | 用户 |
| name | VARCHAR(50) | 联系人 |
| phone | VARCHAR(20) | 电话 |
| address | VARCHAR(500) | 详细地址 |
| is_default | TINYINT(1) | 是否默认 |

**health_record** — 健康记录
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| user_id | BIGINT FK | 老人 |
| image | VARCHAR(500) | 图片 |
| note | TEXT | 备注 |

**sys_config** — 系统配置
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | 主键 |
| config_key | VARCHAR(100) UNIQUE | 配置键 |
| config_value | TEXT | 配置值 |
| description | VARCHAR(255) | 说明 |

## 4. API 接口设计

### 4.1 小程序端 API (`/api/mini`)

#### 认证
| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| POST | /api/mini/auth/login | 账号密码登录 | 公开 |
| POST | /api/mini/auth/sms/send | 发送验证码 | 公开 |
| POST | /api/mini/auth/sms/login | 验证码登录 | 公开 |
| POST | /api/mini/auth/register | 注册 | 公开 |
| POST | /api/mini/auth/refresh | 刷新 Token | 公开 |
| POST | /api/mini/auth/logout | 退出 | 已登录 |

#### 用户
| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| GET | /api/mini/user/profile | 获取个人资料 | VOLUNTEER/ELDERLY |
| PUT | /api/mini/user/profile | 更新个人资料 | VOLUNTEER/ELDERLY |
| PUT | /api/mini/user/phone | 修改手机号 | VOLUNTEER/ELDERLY |
| PUT | /api/mini/user/password | 修改密码 | VOLUNTEER/ELDERLY |
| POST | /api/mini/user/realname-auth | 提交实名认证 | ELDERLY |
| GET | /api/mini/user/realname-auth | 查看认证状态 | ELDERLY |
| GET | /api/mini/user/skills | 获取我的技能 | VOLUNTEER |
| PUT | /api/mini/user/skills | 更新我的技能 | VOLUNTEER |
| GET | /api/mini/user/stats | 获取个人统计数据 | VOLUNTEER |

#### 服务任务
| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| GET | /api/mini/tasks | 任务列表(支持类型/状态/距离过滤) | VOLUNTEER |
| GET | /api/mini/tasks/my | 我发布的任务 | ELDERLY |
| POST | /api/mini/tasks | 发布服务需求 | ELDERLY |
| GET | /api/mini/tasks/{id} | 任务详情 | ALL |
| PUT | /api/mini/tasks/{id} | 更新任务 | ELDERLY(本人) |
| DELETE | /api/mini/tasks/{id} | 取消任务 | ELDERLY(本人) |
| POST | /api/mini/tasks/{id}/apply | 报名任务 | VOLUNTEER |
| GET | /api/mini/tasks/{id}/applicants | 查看报名列表 | ELDERLY(本人) |
| POST | /api/mini/tasks/{id}/assign | 选定志愿者 | ELDERLY(本人) |

#### 服务记录
| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| GET | /api/mini/records | 服务记录列表(状态过滤) | VOLUNTEER |
| GET | /api/mini/records/my | 我的服务记录(老人端) | ELDERLY |
| GET | /api/mini/records/{id} | 记录详情 | ALL |
| POST | /api/mini/records/{id}/review | 提交评价 | ELDERLY |

#### 公告
| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| GET | /api/mini/announcements | 公告列表 | ALL |
| GET | /api/mini/announcements/{id} | 公告详情 | ALL |

#### 积分商城
| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| GET | /api/mini/point-mall/products | 商品列表 | ALL |
| GET | /api/mini/point-mall/balance | 我的积分 | ALL |
| POST | /api/mini/point-mall/exchange | 积分兑换时长的选项 | ALL |
| POST | /api/mini/point-mall/exchange-hour | 积分兑换为服务时长 | ALL |
| GET | /api/mini/orders | 我的订单 | ALL |
| POST | /api/mini/orders | 创建订单 | ALL |
| GET | /api/mini/orders/{id} | 订单详情 | ALL |
| GET | /api/mini/orders/{id}/logistics | 物流追踪 | ALL |

#### 排行榜
| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| GET | /api/mini/leaderboard | 排行榜(?period=weekly/monthly/all) | ALL |

#### 地址
| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| GET | /api/mini/addresses | 地址列表 | ALL |
| POST | /api/mini/addresses | 新增地址 | ALL |
| PUT | /api/mini/addresses/{id} | 更新地址 | ALL |
| DELETE | /api/mini/addresses/{id} | 删除地址 | ALL |

#### 健康记录（老人端）
| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| POST | /api/mini/health-records | 上传健康记录 | ELDERLY |
| GET | /api/mini/health-records | 健康记录列表 | ELDERLY |

#### 家人绑定（老人端）
| 方法 | 路径 | 说明 | 角色 |
|------|------|------|------|
| GET | /api/mini/family-bindings | 家属列表 | ELDERLY |
| POST | /api/mini/family-bindings | 绑定家属 | ELDERLY |
| DELETE | /api/mini/family-bindings/{id} | 解绑家属 | ELDERLY |

### 4.2 管理端 API (`/api/admin`)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/admin/login | 管理员登录 |
| GET | /api/admin/dashboard/stats | 仪表盘统计数据 |
| GET | /api/admin/users | 用户列表(分页/搜索/角色筛选) |
| GET | /api/admin/users/{id} | 用户详情 |
| PUT | /api/admin/users/{id}/status | 启用/禁用用户 |
| GET | /api/admin/realname-auth/list | 实名认证审核列表 |
| PUT | /api/admin/realname-auth/{id} | 审核实名认证(通过/驳回) |
| GET | /api/admin/service-types | 服务类型列表 |
| POST | /api/admin/service-types | 新增服务类型 |
| PUT | /api/admin/service-types/{id} | 更新服务类型 |
| DELETE | /api/admin/service-types/{id} | 删除服务类型 |
| GET | /api/admin/skills | 技能列表 |
| POST | /api/admin/skills | 新增技能 |
| PUT | /api/admin/skills/{id} | 更新技能 |
| DELETE | /api/admin/skills/{id} | 删除技能 |
| GET | /api/admin/tasks | 服务任务列表 |
| GET | /api/admin/records | 服务记录列表 |
| GET | /api/admin/announcements | 公告列表(分页) |
| POST | /api/admin/announcements | 发布公告 |
| PUT | /api/admin/announcements/{id} | 更新公告 |
| DELETE | /api/admin/announcements/{id} | 删除公告 |
| GET | /api/admin/products | 商品列表 |
| POST | /api/admin/products | 新增商品 |
| PUT | /api/admin/products/{id} | 更新商品 |
| DELETE | /api/admin/products/{id} | 删除商品 |
| GET | /api/admin/orders | 订单列表 |
| GET | /api/admin/orders/{id} | 订单详情 |
| PUT | /api/admin/orders/{id}/logistics | 更新物流信息 |
| GET | /api/admin/leaderboard | 排行榜数据 |
| GET | /api/admin/settings | 获取系统配置 |
| PUT | /api/admin/settings | 更新系统配置 |

### 4.3 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": 1714953600000
}
```

分页响应:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [ ... ],
    "page": 1,
    "size": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 5. 认证与权限设计

### JWT Token
- Access Token: 有效期 7 天，包含 userId + role
- Refresh Token: 有效期 30 天
- 密码使用 BCrypt 加密

### 权限控制
- Spring Security 拦截所有 `/api/**` 请求
- `JwtAuthenticationFilter` 从 Header 提取 Token 并解析用户
- 自定义 `@RequireRole` 注解在 Controller 层做角色校验
- `/api/admin/**` 仅 ADMIN 角色可访问
- `/api/mini/**` 根据具体接口要求 VOLUNTEER 或 ELDERLY 角色

### 请求流程
```
小程序/Admin → JWT in Header → JwtAuthenticationFilter → SecurityContext → Controller → Response
```

## 6. 管理后台页面

### 路由结构

| 路径 | 页面 | 说明 |
|------|------|------|
| /login | 登录页 | 管理员登录 |
| / | 仪表盘 | 系统概览统计 |
| /users | 用户列表 | 搜索/分页/角色筛选 |
| /users/detail/:id | 用户详情 | 查看详细信息 |
| /realname-auth | 实名认证审核 | 审核列表(通过/驳回) |
| /service-types | 服务类型管理 | CRUD |
| /skills | 技能管理 | CRUD |
| /tasks | 服务任务 | 查看所有任务 |
| /announcements | 公告管理 | 富文本编辑器发布 |
| /products | 商品管理 | CRUD |
| /orders | 订单管理 | 查看/发货 |
| /leaderboard | 排行榜 | 查看排行数据 |
| /settings | 系统设置 | 基础配置 |

### 布局
- 左侧可折叠侧边栏（菜单导航）
- 顶部导航栏（面包屑 + 管理员信息 + 退出）
- 右侧内容区
- Element Plus dark/light 主题支持

## 7. 技术约束与约定

- 后端 API 统一返回 `ApiResponse<T>` 包装
- 所有分页列表使用 Pageable 参数（page, size, sort）
- 日期时间统一使用 `yyyy-MM-dd HH:mm:ss` 格式
- 小程序端已存在的 app.js/utils 等不动，只新增 API 调用层
- 跨域（CORS）在开发环境允许所有来源

## 8. 实施计划概要

### Phase 1: 项目初始化与基础设施
1. 初始化 Spring Boot 项目（mutual-aid-api）
2. 配置数据库连接、JPA、Flyway
3. 实现 JWT 认证框架（SecurityConfig, JwtTokenProvider, JwtAuthFilter）
4. 实现统一响应封装和全局异常处理
5. 编写 V1 数据库迁移脚本（建表）
6. 初始化 Vue 3 + Element Plus 项目（mutual-aid-admin）

### Phase 2: 用户模块
1. 后端：用户实体 + 认证 API + 个人资料 API + 实名认证 API
2. Admin：登录页 + 用户管理列表 + 实名认证审核

### Phase 3: 服务模块
1. 后端：服务类型/技能 CRUD + 服务任务 API + 服务记录 API + 评价 API
2. Admin：服务类型管理 + 技能管理 + 任务查看

### Phase 4: 公告与积分商城
1. 后端：公告 CRUD + 商品 CRUD + 积分流水 + 订单 + 物流
2. Admin：公告管理（富文本）+ 商品管理 + 订单管理

### Phase 5: 排行榜与系统设置
1. 后端：排行榜计算 + 系统配置
2. Admin：排行榜页面 + 系统设置
3. Admin：仪表盘统计

### Phase 6: 地址/健康/家人绑定等辅助功能
1. 后端：地址 CRUD + 健康记录 + 家人绑定
2. 整体联调和修复

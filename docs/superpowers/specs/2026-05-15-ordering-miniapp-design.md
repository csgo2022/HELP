# 点餐小程序（顾客端）— 项目设计文档

> 日期：2026-05-15
> 后端技术栈：Node.js + Express + MySQL
> 前端：微信小程序

---

## 1. 绪论

### 1.1 项目背景

随着移动互联网的普及，餐饮行业的数字化需求日益增长。传统的中餐/快餐门店面临排队时间长、点餐效率低、人工成本高等问题。本项目旨在开发一款微信点餐小程序，让顾客通过手机自助完成浏览菜单、下单、支付的全流程，提升门店运营效率和顾客用餐体验。

### 1.2 项目目标

- 实现顾客通过微信小程序自助点餐
- 集成微信支付，完成在线支付闭环
- 提供清晰的订单状态跟踪
- 减轻前台点餐压力，提升翻台率

### 1.3 技术选型

| 层面 | 技术 | 说明 |
|------|------|------|
| 前端 | 微信小程序原生 | 微信生态内无缝使用 |
| 后端 | Node.js + Express | 轻量高效，适合小程序后端 |
| 数据库 | MySQL | 关系型数据，结构化存储 |
| 认证 | JWT | 无状态认证 |
| 支付 | 微信支付 | 原生集成 |

---

## 2. 需求分析

### 2.1 用户角色

- **顾客**：小程序使用者，可通过微信授权登录，进行点餐、支付、查看订单等操作。

### 2.2 功能需求

#### 2.2.1 用户模块

| 功能 | 描述 |
|------|------|
| 微信授权登录 | 使用 wx.login 获取 code，后端换取 openid，自动注册/登录 |
| 用户信息展示 | 展示昵称、头像等基本信息 |

#### 2.2.2 菜品模块

| 功能 | 描述 |
|------|------|
| 分类浏览 | 按分类（热菜、凉菜、主食、汤品等）浏览菜品 |
| 菜品列表 | 展示菜品名称、图片、价格、月销量 |
| 菜品详情 | 查看菜品描述、规格选择 |
| 菜品搜索 | 按关键字搜索菜品 |

#### 2.2.3 购物车模块

| 功能 | 描述 |
|------|------|
| 添加菜品 | 选择规格后加入购物车 |
| 修改数量 | 增减菜品数量 |
| 删除菜品 | 从购物车移除菜品 |
| 查看购物车 | 展示已选菜品、数量、总价 |

#### 2.2.4 订单模块

| 功能 | 描述 |
|------|------|
| 创建订单 | 从购物车生成订单 |
| 订单支付 | 集成微信支付完成付款 |
| 订单列表 | 按状态查看订单（全部/待支付/已支付/已完成） |
| 订单详情 | 查看订单包含的菜品、金额、状态 |

### 2.3 非功能需求

- 页面加载时间不超过 3 秒
- 支持高峰期 100+ 用户同时在线
- 遵循微信支付安全规范
- 敏感信息（如 openid）加密存储

### 2.4 用例图

```
┌─────────────────────────────────────┐
│           点餐小程序                   │
│  ┌──────────┐  ┌──────────┐          │
│  │ 登录/注册 │  │ 浏览菜品 │          │
│  └─────┬────┘  └────┬─────┘          │
│        │            │                │
│  ┌─────▼────────────▼─────┐          │
│  │     管理购物车          │          │
│  └─────┬──────────────────┘          │
│        │                            │
│  ┌─────▼─────┐  ┌──────────┐        │
│  │  下单支付  │  │ 查看订单 │        │
│  └───────────┘  └──────────┘        │
└─────────────────────────────────────┘
          角色：顾客
```

---

## 3. 总体设计

### 3.1 系统架构

```
┌──────────────────────────────────┐
│       微信小程序（顾客端）          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │首页│ │详情│ │购物│ │订单│   │
│  │    │ │页  │ │车  │ │列表│   │
│  └────┘ └────┘ └────┘ └────┘   │
├──────────────────────────────────┤
│         HTTPS / JSON API          │
├──────────────────────────────────┤
│        Node.js Express 后端        │
│  ┌────────┐ ┌────────┐ ┌──────┐ │
│  │ 路由层  │ │ 控制层 │ │ 模型 │ │
│  └────────┘ └────────┘ └──────┘ │
├──────────────────────────────────┤
│            MySQL                  │
└──────────────────────────────────┘
```

### 3.2 模块划分

| 模块 | 职责 | 关键接口 |
|------|------|---------|
| user | 微信登录、用户管理 | /api/user/* |
| category | 菜品分类管理 | /api/categories |
| dish | 菜品浏览、搜索 | /api/dishes/* |
| order | 订单创建、状态管理 | /api/orders/* |
| pay | 微信支付集成 | /api/pay/* |

### 3.3 前后端交互流程

```
小程序页面 → HTTP请求 → Express路由 → Controller → Service/Model → MySQL
                                                                      ↓
小程序页面 ← JSON响应 ←   路由返回   ←  Controller  ← 数据组装
```

---

## 4. 数据库设计

### 4.1 ER 关系

```
User(1) ────── N Order(1) ────── N OrderItem
                                        │
Category(1) ── N Dish(1) ──────────────┘
```

### 4.2 表结构

#### 4.2.1 user（用户表）

```sql
CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(64) NOT NULL UNIQUE,
  nickname VARCHAR(50),
  avatar_url VARCHAR(255),
  phone VARCHAR(20),
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 4.2.2 category（菜品分类表）

```sql
CREATE TABLE category (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  sort INT DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.2.3 dish（菜品表）

```sql
CREATE TABLE dish (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  picture VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  description VARCHAR(500),
  status TINYINT DEFAULT 1 COMMENT '1=上架 0=下架',
  sales INT DEFAULT 0 COMMENT '月销量',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES category(id)
);
```

#### 4.2.4 order（订单表）

```sql
CREATE TABLE `order` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(32) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TINYINT DEFAULT 0 COMMENT '0=待支付 1=已支付 2=制作中 3=已完成 4=已取消',
  remark VARCHAR(200),
  pay_time DATETIME,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id)
);
```

#### 4.2.5 order_item（订单项表）

```sql
CREATE TABLE order_item (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  dish_id INT NOT NULL,
  dish_name VARCHAR(50) NOT NULL,
  dish_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES `order`(id),
  FOREIGN KEY (dish_id) REFERENCES dish(id)
);
```

---

## 5. 接口设计

### 5.1 通用说明

- **Base URL:** `https://api.example.com`
- **Content-Type:** `application/json`
- **认证方式:** 除登录接口外，请求头携带 `Authorization: Bearer <token>`
- **响应格式:**

```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

### 5.2 用户接口

#### POST /api/user/login

登录接口，使用微信临时 code 换取 openid 并返回 token。

Request:
```json
{
  "code": "wx_login_code"
}
```

Response:
```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "nickname": "微信用户",
      "avatar_url": "https://..."
    }
  }
}
```

#### GET /api/user/info

获取当前登录用户信息，需携带 token。

Response:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "nickname": "微信用户",
    "avatar_url": "https://...",
    "phone": "",
    "create_time": "2026-05-15 10:00:00"
  }
}
```

### 5.3 菜品接口

#### GET /api/categories

获取所有菜品分类，按 sort 排序。

Response:
```json
{
  "code": 0,
  "data": [
    { "id": 1, "name": "热菜", "sort": 1 },
    { "id": 2, "name": "凉菜", "sort": 2 },
    { "id": 3, "name": "主食", "sort": 3 },
    { "id": 4, "name": "汤品", "sort": 4 }
  ]
}
```

#### GET /api/dishes

获取菜品列表，支持按分类筛选。

Query 参数: `?category_id=1`

Response:
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "category_id": 1,
      "name": "宫保鸡丁",
      "picture": "https://...",
      "price": 32.00,
      "description": "经典川菜，麻辣鲜香",
      "status": 1,
      "sales": 128
    }
  ]
}
```

#### GET /api/dishes/:id

获取单个菜品详情。

Response:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "category_id": 1,
    "name": "宫保鸡丁",
    "picture": "https://...",
    "price": 32.00,
    "description": "经典川菜，麻辣鲜香",
    "status": 1,
    "sales": 128,
    "category_name": "热菜"
  }
}
```

#### GET /api/dishes/search

搜索菜品。

Query: `?keyword=鸡`

Response:
```json
{
  "code": 0,
  "data": [
    { "id": 1, "name": "宫保鸡丁", "price": 32.00, "sales": 128 },
    { "id": 5, "name": "口水鸡", "price": 28.00, "sales": 95 }
  ]
}
```

### 5.4 订单接口

#### POST /api/orders

创建订单（需登录）。

Request:
```json
{
  "items": [
    { "dish_id": 1, "quantity": 2 },
    { "dish_id": 3, "quantity": 1 }
  ],
  "remark": "少辣"
}
```

Response:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "order_no": "202605150001",
    "total_amount": 92.00,
    "status": 0,
    "create_time": "2026-05-15 12:30:00"
  }
}
```

#### GET /api/orders

获取订单列表。

Query: `?status=0`（可选，筛选订单状态）

Response:
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "order_no": "202605150001",
      "total_amount": 92.00,
      "status": 0,
      "item_count": 3,
      "create_time": "2026-05-15 12:30:00"
    }
  ]
}
```

#### GET /api/orders/:id

获取订单详情。

Response:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "order_no": "202605150001",
    "total_amount": 92.00,
    "status": 0,
    "remark": "少辣",
    "create_time": "2026-05-15 12:30:00",
    "pay_time": null,
    "items": [
      { "dish_name": "宫保鸡丁", "dish_price": 32.00, "quantity": 2, "subtotal": 64.00 },
      { "dish_name": "米饭", "dish_price": 28.00, "quantity": 1, "subtotal": 28.00 }
    ]
  }
}
```

### 5.5 支付接口

#### POST /api/pay/unified

微信支付统一下单（需登录）。

Request:
```json
{
  "order_no": "202605150001"
}
```

Response:
```json
{
  "code": 0,
  "data": {
    "payParams": {
      "appId": "wx_appid",
      "nonceStr": "随机字符串",
      "package": "prepay_id=wx...",
      "signType": "MD5",
      "timeStamp": "1715760000",
      "paySign": "签名"
    }
  }
}
```

#### POST /api/pay/notify

微信支付结果回调（无需认证，微信服务器调用）。

Response: 返回 `200 OK` 及 `<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>`

---

## 6. 详细设计

### 6.1 页面结构

| 页面路径 | 页面名称 | 功能描述 |
|---------|---------|---------|
| pages/index/index | 首页 | 展示分类导航 + 当前分类下的菜品列表 |
| pages/dish/detail | 菜品详情 | 菜品大图、描述、价格、加入购物车 |
| pages/cart/cart | 购物车 | 已选菜品列表、数量修改、结算 |
| pages/order/confirm | 确认订单 | 订单项确认、备注填写、去支付 |
| pages/order/list | 订单列表 | 按状态 tab 切换展示订单 |
| pages/order/detail | 订单详情 | 订单信息、菜品清单、状态跟踪 |
| pages/user/user | 个人中心 | 用户信息、订单入口 |

### 6.2 前端关键逻辑

#### 购物车设计

- 使用微信小程序本地缓存 `wx.setStorageSync('cart', data)` 存储
- 数据结构：

```json
{
  "items": [
    { "dish_id": 1, "name": "宫保鸡丁", "price": 32.00, "quantity": 2, "selected": true },
    { "dish_id": 3, "name": "米饭", "price": 3.00, "quantity": 1, "selected": true }
  ],
  "totalCount": 3,
  "totalAmount": 67.00
}
```

- 每次增删改操作后同步更新缓存
- 下单成功后清空购物车

#### 订单状态机

```
0(待支付) ──(调用支付成功)──→ 1(已支付)
0(待支付) ──(用户取消)──────→ 4(已取消)
1(已支付) ──(商家确认)──────→ 2(制作中)
2(制作中) ──(商家完成)──────→ 3(已完成)
```

### 6.3 后端关键逻辑

#### 微信登录流程

```
1. 小程序 wx.login() 获取临时 code
2. 请求 POST /api/user/login { code }
3. 后端向微信服务器请求:
   GET https://api.weixin.qq.com/sns/jscode2session
   ?appid=APPID&secret=SECRET&js_code=CODE&grant_type=authorization_code
4. 微信返回 { openid, session_key }
5. 根据 openid 查询/创建用户记录
6. 生成 JWT token（payload 包含 user_id, openid）
7. 返回 token + 用户信息
8. 后续请求通过 Authorization 头携带 token
9. auth 中间件解析 token 并设置 req.user
```

#### 微信支付流程

```
1. 用户提交订单后请求 POST /api/pay/unified { order_no }
2. 后端生成商户订单号，调微信支付统一下单 API：
   POST https://api.mch.weixin.qq.com/pay/unifiedorder
   参数包括：appid, mch_id, nonce_str, sign, body, out_trade_no,
            total_fee(分), spbill_create_ip, notify_url, trade_type=JSAPI, openid
3. 微信返回 prepay_id
4. 后端组装小程序支付参数（timeStamp, nonceStr, package=prepay_id, signType, paySign）
5. 返回 payParams 给小程序端
6. 小程序端调用 wx.requestPayment(payParams)
7. 用户确认支付，微信异步回调 notify_url
8. 后端接收回调，验证签名，更新订单状态为已支付
9. 返回 SUCCESS 给微信服务器
```

### 6.4 项目目录结构

```
点餐小程序/
├── client/                          # 小程序前端
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   ├── pages/
│   │   ├── index/                   # 首页
│   │   ├── dish/
│   │   │   └── detail/              # 菜品详情
│   │   ├── cart/                    # 购物车
│   │   ├── order/
│   │   │   ├── confirm/             # 确认订单
│   │   │   ├── list/                # 订单列表
│   │   │   └── detail/              # 订单详情
│   │   └── user/                    # 个人中心
│   └── utils/
│       └── api.js                   # HTTP 请求封装
│
├── server/                          # Node.js 后端
│   ├── app.js                       # 入口文件
│   ├── package.json
│   ├── config/
│   │   └── index.js                 # 配置（数据库、微信支付）
│   ├── routes/
│   │   ├── user.js
│   │   ├── category.js
│   │   ├── dish.js
│   │   ├── order.js
│   │   └── pay.js
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── categoryController.js
│   │   ├── dishController.js
│   │   ├── orderController.js
│   │   └── payController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Dish.js
│   │   ├── Order.js
│   │   └── OrderItem.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT 鉴权
│   │   └── errorHandler.js          # 错误处理
│   └── utils/
│       ├── wxpay.js                 # 微信支付工具
│       └── jwt.js                   # JWT 工具
│
└── docs/                            # 项目文档
    ├── 需求分析文档.md
    ├── 设计文档.md
    └── SQL/
        └── init.sql                 # 数据库初始化脚本
```

---

## 7. API 接口汇总

| 方法 | 路径 | 需登录 | 说明 |
|------|------|-------|------|
| POST | /api/user/login | 否 | 微信登录 |
| GET | /api/user/info | 是 | 获取用户信息 |
| GET | /api/categories | 是 | 获取分类列表 |
| GET | /api/dishes | 是 | 获取菜品列表 |
| GET | /api/dishes/:id | 是 | 获取菜品详情 |
| GET | /api/dishes/search | 是 | 搜索菜品 |
| POST | /api/orders | 是 | 创建订单 |
| GET | /api/orders | 是 | 获取订单列表 |
| GET | /api/orders/:id | 是 | 获取订单详情 |
| POST | /api/pay/unified | 是 | 微信统一下单 |
| POST | /api/pay/notify | 否 | 支付回调 |

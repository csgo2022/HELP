-- ====================================
-- 点餐小程序 - 数据库初始化脚本
-- 数据库: ordering_db
-- ====================================

CREATE DATABASE IF NOT EXISTS ordering_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ordering_db;

-- 用户表
CREATE TABLE IF NOT EXISTS user (
  id          INT           PRIMARY KEY AUTO_INCREMENT,
  openid      VARCHAR(64)   NOT NULL UNIQUE,
  nickname    VARCHAR(50)   DEFAULT '',
  avatar_url  VARCHAR(255)  DEFAULT '',
  phone       VARCHAR(20)   DEFAULT '',
  create_time DATETIME      DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 菜品分类表
CREATE TABLE IF NOT EXISTS category (
  id          INT           PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(30)   NOT NULL,
  sort        INT           DEFAULT 0,
  create_time DATETIME      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 菜品表
CREATE TABLE IF NOT EXISTS dish (
  id          INT           PRIMARY KEY AUTO_INCREMENT,
  category_id INT           NOT NULL,
  name        VARCHAR(50)   NOT NULL,
  picture     VARCHAR(255)  DEFAULT '',
  price       DECIMAL(10,2) NOT NULL,
  description VARCHAR(500)  DEFAULT '',
  status      TINYINT       DEFAULT 1 COMMENT '1=上架 0=下架',
  sales       INT           DEFAULT 0 COMMENT '月销量',
  create_time DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单表
CREATE TABLE IF NOT EXISTS `order` (
  id           INT           PRIMARY KEY AUTO_INCREMENT,
  order_no     VARCHAR(32)   NOT NULL UNIQUE,
  user_id      INT           NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status       TINYINT       DEFAULT 0 COMMENT '0=待支付 1=已支付 2=制作中 3=已完成 4=已取消',
  remark       VARCHAR(200)  DEFAULT '',
  pay_time     DATETIME      DEFAULT NULL,
  create_time  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订单项表
CREATE TABLE IF NOT EXISTS order_item (
  id         INT           PRIMARY KEY AUTO_INCREMENT,
  order_id   INT           NOT NULL,
  dish_id    INT           NOT NULL,
  dish_name  VARCHAR(50)   NOT NULL,
  dish_price DECIMAL(10,2) NOT NULL,
  quantity   INT           DEFAULT 1,
  subtotal   DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES `order`(id),
  FOREIGN KEY (dish_id) REFERENCES dish(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================
-- 初始数据
-- ====================================

-- 分类
INSERT INTO category (name, sort) VALUES
('热菜', 1),
('凉菜', 2),
('主食', 3),
('汤品', 4),
('饮品', 5);

-- 菜品
INSERT INTO dish (category_id, name, price, description, sales) VALUES
(1, '宫保鸡丁', 32.00, '经典川菜，麻辣鲜香', 128),
(1, '鱼香肉丝', 28.00, '酸甜微辣，下饭必备', 96),
(1, '水煮牛肉', 45.00, '麻辣鲜嫩，招牌推荐', 73),
(1, '麻婆豆腐', 22.00, '麻辣鲜香，软嫩可口', 65),
(1, '回锅肉', 35.00, '肥而不腻，经典川菜', 88),
(2, '凉拌黄瓜', 12.00, '清爽可口', 45),
(2, '口水鸡', 28.00, '麻辣鲜香，鸡肉嫩滑', 52),
(2, '皮蛋豆腐', 16.00, '清凉爽口', 38),
(3, '米饭', 3.00, '东北大米', 999),
(3, '蛋炒饭', 15.00, '粒粒分明', 156),
(3, '手工水饺', 22.00, '鲜肉馅，12个', 88),
(4, '番茄蛋汤', 12.00, '家常味道', 66),
(4, '酸辣汤', 15.00, '开胃暖胃', 45),
(5, '酸梅汤', 8.00, '冰镇酸梅汤', 120),
(5, '可乐', 5.00, '冰镇可口可乐', 200);

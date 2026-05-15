ALTER TABLE `orders`
    ADD COLUMN `courier_code` VARCHAR(50) DEFAULT NULL COMMENT '快递100公司编码',
    ADD COLUMN `last_kd100_query_time` DATETIME DEFAULT NULL COMMENT '上次查询快递100时间';

ALTER TABLE `order_logistics`
    ADD COLUMN `source` VARCHAR(20) DEFAULT 'ADMIN' COMMENT 'ADMIN(管理员创建)/KD100(快递100同步)';

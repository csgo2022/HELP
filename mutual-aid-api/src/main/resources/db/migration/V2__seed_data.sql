-- 插入服务类型
INSERT IGNORE INTO `service_type` (`name`, `icon`, `sort_order`) VALUES
('助餐服务', 'restaurant', 1),
('医疗陪护', 'medical', 2),
('家政清洁', 'cleaning', 3),
('代买代办', 'shopping-basket', 4),
('心理慰藉', 'campaign', 5),
('轮椅辅助', 'smart-toy', 6);

-- 插入技能标签
INSERT IGNORE INTO `skill` (`name`, `icon`) VALUES
('医疗陪护', 'medical'),
('助餐服务', 'restaurant'),
('家政清洁', 'cleaning'),
('心理慰藉', 'campaign'),
('代买代办', 'shopping-basket'),
('轮椅辅助', 'smart-toy');

-- 插入默认管理员 (密码: admin123)
INSERT IGNORE INTO `user` (`phone`, `password`, `name`, `role`) VALUES
('admin', '$2b$10$u8TNChcqByvAW.J8pU4yQOi1/LQIkNYwyafBx2XWtvtv.s51TVMBu', '管理员', 'ADMIN');

-- 插入系统配置
INSERT IGNORE INTO `sys_config` (`config_key`, `config_value`, `description`) VALUES
('exchange_rate', '10', '1小时服务时长兑换积分数量'),
('task_expire_hours', '48', '任务自动过期时间(小时)'),
('max_apply_per_task', '5', '每个任务最大报名人数');

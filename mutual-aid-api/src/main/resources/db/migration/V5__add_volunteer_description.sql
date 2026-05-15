ALTER TABLE `volunteer_profile` ADD COLUMN `description` VARCHAR(500) DEFAULT NULL COMMENT '志愿者自我描述/专长' AFTER `service_count`;

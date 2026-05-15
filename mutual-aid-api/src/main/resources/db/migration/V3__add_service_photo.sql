-- 服务照片表
CREATE TABLE `service_photo` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `task_id` BIGINT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_service_photo_task` FOREIGN KEY (`task_id`) REFERENCES `service_task`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ServiceTask 增加 summary 字段
ALTER TABLE `service_task` ADD COLUMN `summary` TEXT DEFAULT NULL AFTER `remarks`;

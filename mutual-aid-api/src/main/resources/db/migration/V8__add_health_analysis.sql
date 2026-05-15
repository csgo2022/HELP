ALTER TABLE `health_record`
    ADD COLUMN `analysis_result` TEXT DEFAULT NULL COMMENT 'AI 分析结果 JSON';

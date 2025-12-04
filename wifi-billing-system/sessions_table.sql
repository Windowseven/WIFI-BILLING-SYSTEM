-- Sessions table for captive portal functionality
-- Run this after importing the main wifi_billing.sql

USE wifi_billing;

-- Create sessions table for tracking active connections
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(32) NOT NULL,
  `voucher_id` int NOT NULL,
  `client_ip` varchar(45) NOT NULL,
  `mac_address` varchar(17) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `data_used_mb` int DEFAULT '0',
  `status` enum('active','expired','terminated') DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `client_ip` (`client_ip`),
  KEY `voucher_id` (`voucher_id`),
  FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add mac_address column to vouchers table if it doesn't exist
ALTER TABLE `vouchers` ADD COLUMN IF NOT EXISTS `mac_address` varchar(17) DEFAULT NULL;
ALTER TABLE `vouchers` ADD COLUMN IF NOT EXISTS `used_at` datetime DEFAULT NULL;

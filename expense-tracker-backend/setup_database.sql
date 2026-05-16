CREATE DATABASE IF NOT EXISTS expense_tracker
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE expense_tracker;

CREATE TABLE IF NOT EXISTS `user` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'user',
    `created_at` VARCHAR(64) NOT NULL DEFAULT '',
    PRIMARY KEY (`id`),
    KEY `ix_user_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `expense` (
    `id` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(255) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `date` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL DEFAULT '',
    `user_id` INT NULL,
    `username` VARCHAR(255) NULL,
    `created_at` VARCHAR(64) NOT NULL DEFAULT '',
    `updated_at` VARCHAR(64) NOT NULL DEFAULT '',
    PRIMARY KEY (`id`),
    KEY `ix_expense_user_id` (`user_id`),
    KEY `ix_expense_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `useractivity` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NULL,
    `username` VARCHAR(255) NOT NULL,
    `action` VARCHAR(255) NOT NULL,
    `detail` VARCHAR(255) NOT NULL DEFAULT '',
    `created_at` VARCHAR(64) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `ix_useractivity_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

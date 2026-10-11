CREATE TABLE IF NOT EXISTS dogs (
 id VARCHAR(40) PRIMARY KEY,
 data JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS users (
 id CHAR(36) PRIMARY KEY,
 username VARCHAR(40) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
 email VARCHAR(254) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
 password_hash VARCHAR(180) NOT NULL,
 created_at VARCHAR(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS sessions (
 token_hash CHAR(64) PRIMARY KEY,
 user_id CHAR(36) NOT NULL,
 expires_at BIGINT NOT NULL,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 INDEX (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS contributions (
 id CHAR(36) PRIMARY KEY,
 user_id CHAR(36), dog_id VARCHAR(40),
 amount_cents BIGINT UNSIGNED NOT NULL,
 frequency ENUM('once','monthly') NOT NULL,
 method ENUM('eft','payfast') NOT NULL,
 name VARCHAR(120) NOT NULL, email VARCHAR(254) NOT NULL, phone VARCHAR(40),
 status ENUM('pending_payment','paid','cancelled') NOT NULL DEFAULT 'pending_payment',
 created_at VARCHAR(30) NOT NULL, ends_at VARCHAR(30),
 FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(dog_id) REFERENCES dogs(id),
 INDEX(user_id,created_at), CHECK(amount_cents>0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

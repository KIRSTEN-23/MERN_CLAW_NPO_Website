-- Additive worker setup. Run explicitly with db:worker, never during server startup.
CREATE TABLE IF NOT EXISTS worker_access (
 user_id CHAR(36) PRIMARY KEY,
 role ENUM('admin','editor','viewer') NOT NULL,
 granted_at VARCHAR(30) NOT NULL,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Review is independent of payment. Neither review state activates sponsorship.
CREATE TABLE IF NOT EXISTS worker_reviews (
 contribution_id CHAR(36) PRIMARY KEY,
 status ENUM('reviewed','approved','declined') NOT NULL,
 note VARCHAR(1000) NOT NULL DEFAULT '',
 reviewed_by CHAR(36) NOT NULL,
 reviewed_at VARCHAR(30) NOT NULL,
 FOREIGN KEY(contribution_id) REFERENCES contributions(id) ON DELETE CASCADE,
 FOREIGN KEY(reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Extend existing installations explicitly without changing saved review outcomes.
ALTER TABLE worker_reviews MODIFY COLUMN status ENUM('reviewed','approved','declined') NOT NULL;

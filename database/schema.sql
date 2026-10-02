CREATE TABLE IF NOT EXISTS accounts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) COLLATE utf8mb4_bin NOT NULL UNIQUE,
  type ENUM('cash','e-wallet','bank','investment','other') NOT NULL,
  starting_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  CONSTRAINT positive_opening_balance CHECK (starting_balance >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) COLLATE utf8mb4_bin NOT NULL,
  type ENUM('income','expense') NOT NULL,
  UNIQUE KEY category_name_type (name,type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transactions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  type ENUM('income','expense','transfer') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category_id INT UNSIGNED NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  date DATE NOT NULL,
  account_id INT UNSIGNED NOT NULL,
  to_account_id INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
  FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
  INDEX transaction_date (date,id),
  CONSTRAINT positive_transaction_amount CHECK (amount > 0),
  CONSTRAINT valid_transaction_shape CHECK (
    (type='transfer' AND category_id IS NULL AND to_account_id IS NOT NULL AND to_account_id <> account_id)
    OR (type IN ('income','expense') AND category_id IS NOT NULL AND to_account_id IS NULL)
  )
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS settings (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  monthly_allowance DECIMAL(12,2) NOT NULL DEFAULT 0,
  CONSTRAINT singleton_settings CHECK (id = 1),
  CONSTRAINT positive_allowance CHECK (monthly_allowance >= 0)
) ENGINE=InnoDB;

INSERT IGNORE INTO settings (id,monthly_allowance) VALUES (1,0);

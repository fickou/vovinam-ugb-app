CREATE DATABASE IF NOT EXISTS vovinam_ugb;
USE vovinam_ugb;

-- Users table (replacing Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('super_admin', 'admin', 'treasurer', 'coach', 'member') NOT NULL DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seasons
CREATE TABLE IF NOT EXISTS seasons (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_fee INT NOT NULL DEFAULT 2000,
    monthly_fee INT NOT NULL DEFAULT 1000,
    annual_total INT NOT NULL DEFAULT 10000,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Members
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    photo_url TEXT,
    status ENUM('active', 'suspended', 'former') NOT NULL DEFAULT 'active',
    member_number VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Registrations
CREATE TABLE IF NOT EXISTS registrations (
    id VARCHAR(36) PRIMARY KEY,
    member_id VARCHAR(36) NOT NULL,
    season_id VARCHAR(36) NOT NULL,
    registration_date DATE NOT NULL,
    registration_fee_paid BOOLEAN NOT NULL DEFAULT FALSE,
    is_validated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (member_id, season_id),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    member_id VARCHAR(36) NOT NULL,
    season_id VARCHAR(36) NOT NULL,
    amount INT NOT NULL,
    payment_type ENUM('registration', 'monthly', 'annual') NOT NULL,
    payment_method ENUM('wave', 'cash', 'other') NOT NULL,
    payment_date DATE NOT NULL,
    month_number INT,
    proof_url TEXT,
    notes TEXT,
    recorded_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Trigger for member_number
DELIMITER //
CREATE TRIGGER before_insert_members
BEFORE INSERT ON members
FOR EACH ROW
BEGIN
    DECLARE year_part VARCHAR(4);
    DECLARE sequence_num INT;
    
    IF NEW.member_number IS NULL THEN
        SET year_part = DATE_FORMAT(CURRENT_DATE, '%Y');
        SELECT COALESCE(MAX(CAST(SUBSTRING(member_number, 5) AS UNSIGNED)), 0) + 1
        INTO sequence_num
        FROM members
        WHERE member_number LIKE CONCAT(year_part, '%');
        
        SET NEW.member_number = CONCAT(year_part, LPAD(sequence_num, 4, '0'));
    END IF;
END;
//
DELIMITER ;

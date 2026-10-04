-- PostgreSQL Schema for Laughs With Ramesh Connecting

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    intermediate_year INT NOT NULL,
    board VARCHAR(100) NOT NULL,
    target_exam VARCHAR(100) NOT NULL,
    target_branch VARCHAR(100),
    preferred_location VARCHAR(255),
    target_rank INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS colleges (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    affiliation VARCHAR(255),
    website VARCHAR(255),
    fees_per_year VARCHAR(100),
    placement_info TEXT,
    facilities TEXT,
    source VARCHAR(255) NOT NULL,
    last_updated DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS cutoff_records (
    id BIGSERIAL PRIMARY KEY,
    exam VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    counselling_round INT NOT NULL,
    college_code VARCHAR(50) NOT NULL,
    college_name VARCHAR(255) NOT NULL,
    branch_code VARCHAR(20) NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    opening_rank INT NOT NULL,
    closing_rank INT NOT NULL,
    source VARCHAR(255) NOT NULL,
    last_updated DATE DEFAULT CURRENT_DATE
);

-- Pre-seed default Roles if absent
INSERT INTO roles (id, name) VALUES (1, 'ROLE_STUDENT') ON CONFLICT DO NOTHING;
INSERT INTO roles (id, name) VALUES (2, 'ROLE_ADMIN') ON CONFLICT DO NOTHING;

CREATE DATABASE concert_management;

-- Таблица компаний
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    founded_year INTEGER,
    headquarters VARCHAR(100),
    website VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица менеджеров
CREATE TABLE managers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    company_id INTEGER REFERENCES companies(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица групп
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company_id INTEGER REFERENCES companies(id),
    debut_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    genre VARCHAR(50),
    member_count INTEGER DEFAULT 1,
    manager_id INTEGER REFERENCES managers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица площадок
CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    address TEXT,
    venue_type VARCHAR(50),
    capacity INTEGER,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    equipment_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица координаторов
CREATE TABLE coordinators (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    specialization VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица технических команд
CREATE TABLE tech_teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    team_type VARCHAR(50),
    member_count INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'available',
    leader_name VARCHAR(100),
    leader_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица мероприятий
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    event_type VARCHAR(50),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'planned',
    group_id INTEGER REFERENCES groups(id),
    venue_id INTEGER REFERENCES venues(id),
    coordinator_id INTEGER REFERENCES coordinators(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    manager_id INTEGER REFERENCES managers(id),
    coordinator_id INTEGER REFERENCES coordinators(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Заполняем данными

-- Компании
INSERT INTO companies (name, founded_year, headquarters, website) VALUES
('JYP Entertainment', 1997, 'Seoul, South Korea', 'https://jype.com'),
('HYBE Corporation', 2005, 'Seoul, South Korea', 'https://hybecorp.com');

-- Менеджеры
INSERT INTO managers (full_name, email, phone, company_id) VALUES
('Sergey Lee', 'sergey.lee@jype.com', '+821012345678', 1),
('Anna Park', 'anna.park@hybe.com', '+821098765432', 2),
('Kim Min-ji', 'minji.kim@jype.com', '+821023456789', 1);

-- Группы
INSERT INTO groups (name, company_id, debut_date, status, genre, member_count, manager_id) VALUES
('Stray Kids', 1, '2018-03-25', 'active', 'K-pop, Hip-hop', 8, 1),
('ITZY', 1, '2019-02-12', 'active', 'K-pop, Dance', 5, 3),
('BTS', 2, '2013-06-13', 'active', 'K-pop, Pop', 7, 2),
('NewJeans', 2, '2022-07-22', 'active', 'K-pop', 5, 2);

-- Площадки
INSERT INTO venues (name, city, address, venue_type, capacity, contact_person, contact_phone) VALUES
('Olympic Gymnastics Arena', 'Seoul', '424 Olympic-ro, Songpa-gu', 'arena', 15000, 'Park Ji-hoon', '+82234015000'),
('KBS Hall', 'Seoul', 'Yeouido-dong, Yeongdeungpo-gu', 'concert hall', 2000, 'Kim Soo-ah', '+8227811000'),
('Jamsil Arena', 'Seoul', 'Jamsil-dong, Songpa-gu', 'arena', 11000, 'Lee Min-ho', '+82221431000');

-- Координаторы
INSERT INTO coordinators (full_name, email, phone, specialization) VALUES
('Ivan Yang', 'ivan.yang@jype.com', '+821055566777', 'Техническая организация'),
('Maria Kim', 'maria.kim@hybe.com', '+821077788899', 'Логистика мероприятий');

-- Технические команды
INSERT INTO tech_teams (name, team_type, member_count, status, leader_name, leader_phone) VALUES
('Sound Masters', 'sound', 8, 'available', 'Park Jin-woo', '+82101112233'),
('Lightwave Team', 'lighting', 6, 'available', 'Kim Seo-yeon', '+82102223344'),
('Stage Masters', 'stage', 10, 'busy', 'Choi Min-soo', '+82103334455'),
('Security Team Alpha', 'security', 12, 'available', 'Lee Joon-seo', '+82104445566');

-- Мероприятия
INSERT INTO events (name, event_type, start_date, end_date, status, group_id, venue_id, coordinator_id, description) VALUES
('Stray Kids World Tour - Seoul', 'concert', '2024-11-15 19:00:00', '2024-11-15 22:00:00', 'confirmed', 1, 1, 1, 'World tour finale in Seoul'),
('ITZY Fan Meeting', 'fanmeeting', '2024-11-20 18:00:00', '2024-11-20 20:00:00', 'planned', 2, 2, 2, 'Fan meeting with ITZY members'),
('BTS Army Connect', 'fanmeeting', '2024-12-05 20:00:00', '2024-12-05 22:00:00', 'planned', 3, 3, 2, 'Special event for BTS fans'),
('NewJeans Debut Anniversary', 'concert', '2024-12-10 18:30:00', '2024-12-10 21:30:00', 'confirmed', 4, 1, 1, 'Celebrating 2nd debut anniversary');

-- Пользователи (пароль для всех: demo123)
INSERT INTO users (email, password_hash, full_name, role, manager_id, coordinator_id) VALUES
('manager@jype.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeG3xdEiwkUOIA6F.4d4HhV5xLv7QzQ6a', 'Sergey Lee', 'manager', 1, NULL),
('admin@jype.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeG3xdEiwkUOIA6F.4d4HhV5xLv7QzQ6a', 'Admin User', 'admin', NULL, NULL),
('coordinator@jype.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeG3xdEiwkUOIA6F.4d4HhV5xLv7QzQ6a', 'Ivan Yang', 'coordinator', NULL, 1);
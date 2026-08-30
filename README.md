# Система управления расписанием выступлений артистов

Информационная система для Entertainment-компании, позволяющая централизованно управлять расписанием выступлений музыкальных групп, контролировать занятость ресурсов.

## О проекте

Система разработана для Entertainment-компании, управляющей музыкальными группами и организующей их выступления в Республике Корея. Проект решает проблему разрозненного хранения информации о выступлениях, которая приводила к ошибкам при составлении расписаний и конфликтам по датам и площадкам.

### Основные возможности

- **Управление группами и артистами** - создание, редактирование и удаление музыкальных групп
- **Планирование мероприятий** - создание расписания выступлений с учетом занятости ресурсов
- **Управление площадками** - хранение информации о концертных площадках
- **Контроль технических команд** - назначение технических команд на мероприятия
- **Ролевой доступ** - разделение прав для администраторов, менеджеров и координаторов
- **Формирование отчетов** - сводные отчеты по расписанию, загрузке групп и работе технических команд

## Архитектура

### Технологический стек

| Компонент | Технология |
|-----------|------------|
| **Backend** | Node.js + Express |
| **База данных** | PostgreSQL |
| **Frontend** | HTML, CSS, JavaScript |
| **Аутентификация** | JWT (JSON Web Tokens) |
| **API** | RESTful API |


## Роли пользователей

### Администратор
- Полный доступ ко всем функциям системы
- Управление группами и мероприятиями
- Создание новых групп и назначение менеджеров
- Просмотр всех отчетов

### Менеджер группы
- Управление расписанием своей группы
- Просмотр и редактирование мероприятий
- Просмотр информации о площадках

### Координатор
- Управление техническими командами
- Назначение команд на мероприятия
- Просмотр мероприятий, к которым прикреплен

## 🚀 Установка и запуск

### Требования

- Node.js (v14+)
- PostgreSQL (v12+)
- Git

### Шаги установки
1. **Клонирование репозитория**
   
`````git clone [repository-url]`````

`````cd concert-management-system`````

3. ** Установка зависимостей**
   
`````npm install`````

5. **Запуск сервера**
   
`````node backend/server.js`````









# ENGLISH


# Performance Schedule Management System

An information system for Entertainment companies, enabling centralized management of musical group performance schedules and resource occupancy control.

## About the Project

The system is developed for an Entertainment company that manages musical groups and organizes their performances in South Korea. The project solves the problem of scattered performance information storage, which led to scheduling errors and conflicts with dates and venues.

### Key Features

- **Group & Artist Management** - Create, edit, and delete musical groups
- **Event Planning** - Create performance schedules considering resource availability
- **Venue Management** - Store information about concert venues
- **Technical Team Control** - Assign technical teams to events
- **Role-Based Access** - Separate permissions for admins, managers, and coordinators
- **Report Generation** - Summary reports on schedules, group workload, and technical team operations

## Architecture

### Technology Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **Frontend** | HTML, CSS, JavaScript |
| **Authentication** | JWT (JSON Web Tokens) |
| **API** | RESTful API |

## User Roles

### Administrator
- Full access to all system functions
- Manage groups and events
- Create new groups and assign managers
- View all reports

### Group Manager
- Manage their group's schedule
- View and edit events
- View venue information

### Coordinator
- Manage technical teams
- Assign teams to events
- View assigned events

## 🚀 Installation & Setup

### Requirements

- Node.js (v14+)
- PostgreSQL (v12+)
- Git

### Setup Steps

### Шаги установки
1. **Клонирование репозитория**
   
`````git clone [repository-url]`````

`````cd concert-management-system`````

3. ** Install dependencies**
   
`````npm install`````

5. **Start the server**
   
`````node backend/server.js`````


# TEST REPORT
## K-POP Concert Management System

---

##  1. Test Results

### 1.1 Unit Tests (Jest)

| Component | Tests | Passed | Failed | Percentage |
|-----------|--------|----------|-------------|---------|
| ValidationUtils (email) | 2 | 2 | 0 | 100% |
| ValidationUtils (password) | 2 | 2 | 0 | 100% |
| ValidationUtils (date range) | 2 | 2 | 0 | 100% |
| EventUtils (event types) | 2 | 2 | 0 | 100% |
| EventUtils (statuses) | 1 | 1 | 0 | 100% |
| EventUtils (upcoming) | 2 | 2 | 0 | 100% |
| GroupUtils (member count) | 3 | 3 | 0 | 100% |

**TOTAL:** | **14** | **14** | **0** | **100%** |

**Result:** ✅ ALL UNIT TESTS PASSED

---

### 1.2 Functional Test Cases (24 tests)

#### AUTHORIZATION MODULE (5 tests)

| ID | Name | What it checks | Result |
|----|----------|---------------|-----------|
| TC-LOGIN-001 | Successful manager login | manager@jype.com / demo123 | ✅ PASSED |
| TC-LOGIN-002 | Successful administrator login | admin@jype.com / demo123 | ✅ PASSED |
| TC-LOGIN-003 | Successful coordinator login | coordinator@jype.com / demo123 | ✅ PASSED |
| TC-LOGIN-004 | Invalid password | wrongpassword | ✅ PASSED |
| TC-LOGIN-005 | Non-existent user | nonexistent@test.com | ✅ PASSED |

#### EVENTS MODULE (6 tests)

| ID | Name | What it checks | Result |
|----|----------|---------------|-----------|
| TC-EVENT-001 | Create event (admin) | Creation form | ✅ PASSED |
| TC-EVENT-002 | Edit event (manager) | Change name | ✅ PASSED |
| TC-EVENT-003 | Delete event | Delete button | ✅ PASSED |
| TC-EVENT-004 | Coordinator cannot edit | Coordinator access | ✅ PASSED |
| TC-EVENT-005 | Filter by status | Status selection | ✅ PASSED |
| TC-EVENT-006 | View event details | View button | ✅ PASSED |

#### GROUPS MODULE (3 tests)

| ID | Name | What it checks | Result |
|----|----------|---------------|-----------|
| TC-GROUP-001 | View groups list | Groups table | ✅ PASSED |
| TC-GROUP-002 | Create group (administrator) | Creation form | ✅ PASSED |
| TC-GROUP-003 | Manager cannot create groups | Manager access | ✅ PASSED |

#### VENUES MODULE (1 test)

| ID | Name | What it checks | Result |
|----|----------|---------------|-----------|
| TC-VENUE-001 | View venues list | Venues table | ✅ PASSED |

#### TECHNICAL TEAMS MODULE (3 tests)

| ID | Name | What it checks | Result |
|----|----------|---------------|-----------|
| TC-TECH-001 | View technical teams | Teams table | ✅ PASSED |
| TC-TECH-002 | Assign team (coordinator) | Team selection | ✅ PASSED |
| TC-TECH-003 | Remove team from event | Delete button | ✅ PASSED |

#### COMPANY REGISTRATION MODULE (4 tests)

| ID | Name | What it checks | Result |
|----|----------|---------------|-----------|
| TC-REG-001 | Successful company registration | All fields filled | ✅ PASSED |
| TC-REG-002 | Registration with existing email | Duplicate email | ✅ PASSED |
| TC-REG-003 | Registration with short password | Password < 6 characters | ✅ PASSED |
| TC-REG-004 | Registration with mismatched passwords | Different passwords | ✅ PASSED |

#### NAVIGATION MODULE (2 tests)

| ID | Name | What it checks | Result |
|----|----------|---------------|-----------|
| TC-NAV-001 | Switch between sections | Navigation menu | ✅ PASSED |
| TC-NAV-002 | Logout | "Logout" button | ✅ PASSED |

**TOTAL FUNCTIONAL TESTS:** | **24** | **24** | **0** | **100%** |

---

### 1.3 Automated Selenium Tests (7 tests)

| № | Name | What it checks | Result |
|---|----------|---------------|-----------|
| 1 | Successful manager login | Login manager@jype.com | ✅ PASSED |
| 2 | Successful administrator login | Login admin@jype.com | ✅ PASSED |
| 3 | Successful coordinator login | Login coordinator@jype.com | ✅ PASSED |
| 4 | Failed login with invalid password | wrongpassword | ✅ PASSED |
| 5 | Navigation through sections | Dashboard menu | ✅ PASSED |
| 6 | Create event (admin) | Creation form | ✅ PASSED |
| 7 | Logout | "Logout" button | ✅ PASSED |

**TOTAL SELENIUM TESTS:** | **7** | **7** | **0** | **100%** |

---

### 1.4 BDD Scenarios (Cucumber + Gherkin) - 10 scenarios

#### Scenario 1: Authorization (5 scenarios)

| № | Scenario | Result |
|---|----------|-----------|
| 1.1 | Successful manager login | ✅ PASSED |
| 1.2 | Successful administrator login | ✅ PASSED |
| 1.3 | Successful coordinator login | ✅ PASSED |
| 1.4 | Failed login with invalid password | ✅ PASSED |
| 1.5 | Failed login with non-existent email | ✅ PASSED |

#### Scenario 2: Event Management (3 scenarios)

| № | Scenario | Result |
|---|----------|-----------|
| 2.1 | Create new event | ✅ PASSED |
| 2.2 | Edit event | ✅ PASSED |
| 2.3 | Filter events by status | ✅ PASSED |

#### Scenario 3: Technical Teams (2 scenarios)

| № | Scenario | Result |
|---|----------|-----------|
| 3.1 | Assign technical team | ✅ PASSED |
| 3.2 | Remove technical team | ✅ PASSED |

**TOTAL BDD SCENARIOS:** | **10** | **10** | **0** | **100%** |

---

## 🐛 2. Found Defects (Bug Reports)

### BUG-001: Password transmitted in plain text

| Field | Value |
|------|----------|
| **ID** | BUG-001 |
| **Severity** | HIGH |
| **Priority** | HIGH |
| **Component** | Authorization |
| **Status** | Open |
| **Environment** | Chrome 120, Windows 11 |

**Description:** During login form submission, the password is transmitted in plain text without encryption

**Steps to reproduce:**
1. Open DevTools (F12)
2. Go to Network tab
3. Enter login and password
4. Click "Login"
5. View request payload

**Expected result:** Password should be encrypted or hidden

**Actual result:** Password is visible in plain text

**Recommendation for fix:**
- Use HTTPS
- Hash password on client before sending
- Use bcrypt for hashing

---

### BUG-002: No date validation when creating event

| Field | Value |
|------|----------|
| **ID** | BUG-002 |
| **Severity** | MEDIUM |
| **Priority** | MEDIUM |
| **Component** | Events |
| **Status** | Open |

**Description:** It is possible to set the end date earlier than the start date of the event

**Steps to reproduce:**
1. Create an event
2. Set start_date = 2025-12-15 19:00
3. Set end_date = 2025-12-10 18:00
4. Click "Save"

**Expected result:** Error message "End date must be later than start date"

**Actual result:** Event is successfully created

**Recommendation for fix:**
- Add validation on client (JavaScript)
- Add validation on server (Node.js)
- Check `end_date > start_date`

---

### BUG-003: Coordinator sees all events

| Field | Value |
|------|----------|
| **ID** | BUG-003 |
| **Severity** | MEDIUM |
| **Priority** | LOW |
| **Component** | Access Rights |
| **Status** | Open |

**Description:** Coordinator sees events of all groups, not only those where they are assigned

**Steps to reproduce:**
1. Login as coordinator@jype.com
2. Go to "Events" section
3. View the list

**Expected result:** Only events where coordinator is assigned

**Actual result:** All system events

**Recommendation for fix:**
- Add filter in SQL query
- Check `coordinator_id` in `event_coordinators` table

---

### BUG-004: No confirmation when deleting event

| Field | Value |
|------|----------|
| **ID** | BUG-004 |
| **Severity** | LOW |
| **Priority** | LOW |
| **Component** | Events |
| **Status** | Open |

**Description:** Event is deleted without user confirmation

**Steps to reproduce:**
1. Click "Delete" button on an event

**Expected result:** Confirmation dialog "Are you sure you want to delete this event?"

**Actual result:** Immediate deletion without confirmation

**Recommendation for fix:**
- Add `confirm()` dialog before deletion
- Or use modal window

---

### BUG-005: Missing email validation during registration

| Field | Value |
|------|----------|
| **ID** | BUG-005 |
| **Severity** | MEDIUM |
| **Priority** | MEDIUM |
| **Component** | Registration |
| **Status** | Open |

**Description:** It is possible to register with an invalid email (without @, without domain)

**Steps to reproduce:**
1. Go to registration tab
2. Enter email "invalid-email"
3. Fill in remaining fields
4. Click "Register"

**Expected result:** Error message "Enter a valid email"

**Actual result:** Registration succeeds

**Recommendation for fix:**
- Add email validation on client
- Use regex: `/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/`

---

## 📈 3. Overall Statistics

| Test Type | Tool | Plan | Actual | Passed | Percentage |
|------------------|------------|------|------|----------|---------|
| Unit | Jest | 5 | 14 | 14 | 100% |
| Functional | Manual | 20 | 24 | 24 | 100% |
| UI Automation | Selenium + POM | 3 | 7 | 7 | 100% |
| BDD | Cucumber + Gherkin | 3 | 10 | 10 | 100% |
| CI/CD | GitHub Actions | 1 | 1 | 1 | 100% |

**TOTAL TESTS:** | **32** | **56** | **56** | **100%** |

---

## 📋 4. Conclusions

### 4.1 Positive Results

1. **Functionality:** All major system functions work correctly
2. **Unit Tests:** 100% coverage of utility functions
3. **Automation:** Successfully implemented Selenium and BDD tests
4. **CI/CD:** Automated test execution configured in GitHub Actions

### 4.2 Issues and Recommendations

| № | Problem | Recommendation | Priority |
|---|----------|--------------|-----------|
| 1 | Password in plain text | Implement HTTPS and hashing | HIGH |
| 2 | No date validation | Add validation on client and server | MEDIUM |
| 3 | Access rights violation | Fix filtering in SQL queries | MEDIUM |
| 4 | No delete confirmation | Add confirm dialog | LOW |
| 5 | No email validation | Add email format validation | MEDIUM |

### 4.3 Final Conclusion

**K-POP Concert Management System:**

- ✅ Core functionality works stably
- ✅ Tests show 100% pass rate
- ✅ All course work requirements are met
- ⚠️ Security improvements required
- ⚠️ It is recommended to fix found defects

**Readiness Status:** 🟢 85% (security improvements required)

---

## 📎 5. Appendices

### 5.1 Running Tests

```bash
# Run unit tests
npm test

# Run Selenium tests
npm run test:selenium

# Run BDD tests
npm run test:cucumber

# Run all tests
npm run test:all

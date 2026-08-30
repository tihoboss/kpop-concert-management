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

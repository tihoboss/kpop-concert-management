const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'frontend')));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'concert_management',
    password: '1234',
    port: 3609,
});

const JWT_SECRET = '1234';

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.get('/api/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT 1 + 1 as result');
        res.json({
            message: 'Database connection successful',
            testResult: result.rows[0].result
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// ============== АУТЕНТИФИКАЦИЯ ==============

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    try {
        const userQuery = await pool.query(
            `SELECT u.*, 
                    m.full_name as manager_name, 
                    c.full_name as coordinator_name,
                    comp.name as company_name
             FROM users u
             LEFT JOIN managers m ON u.manager_id = m.id
             LEFT JOIN coordinators c ON u.coordinator_id = c.id
             LEFT JOIN companies comp ON u.company_id = comp.id
             WHERE u.email = $1`,
            [email]
        );

        if (userQuery.rows.length === 0) {
            console.log('User not found:', email);
            return res.status(401).json({ error: 'Пользователь не найден' });
        }

        const user = userQuery.rows[0];
        const isPasswordValid = password === user.password_hash;
        
        if (!isPasswordValid) {
            console.log('Invalid password for:', email);
            return res.status(401).json({ error: 'Неверный пароль' });
        }

        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.full_name,
            companyId: user.company_id,
            companyName: user.company_name
        };

        if (user.manager_id) {
            tokenPayload.managerId = user.manager_id;
            tokenPayload.managerName = user.manager_name;
        }

        if (user.coordinator_id) {
            tokenPayload.coordinatorId = user.coordinator_id;
            tokenPayload.coordinatorName = user.coordinator_name;
        }

        const token = jwt.sign(
            tokenPayload,
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful for:', email);
        console.log('User company:', user.company_name, 'ID:', user.company_id);

        const userResponse = {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            companyId: user.company_id,
            companyName: user.company_name
        };

        if (user.manager_id) {
            userResponse.managerId = user.manager_id;
            userResponse.managerName = user.manager_name;
        }

        if (user.coordinator_id) {
            userResponse.coordinatorId = user.coordinator_id;
            userResponse.coordinatorName = user.coordinator_name;
        }

        res.json({
            success: true,
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
// ============== РЕГИСТРАЦИЯ АДМИНИСТРАТОРА И КОМПАНИИ ==============

app.post('/api/auth/register-admin', async (req, res) => {
    const { 
        companyName, 
        adminFullName, 
        adminEmail, 
        adminPassword,
        adminPhone,
        companyFounded,
        companyWebsite,
        companyAddress,
        companyDescription
    } = req.body;

    console.log('📝 Registration attempt for company:', companyName);

    if (!companyName || !adminFullName || !adminEmail || !adminPassword) {
        return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
    }

    if (adminPassword.length < 6) {
        return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Проверяем, существует ли уже компания с таким названием
        const existingCompany = await client.query(
            'SELECT id FROM companies WHERE name = $1',
            [companyName]
        );

        if (existingCompany.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Компания с таким названием уже существует' });
        }

        // Проверяем, не занят ли email администратора
        const existingUser = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [adminEmail]
        );

        if (existingUser.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        // Создаем компанию
        const companyResult = await client.query(
            `INSERT INTO companies (name, founded_year, website, address, description)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, founded_year, website, address, description`,
            [companyName, companyFounded || null, companyWebsite || null, 
             companyAddress || null, companyDescription || null]
        );

        const company = companyResult.rows[0];
        console.log('✅ Company created:', company.id);

        // Создаем запись администратора в таблице managers (администратор - это тоже менеджер)
        const managerResult = await client.query(
            `INSERT INTO managers (full_name, email, phone, company_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [adminFullName, adminEmail, adminPhone || null, company.id]
        );

        const managerId = managerResult.rows[0].id;
        console.log('✅ Manager created:', managerId);

        // Создаем пользователя для входа
        const userResult = await client.query(
            `INSERT INTO users (email, password_hash, full_name, role, manager_id, company_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, email, full_name, role, company_id`,
            [adminEmail, adminPassword, adminFullName, 'admin', managerId, company.id]
        );

        const user = userResult.rows[0];
        console.log('✅ Admin user created:', user.id);

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Компания и администратор успешно зарегистрированы',
            company: {
                id: company.id,
                name: company.name,
                founded_year: company.founded_year,
                website: company.website,
                address: company.address,
                description: company.description
            },
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: 'Ошибка при регистрации компании' });
    } finally {
        client.release();
    }
});

// Получение информации о компании по ID
app.get('/api/companies/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    
    try {
        // Проверяем доступ
        if (user.role === 'admin' && user.companyId !== parseInt(id)) {
            return res.status(403).json({ error: 'Нет доступа к этой компании' });
        }
        
        const result = await pool.query(
            `SELECT id, name, founded_year, website, address, description, 
                    created_at, updated_at
             FROM companies WHERE id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Компания не найдена' });
        }
        
        // Получаем статистику компании
        const stats = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM groups WHERE company_id = $1 AND status != 'deleted') as total_groups,
                (SELECT COUNT(*) FROM managers WHERE company_id = $1) as total_managers,
                (SELECT COUNT(*) FROM coordinators WHERE company_id = $1) as total_coordinators,
                (SELECT COUNT(*) FROM events e 
                 JOIN groups g ON e.group_id = g.id 
                 WHERE g.company_id = $1 AND e.status != 'cancelled') as total_events,
                (SELECT COUNT(*) FROM users WHERE company_id = $1 AND role = 'admin') as total_admins`,
            [id]
        );
        
        res.json({
            ...result.rows[0],
            stats: stats.rows[0]
        });
        
    } catch (error) {
        console.error('Error getting company:', error);
        res.status(500).json({ error: 'Ошибка при получении информации о компании' });
    }
});

// ============== МЕРОПРИЯТИЯ ==============


// Получение мероприятия по ID
// ============== МЕРОПРИЯТИЯ ==============

// Получение всех мероприятий (СПИСОК)
app.get('/api/events', authenticateToken, async (req, res) => {
    const user = req.user;
    const { status, event_type, group_id, venue_id, start_date_from, start_date_to } = req.query;

    console.log('Getting events for user:', user.email, 'role:', user.role);

    try {
        let query = `
            SELECT e.*, g.name as group_name, v.name as venue_name
            FROM events e
            LEFT JOIN groups g ON e.group_id = g.id
            LEFT JOIN venues v ON e.venue_id = v.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        // Фильтр по роли пользователя
        if (user.role === 'manager' && user.managerId) {
            query += ` AND EXISTS (
                SELECT 1 FROM groups g2 
                WHERE g2.id = e.group_id AND g2.manager_id = $${paramIndex}
            )`;
            params.push(user.managerId);
            paramIndex++;
        } else if (user.role === 'coordinator' && user.coordinatorId) {
            query += ` AND EXISTS (
                SELECT 1 FROM event_coordinators ec 
                WHERE ec.event_id = e.id AND ec.coordinator_id = $${paramIndex}
            )`;
            params.push(user.coordinatorId);
            paramIndex++;
        } else if (user.role === 'admin' && user.companyId) {
            // Администратор видит мероприятия только групп своей компании
            query += ` AND EXISTS (
                SELECT 1 FROM groups g2 
                WHERE g2.id = e.group_id AND g2.company_id = $${paramIndex}
            )`;
            params.push(user.companyId);
            paramIndex++;
        }

        // Дополнительные фильтры из query параметров
        if (status) {
            query += ` AND e.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (event_type) {
            query += ` AND e.event_type = $${paramIndex}`;
            params.push(event_type);
            paramIndex++;
        }

        if (group_id) {
            query += ` AND e.group_id = $${paramIndex}`;
            params.push(group_id);
            paramIndex++;
        }

        if (venue_id) {
            query += ` AND e.venue_id = $${paramIndex}`;
            params.push(venue_id);
            paramIndex++;
        }

        if (start_date_from) {
            query += ` AND e.start_date >= $${paramIndex}`;
            params.push(start_date_from);
            paramIndex++;
        }

        if (start_date_to) {
            query += ` AND e.start_date <= $${paramIndex}`;
            params.push(start_date_to);
            paramIndex++;
        }

        query += ' ORDER BY e.start_date DESC';

        const result = await pool.query(query, params);
        
        // Получаем детали для каждого мероприятия
        const eventsWithDetails = await Promise.all(result.rows.map(async (event) => {
            const coordinatorsResult = await pool.query(`
                SELECT c.id, c.full_name, c.email, c.specialization
                FROM coordinators c
                JOIN event_coordinators ec ON c.id = ec.coordinator_id
                WHERE ec.event_id = $1
            `, [event.id]);
            
            const techTeamsResult = await pool.query(`
                SELECT tt.id, tt.name, tt.team_type, tt.specialization, ett.notes
                FROM tech_teams tt
                JOIN event_tech_teams ett ON tt.id = ett.tech_team_id
                WHERE ett.event_id = $1
            `, [event.id]);
            
            return {
                ...event,
                coordinators: coordinatorsResult.rows,
                techTeams: techTeamsResult.rows
            };
        }));

        console.log(`Found ${eventsWithDetails.length} events for user ${user.email}`);
        res.json(eventsWithDetails);
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({ error: 'Ошибка при получении мероприятий' });
    }
});

// Получение мероприятия по ID
app.get('/api/events/:id', authenticateToken, async (req, res) => {
    const user = req.user;
    const eventId = req.params.id;

    try {
        // Проверяем доступ к мероприятию
        const accessCheck = await pool.query(
            `SELECT e.*, g.manager_id, g.company_id 
             FROM events e 
             LEFT JOIN groups g ON e.group_id = g.id 
             WHERE e.id = $1`,
            [eventId]
        );

        if (accessCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }

        const event = accessCheck.rows[0];

        // Проверка прав доступа
        if (user.role === 'manager') {
            if (!user.managerId || event.manager_id !== user.managerId) {
                return res.status(403).json({ error: 'Нет доступа к этому мероприятию' });
            }
        } else if (user.role === 'coordinator') {
            const coordinatorCheck = await pool.query(
                'SELECT 1 FROM event_coordinators WHERE event_id = $1 AND coordinator_id = $2',
                [eventId, user.coordinatorId]
            );
            if (coordinatorCheck.rows.length === 0) {
                return res.status(403).json({ error: 'Нет доступа к этому мероприятию' });
            }
        } else if (user.role === 'admin') {
            if (event.company_id !== user.companyId) {
                return res.status(403).json({ error: 'Нет доступа к этому мероприятию' });
            }
        }

        // Получаем полные данные мероприятия
        const result = await pool.query(
            `SELECT e.*, g.name as group_name, v.name as venue_name
             FROM events e
             LEFT JOIN groups g ON e.group_id = g.id
             LEFT JOIN venues v ON e.venue_id = v.id
             WHERE e.id = $1`,
            [eventId]
        );

        const fullEvent = result.rows[0];
        
        // Получаем координаторов
        const coordinatorsResult = await pool.query(`
            SELECT c.id, c.full_name, c.email, c.specialization
            FROM coordinators c
            JOIN event_coordinators ec ON c.id = ec.coordinator_id
            WHERE ec.event_id = $1
        `, [eventId]);
        
        // Получаем технические команды
        const techTeamsResult = await pool.query(`
            SELECT tt.id, tt.name, tt.team_type, tt.specialization, ett.notes
            FROM tech_teams tt
            JOIN event_tech_teams ett ON tt.id = ett.tech_team_id
            WHERE ett.event_id = $1
        `, [eventId]);
        
        fullEvent.coordinators = coordinatorsResult.rows;
        fullEvent.techTeams = techTeamsResult.rows;

        res.json(fullEvent);
    } catch (error) {
        console.error('Error getting event:', error);
        res.status(500).json({ error: 'Ошибка при получении мероприятия' });
    }
});

app.post('/api/events', authenticateToken, async (req, res) => {
    const { name, event_type, start_date, end_date, group_id, venue_id, description, status } = req.body;
    const user = req.user;

    console.log('Creating event:', { name, event_type, group_id, userRole: user.role });
    if (user.role === 'coordinator') {
        return res.status(403).json({ error: 'Координатор не может создавать мероприятия' });
    }

    try {
        const groupCheck = await pool.query(
            'SELECT g.id, g.manager_id, g.company_id FROM groups g WHERE g.id = $1', 
            [group_id]
        );

        if (groupCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Группа не найдена' });
        }

        const group = groupCheck.rows[0];

        if (user.role === 'manager') {
            if (group.manager_id !== user.managerId) {
                return res.status(403).json({ error: 'Вы можете создавать мероприятия только для своих групп' });
            }
        } else if (user.role === 'admin') {
            if (group.company_id !== user.companyId) {
                return res.status(403).json({ error: 'Вы можете создавать мероприятия только для групп своей компании' });
            }
        }
        const venueCheck = await pool.query('SELECT id FROM venues WHERE id = $1', [venue_id]);
        if (venueCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Площадка не найдена' });
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (endDate <= startDate) {
            return res.status(400).json({ error: 'Дата окончания должна быть позже даты начала' });
        }

        const eventResult = await pool.query(
            `INSERT INTO events (name, event_type, start_date, end_date, status, group_id, venue_id, description)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [name, event_type, start_date, end_date, status || 'planned', group_id, venue_id, description || '']
        );

        const event = eventResult.rows[0];
        const fullEvent = await getFullEventData(event.id);
        
        console.log('Event created:', event.id);
        res.status(201).json(fullEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Ошибка при создании мероприятия' });
    }
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, event_type, start_date, end_date, status, group_id, venue_id, description } = req.body;
    const user = req.user;

    console.log('Updating event:', id);
    console.log('Request body:', req.body);

    try {
        // Проверяем существование мероприятия
        const eventCheck = await pool.query(
            `SELECT e.*, g.manager_id as group_manager_id, g.company_id 
             FROM events e
             LEFT JOIN groups g ON e.group_id = g.id
             WHERE e.id = $1`,
            [id]
        );
        
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }

        const event = eventCheck.rows[0];

        // Проверка прав доступа
        if (user.role === 'manager') {
            if (!user.managerId || event.group_manager_id !== user.managerId) {
                return res.status(403).json({ error: 'Вы можете редактировать только мероприятия своих групп' });
            }
            
            if (status === 'completed') {
                const eventDate = new Date(event.start_date);
                const now = new Date();
                if (eventDate > now) {
                    return res.status(400).json({ error: 'Нельзя отметить как завершенное мероприятие, которое еще не состоялось' });
                }
            }
        } else if (user.role === 'coordinator') {
            return res.status(403).json({ error: 'Координатор может только управлять техническими командами' });
        } else if (user.role === 'admin') {
            if (event.company_id !== user.companyId) {
                return res.status(403).json({ error: 'Вы можете редактировать только мероприятия групп своей компании' });
            }
        }

        // Проверка группы, если меняется
        let targetGroupId = group_id || event.group_id;
        if (group_id && group_id !== event.group_id) {
            const groupCheck = await pool.query(
                'SELECT id, company_id FROM groups WHERE id = $1', 
                [group_id]
            );
            if (groupCheck.rows.length === 0) {
                return res.status(400).json({ error: 'Группа не найдена' });
            }
            if (user.role === 'admin' && groupCheck.rows[0].company_id !== user.companyId) {
                return res.status(403).json({ error: 'Группа должна принадлежать вашей компании' });
            }
            targetGroupId = group_id;
        }

        // Проверка площадки, если меняется
        let targetVenueId = venue_id || event.venue_id;
        if (venue_id && venue_id !== event.venue_id) {
            const venueCheck = await pool.query('SELECT id FROM venues WHERE id = $1', [venue_id]);
            if (venueCheck.rows.length === 0) {
                return res.status(400).json({ error: 'Площадка не найдена' });
            }
            targetVenueId = venue_id;
        }

        // Проверка дат
        const targetStartDate = start_date || event.start_date;
        const targetEndDate = end_date || event.end_date;
        
        const startDateObj = new Date(targetStartDate);
        const endDateObj = new Date(targetEndDate);
        
        if (endDateObj <= startDateObj) {
            return res.status(400).json({ error: 'Дата окончания должна быть позже даты начала' });
        }

        // Обновление мероприятия
        const result = await pool.query(
            `UPDATE events 
             SET name = $1, 
                 event_type = $2, 
                 start_date = $3, 
                 end_date = $4, 
                 status = $5, 
                 group_id = $6, 
                 venue_id = $7, 
                 description = $8
             WHERE id = $9
             RETURNING *`,
            [
                name || event.name, 
                event_type || event.event_type, 
                targetStartDate, 
                targetEndDate, 
                status || event.status, 
                targetGroupId, 
                targetVenueId, 
                description || event.description || '', 
                id
            ]
        );

        const updatedEvent = result.rows[0];
        
        // Получаем полные данные обновленного мероприятия
        const fullEvent = await getFullEventData(id);

        console.log('Event updated:', id);
        res.json(fullEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Ошибка при обновлении мероприятия: ' + error.message });
    }
});

// Удаление мероприятия
app.delete('/api/events/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    console.log('Deleting event:', id);

    try {
        // Проверка существования мероприятия
        const eventCheck = await pool.query(
            `SELECT e.*, g.manager_id as group_manager_id, g.company_id 
             FROM events e
             LEFT JOIN groups g ON e.group_id = g.id
             WHERE e.id = $1`,
            [id]
        );
        
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }

        const event = eventCheck.rows[0];

        // Проверка прав на удаление
        if (user.role === 'manager') {
            if (!user.managerId || event.group_manager_id !== user.managerId) {
                return res.status(403).json({ error: 'Вы можете удалять только мероприятия своих групп' });
            }
        } else if (user.role === 'coordinator') {
            return res.status(403).json({ error: 'Координатор не может удалять мероприятия' });
        } else if (user.role === 'admin') {
            if (event.company_id !== user.companyId) {
                return res.status(403).json({ error: 'Вы можете удалять только мероприятия групп своей компании' });
            }
        }

        // Удаляем связи с техническими командами
        await pool.query('DELETE FROM event_tech_teams WHERE event_id = $1', [id]);
        
        // Удаляем связи с координаторами
        await pool.query('DELETE FROM event_coordinators WHERE event_id = $1', [id]);
        
        // Удаляем мероприятие
        const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
        
        console.log('Event deleted:', id);
        res.json({ message: 'Мероприятие удалено', event: result.rows[0] });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Ошибка при удалении мероприятия' });
    }
});

// ============== ТЕХНИЧЕСКИЕ КОМАНДЫ ДЛЯ МЕРОПРИЯТИЙ ==============

// Получение технических команд мероприятия
app.get('/api/events/:id/tech-teams', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    console.log('Getting tech teams for event:', id);

    try {
        // Проверка доступа к мероприятию
        const eventCheck = await pool.query(
            `SELECT e.*, g.company_id FROM events e
             LEFT JOIN groups g ON e.group_id = g.id
             WHERE e.id = $1`,
            [id]
        );
        
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }

        const event = eventCheck.rows[0];

        // Проверка прав доступа
        if (user.role === 'coordinator') {
            const coordinatorCheck = await pool.query(
                'SELECT 1 FROM event_coordinators WHERE event_id = $1 AND coordinator_id = $2',
                [id, user.coordinatorId]
            );
            if (coordinatorCheck.rows.length === 0) {
                return res.status(403).json({ error: 'Нет доступа к этому мероприятию' });
            }
        } else if (user.role === 'admin') {
            if (event.company_id !== user.companyId) {
                return res.status(403).json({ error: 'Нет доступа к этому мероприятию' });
            }
        }

        const result = await pool.query(`
            SELECT tt.*, ett.notes
            FROM tech_teams tt
            JOIN event_tech_teams ett ON tt.id = ett.tech_team_id
            WHERE ett.event_id = $1
            ORDER BY tt.name
        `, [id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error getting tech teams for event:', error);
        res.status(500).json({ error: 'Ошибка при получении технических команд' });
    }
});

// Добавление технической команды к мероприятию
app.post('/api/events/:id/tech-teams', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { tech_team_id, notes } = req.body;
    const user = req.user;

    console.log('Adding tech team to event:', { eventId: id, techTeamId: tech_team_id });

    // Проверка прав
    if (user.role !== 'coordinator' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Только координатор или администратор может назначать технические команды' });
    }

    try {
        // Проверка существования мероприятия
        const eventCheck = await pool.query(
            `SELECT e.*, g.company_id FROM events e
             LEFT JOIN groups g ON e.group_id = g.id
             WHERE e.id = $1`,
            [id]
        );
        
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }

        const event = eventCheck.rows[0];

        // Проверка прав
        if (user.role === 'coordinator') {
            const coordinatorCheck = await pool.query(
                'SELECT 1 FROM event_coordinators WHERE event_id = $1 AND coordinator_id = $2',
                [id, user.coordinatorId]
            );
            
            if (coordinatorCheck.rows.length === 0) {
                return res.status(403).json({ error: 'Вы не назначены координатором на это мероприятие' });
            }
        } else if (user.role === 'admin') {
            if (event.company_id !== user.companyId) {
                return res.status(403).json({ error: 'Нет доступа к этому мероприятию' });
            }
        }

        // Проверка существования технической команды
        const techTeamCheck = await pool.query('SELECT id FROM tech_teams WHERE id = $1', [tech_team_id]);
        if (techTeamCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Техническая команда не найдена' });
        }

        // Добавление связи
        const result = await pool.query(
            'INSERT INTO event_tech_teams (event_id, tech_team_id, notes) VALUES ($1, $2, $3) RETURNING *',
            [id, tech_team_id, notes || '']
        );

        console.log('Tech team added to event');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding tech team to event:', error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'Техническая команда уже назначена на это мероприятие' });
        } else {
            res.status(500).json({ error: 'Ошибка при добавлении технической команды' });
        }
    }
});

app.delete('/api/events/:id/tech-teams/:techTeamId', authenticateToken, async (req, res) => {
    const { id, techTeamId } = req.params;
    const user = req.user;

    console.log('Removing tech team from event:', { eventId: id, techTeamId });

    // Проверка прав
    if (user.role !== 'coordinator' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Только координатор или администратор может удалять технические команды' });
    }

    try {
        // Проверка доступа к мероприятию
        const eventCheck = await pool.query(
            `SELECT e.*, g.company_id FROM events e
             LEFT JOIN groups g ON e.group_id = g.id
             WHERE e.id = $1`,
            [id]
        );
        
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }

        const event = eventCheck.rows[0];

        // Проверка прав
        if (user.role === 'coordinator') {
            const coordinatorCheck = await pool.query(
                'SELECT 1 FROM event_coordinators WHERE event_id = $1 AND coordinator_id = $2',
                [id, user.coordinatorId]
            );
            
            if (coordinatorCheck.rows.length === 0) {
                return res.status(403).json({ error: 'Вы не назначены координатором на это мероприятие' });
            }
        } else if (user.role === 'admin') {
            if (event.company_id !== user.companyId) {
                return res.status(403).json({ error: 'Нет доступа к этому мероприятию' });
            }
        }

        const result = await pool.query(
            'DELETE FROM event_tech_teams WHERE event_id = $1 AND tech_team_id = $2 RETURNING *',
            [id, techTeamId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Связь не найдена' });
        }

        console.log('Tech team removed from event');
        res.json({ message: 'Техническая команда удалена с мероприятия', relation: result.rows[0] });
    } catch (error) {
        console.error('Error removing tech team from event:', error);
        res.status(500).json({ error: 'Ошибка при удалении технической команды' });
    }
});

async function getFullEventData(eventId) {
    const result = await pool.query(
        `SELECT e.*, g.name as group_name, v.name as venue_name
         FROM events e
         LEFT JOIN groups g ON e.group_id = g.id
         LEFT JOIN venues v ON e.venue_id = v.id
         WHERE e.id = $1`,
        [eventId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const event = result.rows[0];
    
    const coordinatorsResult = await pool.query(`
        SELECT c.id, c.full_name, c.email, c.specialization
        FROM coordinators c
        JOIN event_coordinators ec ON c.id = ec.coordinator_id
        WHERE ec.event_id = $1
    `, [eventId]);
    
    const techTeamsResult = await pool.query(`
        SELECT tt.id, tt.name, tt.team_type, tt.specialization, ett.notes
        FROM tech_teams tt
        JOIN event_tech_teams ett ON tt.id = ett.tech_team_id
        WHERE ett.event_id = $1
    `, [eventId]);
    
    event.coordinators = coordinatorsResult.rows;
    event.techTeams = techTeamsResult.rows;

    return event;
}

// ============== УПРАВЛЕНИЕ ГРУППАМИ ==============

// Получение всех компаний (с фильтрацией по company_id для администратора)
app.get('/api/companies', authenticateToken, async (req, res) => {
    const user = req.user;
    
    try {
        let query = 'SELECT * FROM companies';
        const params = [];
        
        // Администратор видит только свою компанию
        if (user.role === 'admin' && user.companyId) {
            query += ' WHERE id = $1';
            params.push(user.companyId);
        }
        
        query += ' ORDER BY name';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting companies:', error);
        res.status(500).json({ error: 'Ошибка при получении компаний' });
    }
});

// Получение всех групп (с фильтрацией по роли пользователя)
app.get('/api/groups', authenticateToken, async (req, res) => {
    const user = req.user;
    
    console.log('Getting groups for user:', user.email, 'role:', user.role, 'companyId:', user.companyId);

    try {
        let query = `
            SELECT g.*, c.name as company_name, m.full_name as manager_name
            FROM groups g 
            LEFT JOIN companies c ON g.company_id = c.id
            LEFT JOIN managers m ON g.manager_id = m.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;
        
        // Фильтр по роли пользователя
        if (user.role === 'manager' && user.managerId) {
            // Менеджер видит только свои группы
            query += ` AND g.manager_id = $${paramIndex}`;
            params.push(user.managerId);
            paramIndex++;
        } else if (user.role === 'admin' && user.companyId) {
            // Администратор видит только группы своей компании
            query += ` AND g.company_id = $${paramIndex}`;
            params.push(user.companyId);
            paramIndex++;
        } else if (user.role === 'coordinator') {
            // Координатор видит группы, с которыми он работал
            query += ` AND EXISTS (
                SELECT 1 FROM events e
                JOIN event_coordinators ec ON e.id = ec.event_id
                WHERE e.group_id = g.id AND ec.coordinator_id = $${paramIndex}
            )`;
            params.push(user.coordinatorId);
            paramIndex++;
        }
        
        query += ' ORDER BY g.name';

        const result = await pool.query(query, params);
        
        // Добавляем количество мероприятий для каждой группы
        const groupsWithStats = await Promise.all(result.rows.map(async (group) => {
            const eventsCount = await pool.query(
                'SELECT COUNT(*) FROM events WHERE group_id = $1 AND status != $2',
                [group.id, 'cancelled']
            );
            return {
                ...group,
                event_count: parseInt(eventsCount.rows[0].count)
            };
        }));
        
        console.log(`Found ${groupsWithStats.length} groups for user ${user.email}`);
        res.json(groupsWithStats);
    } catch (error) {
        console.error('Error getting groups:', error);
        res.status(500).json({ error: 'Ошибка при получении групп' });
    }
});

// Создание новой группы
app.post('/api/groups', authenticateToken, async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Только администратор может создавать группы' });
    }
    
    const { name, company_id, manager_id, debut_date, member_count, genre, status, description } = req.body;
    
    try {
        // Проверяем, что администратор создает группу только для своей компании
        if (company_id && company_id !== user.companyId) {
            return res.status(403).json({ error: 'Вы можете создавать группы только для своей компании' });
        }
        
        // Проверка существования менеджера, если указан
        if (manager_id) {
            const managerCheck = await pool.query(
                'SELECT id, company_id FROM managers WHERE id = $1', 
                [manager_id]
            );
            if (managerCheck.rows.length === 0) {
                return res.status(400).json({ error: 'Менеджер не найден' });
            }
            // Проверяем, что менеджер принадлежит той же компании
            if (managerCheck.rows[0].company_id !== user.companyId) {
                return res.status(403).json({ error: 'Менеджер должен принадлежать вашей компании' });
            }
        }
        
        const result = await pool.query(
            `INSERT INTO groups (name, company_id, manager_id, debut_date, member_count, genre, status, description)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [name, user.companyId, manager_id || null, debut_date || null, 
             member_count || null, genre || null, status || 'active', description || null]
        );
        
        console.log('Group created:', result.rows[0].id);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Ошибка при создании группы' });
    }
});

// Получение группы по ID
app.get('/api/groups/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    
    try {
        const result = await pool.query(
            `SELECT g.*, c.name as company_name, m.full_name as manager_name
             FROM groups g
             LEFT JOIN companies c ON g.company_id = c.id
             LEFT JOIN managers m ON g.manager_id = m.id
             WHERE g.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Группа не найдена' });
        }
        
        const group = result.rows[0];
        
        // Проверка доступа
        if (user.role === 'manager') {
            if (!user.managerId || group.manager_id !== user.managerId) {
                return res.status(403).json({ error: 'Нет доступа к этой группе' });
            }
        } else if (user.role === 'admin') {
            if (group.company_id !== user.companyId) {
                return res.status(403).json({ error: 'Нет доступа к этой группе' });
            }
        } else if (user.role === 'coordinator') {
            const coordinatorCheck = await pool.query(
                `SELECT 1 FROM events e
                 JOIN event_coordinators ec ON e.id = ec.event_id
                 WHERE e.group_id = $1 AND ec.coordinator_id = $2`,
                [id, user.coordinatorId]
            );
            if (coordinatorCheck.rows.length === 0) {
                return res.status(403).json({ error: 'Нет доступа к этой группе' });
            }
        }
        
        res.json(group);
    } catch (error) {
        console.error('Error getting group:', error);
        res.status(500).json({ error: 'Ошибка при получении группы' });
    }
});

// Обновление группы
app.put('/api/groups/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Только администратор может обновлять группы' });
    }
    
    const { name, manager_id, debut_date, member_count, genre, status, description } = req.body;
    
    try {
        // Проверка существования группы и принадлежности к компании
        const groupCheck = await pool.query(
            'SELECT id, company_id FROM groups WHERE id = $1', 
            [id]
        );
        if (groupCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Группа не найдена' });
        }
        
        if (groupCheck.rows[0].company_id !== user.companyId) {
            return res.status(403).json({ error: 'Вы можете редактировать только группы своей компании' });
        }
        
        // Проверка существования менеджера, если указан
        if (manager_id) {
            const managerCheck = await pool.query(
                'SELECT id, company_id FROM managers WHERE id = $1', 
                [manager_id]
            );
            if (managerCheck.rows.length === 0) {
                return res.status(400).json({ error: 'Менеджер не найден' });
            }
            if (managerCheck.rows[0].company_id !== user.companyId) {
                return res.status(403).json({ error: 'Менеджер должен принадлежать вашей компании' });
            }
        }
        
        const result = await pool.query(
            `UPDATE groups 
             SET name = $1, manager_id = $2, debut_date = $3, 
                 member_count = $4, genre = $5, status = $6, description = $7
             WHERE id = $8
             RETURNING *`,
            [name, manager_id || null, debut_date || null, 
             member_count || null, genre || null, status || 'active', description || null, id]
        );
        
        console.log('Group updated:', id);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ error: 'Ошибка при обновлении группы' });
    }
});

// Удаление группы
app.delete('/api/groups/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Только администратор может удалять группы' });
    }
    
    try {
        // Проверка существования группы и принадлежности к компании
        const groupCheck = await pool.query(
            'SELECT id, name, company_id FROM groups WHERE id = $1', 
            [id]
        );
        if (groupCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Группа не найдена' });
        }
        
        if (groupCheck.rows[0].company_id !== user.companyId) {
            return res.status(403).json({ error: 'Вы можете удалять только группы своей компании' });
        }
        
        // Сначала отменяем все связанные мероприятия
        await pool.query('UPDATE events SET status = $1 WHERE group_id = $2', ['cancelled', id]);
        
        // Затем удаляем группу
        const result = await pool.query('DELETE FROM groups WHERE id = $1 RETURNING *', [id]);
        
        console.log('Group deleted:', id, result.rows[0].name);
        res.json({ message: 'Группа удалена', group: result.rows[0] });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Ошибка при удалении группы' });
    }
});

// ============== ПЛОЩАДКИ ==============

app.get('/api/venues', authenticateToken, async (req, res) => {
    console.log('Getting venues');
    
    try {
        const result = await pool.query('SELECT * FROM venues ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting venues:', error);
        res.status(500).json({ error: 'Ошибка при получении площадок' });
    }
});

// ============== ТЕХНИЧЕСКИЕ КОМАНДЫ ==============

app.get('/api/tech-teams', authenticateToken, async (req, res) => {
    const user = req.user;
    
    console.log('Getting tech teams for:', user.email, 'role:', user.role);
    
    try {
        const result = await pool.query(`
            SELECT * FROM tech_teams 
            ORDER BY 
                CASE WHEN status = 'available' THEN 1 ELSE 2 END,
                name
        `);
        
        console.log(`Found ${result.rows.length} tech teams`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting tech teams:', error);
        res.status(500).json({ error: 'Ошибка при получении технических команд' });
    }
});

// ============== МЕНЕДЖЕРЫ ==============

app.get('/api/managers', authenticateToken, async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступно только администратору' });
    }
    
    try {
        // Администратор видит только менеджеров своей компании
        const result = await pool.query(
            'SELECT id, full_name, email, company_id FROM managers WHERE company_id = $1 ORDER BY full_name',
            [user.companyId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting managers:', error);
        res.status(500).json({ error: 'Ошибка при получении менеджеров' });
    }
});

// ============== КООРДИНАТОРЫ ДЛЯ МЕРОПРИЯТИЙ МЕНЕДЖЕРА ==============

app.get('/api/manager/coordinators-with-events', authenticateToken, async (req, res) => {
    const user = req.user;
    
    if (user.role !== 'manager' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступно только менеджеру или администратору' });
    }
    
    try {
        let query = `
            SELECT 
                c.id,
                c.full_name,
                c.email,
                c.phone,
                c.specialization,
                -- События, связанные с группами менеджера/компании
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM events e
                        JOIN groups g ON e.group_id = g.id
                        JOIN event_coordinators ec ON e.id = ec.event_id
                        WHERE ec.coordinator_id = c.id
                        AND ${user.role === 'manager' ? 'g.manager_id = $1' : 'g.company_id = $1'}
                    ) THEN (
                        SELECT STRING_AGG(
                            e.name || ' (' || TO_CHAR(e.start_date, 'DD.MM.YYYY') || ')',
                            ', '
                        )
                        FROM events e
                        JOIN groups g ON e.group_id = g.id
                        JOIN event_coordinators ec ON e.id = ec.event_id
                        WHERE ec.coordinator_id = c.id
                        AND ${user.role === 'manager' ? 'g.manager_id = $1' : 'g.company_id = $1'}
                        AND e.status != 'cancelled'
                    )
                    ELSE 'Не работает с вашими группами'
                END as manager_group_events,
                -- Все события координатора
                (
                    SELECT STRING_AGG(
                        e.name || ' (' || TO_CHAR(e.start_date, 'DD.MM.YYYY') || ')',
                        ', '
                    )
                    FROM events e
                    JOIN event_coordinators ec ON e.id = ec.event_id
                    WHERE ec.coordinator_id = c.id
                    AND e.status != 'cancelled'
                ) as all_events
            FROM coordinators c
            WHERE c.company_id = $1
            ORDER BY c.full_name
        `;
        
        const params = user.role === 'manager' 
            ? [user.managerId] 
            : [user.companyId];
            
        const result = await pool.query(query, params);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting coordinators with events:', error);
        res.status(500).json({ error: 'Ошибка при получении информации о координаторах' });
    }
});

// ============== АУТЕНТИФИКАЦИЯ MIDDLEWARE ==============

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        console.log('No authorization header');
        return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err.message);
            return res.status(403).json({ error: 'Недействительный токен' });
        }
        
        req.user = user;
        next();
    });
}

app.listen(PORT, () => {
    console.log('🚀 Server running on port', PORT);
    console.log('📊 Test API: http://localhost:' + PORT + '/api/test');
});
const DashboardAPI = {
    BASE_URL: 'http://localhost:5500/api',

    getToken() {
        return localStorage.getItem('token');
    },

    async getHeaders() {
        return {
            'Authorization': `Bearer ${this.getToken()}`,
            'Content-Type': 'application/json'
        };
    },

    async getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    async getEvents(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.event_type) params.append('event_type', filters.event_type);
            if (filters.group_id) params.append('group_id', filters.group_id);
            if (filters.venue_id) params.append('venue_id', filters.venue_id);
            if (filters.start_date_from) params.append('start_date_from', filters.start_date_from);
            if (filters.start_date_to) params.append('start_date_to', filters.start_date_to);
            
            const url = `${this.BASE_URL}/events${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(url, { headers: await this.getHeaders() });
            
            if (!response.ok) throw new Error('Ошибка загрузки мероприятий');
            return await response.json();
        } catch (error) {
            console.error('Error loading events:', error);
            return [];
        }
    },

    async getEvent(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/events/${id}`, {
                headers: await this.getHeaders()
            });
            if (!response.ok) throw new Error('Ошибка загрузки мероприятия');
            return await response.json();
        } catch (error) {
            console.error('Error loading event:', error);
            throw error;
        }
    },

    async createEvent(eventData) {
        try {
            const response = await fetch(`${this.BASE_URL}/events`, {
                method: 'POST',
                headers: await this.getHeaders(),
                body: JSON.stringify(eventData)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка создания мероприятия');
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    },

    async updateEvent(id, eventData) {
        try {
            const response = await fetch(`${this.BASE_URL}/events/${id}`, {
                method: 'PUT',
                headers: await this.getHeaders(),
                body: JSON.stringify(eventData)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка обновления мероприятия');
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    async deleteEvent(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/events/${id}`, {
                method: 'DELETE',
                headers: await this.getHeaders()
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка удаления мероприятия');
            }
            return await response.json();
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    },

    async getGroups() {
        try {
            const response = await fetch(`${this.BASE_URL}/groups`, {
                headers: await this.getHeaders()
            });
            if (!response.ok) throw new Error('Ошибка загрузки групп');
            return await response.json();
        } catch (error) {
            console.error('Error loading groups:', error);
            return [];
        }
    },

    async getVenues() {
        try {
            const response = await fetch(`${this.BASE_URL}/venues`, {
                headers: await this.getHeaders()
            });
            if (!response.ok) throw new Error('Ошибка загрузки площадок');
            return await response.json();
        } catch (error) {
            console.error('Error loading venues:', error);
            return [];
        }
    },

    async getTechTeams() {
        try {
            const response = await fetch(`${this.BASE_URL}/tech-teams`, {
                headers: await this.getHeaders()
            });
            if (!response.ok) throw new Error('Ошибка загрузки технических команд');
            return await response.json();
        } catch (error) {
            console.error('Error loading tech teams:', error);
            return [];
        }
    },

    async getManagerCoordinators() {
        try {
            const response = await fetch(`${this.BASE_URL}/manager/coordinators-with-events`, {
                headers: await this.getHeaders()
            });
            if (!response.ok) throw new Error('Ошибка загрузки координаторов');
            return await response.json();
        } catch (error) {
            console.error('Error loading coordinators:', error);
            return [];
        }
    },

    async getEventTechTeams(eventId) {
        try {
            const response = await fetch(`${this.BASE_URL}/events/${eventId}/tech-teams`, {
                headers: await this.getHeaders()
            });
            if (!response.ok) throw new Error('Ошибка загрузки технических команд мероприятия');
            return await response.json();
        } catch (error) {
            console.error('Error loading event tech teams:', error);
            return [];
        }
    },

    async addTechTeamToEvent(eventId, techTeamId, notes) {
        try {
            const response = await fetch(`${this.BASE_URL}/events/${eventId}/tech-teams`, {
                method: 'POST',
                headers: await this.getHeaders(),
                body: JSON.stringify({ tech_team_id: techTeamId, notes })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка добавления технической команды');
            }
            return await response.json();
        } catch (error) {
            console.error('Error adding tech team:', error);
            throw error;
        }
    },

    async removeTechTeamFromEvent(eventId, techTeamId) {
        try {
            const response = await fetch(`${this.BASE_URL}/events/${eventId}/tech-teams/${techTeamId}`, {
                method: 'DELETE',
                headers: await this.getHeaders()
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка удаления технической команды');
            }
            return await response.json();
        } catch (error) {
            console.error('Error removing tech team:', error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    checkAuth() {
        const token = this.getToken();
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
            window.location.href = 'login.html';
            return false;
        }
        
        return true;
    }
};

const DashboardUI = {
    currentUser: null,
    currentEventId: null,
    currentEventTechTeams: [],

    async init() {
        if (!DashboardAPI.checkAuth()) return;
        
        this.currentUser = await DashboardAPI.getCurrentUser();
        this.updateUserInfo();
        this.updateRoleBasedUI();
        
        this.attachEventListeners();
        
        await this.updateStats();
        await this.renderUpcomingEvents();
        
        window.editEvent = this.editEvent.bind(this);
        window.confirmDeleteEvent = this.confirmDeleteEvent.bind(this);
        window.removeTechTeamFromCurrentEvent = this.removeTechTeamFromCurrentEvent.bind(this);
    },

    updateUserInfo() {
        if (!this.currentUser) return;
        
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        const userAvatar = document.getElementById('userAvatar');
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const userId = document.getElementById('userId');
        const profileRoleBadge = document.getElementById('profileRoleBadge');
        
        if (userNameEl) userNameEl.textContent = this.currentUser.fullName || 'Пользователь';
        if (userRoleEl) userRoleEl.textContent = this.getRoleText(this.currentUser.role);
        
        if (userAvatar) {
            const initial = (this.currentUser.fullName || 'U').charAt(0).toUpperCase();
            userAvatar.textContent = initial;
        }
        
        if (profileName) profileName.textContent = this.currentUser.fullName || 'Пользователь';
        if (profileEmail) profileEmail.textContent = this.currentUser.email || 'Email не указан';
        if (userId) userId.textContent = this.currentUser.id || 'N/A';
        
        if (profileRoleBadge) {
            profileRoleBadge.textContent = this.getRoleText(this.currentUser.role);
            profileRoleBadge.className = 'role-badge badge-' + this.currentUser.role;
        }
        
        this.updateProfileAdditionalInfo();
    },

    updateProfileAdditionalInfo() {
        const container = document.getElementById('profileAdditionalInfo');
        if (!container) return;
        
        let html = '<div class="info-message">';
        
        if (this.currentUser.role === 'manager') {
            html += `<p><strong>Роль:</strong> Менеджер группы</p>`;
            if (this.currentUser.managerName) {
                html += `<p><strong>Имя менеджера:</strong> ${this.escapeHtml(this.currentUser.managerName)}</p>`;
            }
            html += `<p><strong>Обязанности:</strong> Управление расписанием своей группы, создание и редактирование мероприятий</p>`;
        } else if (this.currentUser.role === 'admin') {
            html += `<p><strong>Роль:</strong> Администратор</p>`;
            html += `<p><strong>Обязанности:</strong> Полный доступ ко всем функциям системы</p>`;
        } else if (this.currentUser.role === 'coordinator') {
            html += `<p><strong>Роль:</strong> Координатор</p>`;
            if (this.currentUser.coordinatorName) {
                html += `<p><strong>Имя координатора:</strong> ${this.escapeHtml(this.currentUser.coordinatorName)}</p>`;
            }
            html += `<p><strong>Обязанности:</strong> Управление техническими командами для назначенных мероприятий</p>`;
        }
        
        html += '</div>';
        container.innerHTML = html;
    },

    updateRoleBasedUI() {
        if (!this.currentUser) return;
        
        const roleInfo = document.getElementById('roleInfo');
        if (roleInfo) {
            let roleText = '';
            if (this.currentUser.role === 'manager') {
                roleText = 'Вы вошли как <strong>Менеджер группы</strong>. Вы можете управлять расписанием своих групп.';
            } else if (this.currentUser.role === 'admin') {
                roleText = 'Вы вошли как <strong>Администратор</strong>. У вас есть полный доступ ко всем функциям.';
            } else if (this.currentUser.role === 'coordinator') {
                roleText = 'Вы вошли как <strong>Координатор</strong>. Вы можете управлять техническими командами для назначенных мероприятий.';
            }
            roleInfo.innerHTML = `<i class="fas fa-info-circle"></i> ${roleText}`;
        }
        
        const canCreateEvents = (this.currentUser.role === 'admin' || this.currentUser.role === 'manager');
        const addEventBtn = document.getElementById('addEventBtn');
        const addEventBtn2 = document.getElementById('addEventBtn2');
        
        if (addEventBtn) addEventBtn.style.display = canCreateEvents ? 'inline-flex' : 'none';
        if (addEventBtn2) addEventBtn2.style.display = canCreateEvents ? 'inline-flex' : 'none';
        
        const managerGroupsSection = document.getElementById('managerGroupsSection');
        if (managerGroupsSection) {
            managerGroupsSection.style.display = (this.currentUser.role === 'manager') ? 'block' : 'none';
        }
        
        const managerOnlyGroups = document.getElementById('managerOnlyGroups');
        if (managerOnlyGroups) {
            managerOnlyGroups.style.display = (this.currentUser.role === 'manager') ? 'block' : 'none';
        }
        
        const managerCoordinatorsSection = document.getElementById('managerCoordinatorsSection');
        if (managerCoordinatorsSection) {
            managerCoordinatorsSection.style.display = (this.currentUser.role === 'manager' || this.currentUser.role === 'admin') ? 'block' : 'none';
        }
    },

    async updateStats() {
        try {
            const events = await DashboardAPI.getEvents();
            const groups = await DashboardAPI.getGroups();
            const venues = await DashboardAPI.getVenues();
            
            const totalEventsEl = document.getElementById('totalEvents');
            const upcomingEventsEl = document.getElementById('upcomingEvents');
            const totalGroupsEl = document.getElementById('totalGroups');
            const totalVenuesEl = document.getElementById('totalVenues');
            
            if (totalEventsEl) totalEventsEl.textContent = events.length;
            
            const now = new Date();
            const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            
            const upcomingCount = events.filter(event => {
                const eventDate = new Date(event.start_date);
                return eventDate > now && eventDate <= thirtyDaysLater && event.status !== 'completed' && event.status !== 'cancelled';
            }).length;
            
            if (upcomingEventsEl) upcomingEventsEl.textContent = upcomingCount;
            if (totalGroupsEl) totalGroupsEl.textContent = groups.length;
            if (totalVenuesEl) totalVenuesEl.textContent = venues.length;
            
        } catch (error) {
            console.error('Ошибка обновления статистики:', error);
        }
    },

    async renderUpcomingEvents() {
        const container = document.getElementById('eventsGrid');
        const noEvents = document.getElementById('noEvents');
        const loading = document.getElementById('loadingEvents');
        
        if (!container || !noEvents || !loading) return;
        
        try {
            container.style.display = 'none';
            noEvents.style.display = 'none';
            loading.style.display = 'block';
            
            let events = await DashboardAPI.getEvents();
            
            if (events.length === 0) {
                container.style.display = 'none';
                noEvents.style.display = 'block';
                loading.style.display = 'none';
                return;
            }
            
            const sortedEvents = [...events].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
            
            const now = new Date();
            const upcomingEvents = sortedEvents.filter(event => {
                const eventDate = new Date(event.start_date);
                return eventDate > now && event.status !== 'completed' && event.status !== 'cancelled';
            }).slice(0, 4);
            
            if (upcomingEvents.length === 0) {
                container.style.display = 'none';
                noEvents.style.display = 'block';
                loading.style.display = 'none';
                return;
            }
            
            container.innerHTML = upcomingEvents.map(event => `
                <div class="event-card">
                    <div class="event-header">
                        <div class="event-title">${this.escapeHtml(event.name)}</div>
                        <div class="event-status status-${event.status}">${this.getStatusText(event.status)}</div>
                    </div>
                    <div class="event-body">
                        <div class="event-info">
                            <div class="event-row">
                                <span class="event-label">Тип:</span>
                                <span class="event-value">${this.getEventTypeText(event.event_type)}</span>
                            </div>
                            <div class="event-row">
                                <span class="event-label">Дата:</span>
                                <span class="event-value">${this.formatDateTime(event.start_date)}</span>
                            </div>
                            <div class="event-row">
                                <span class="event-label">Группа:</span>
                                <span class="event-value">${this.escapeHtml(event.group_name || 'Не указана')}</span>
                            </div>
                            <div class="event-row">
                                <span class="event-label">Площадка:</span>
                                <span class="event-value">${this.escapeHtml(event.venue_name || 'Не указана')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="event-actions">
                        ${this.currentUser.role === 'coordinator' ? `
                        <button class="action-btn view-btn" onclick="editEvent(${event.id})">
                            <i class="fas fa-eye"></i> Просмотр
                        </button>
                        ` : `
                        <button class="action-btn edit-btn" onclick="editEvent(${event.id})">
                            <i class="fas fa-edit"></i> Редактировать
                        </button>
                        `}
                        ${this.currentUser.role !== 'coordinator' ? `
                        <button class="action-btn delete-btn" onclick="confirmDeleteEvent(${event.id})">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
            
            container.style.display = 'grid';
            noEvents.style.display = 'none';
            loading.style.display = 'none';
            
        } catch (error) {
            container.style.display = 'none';
            noEvents.style.display = 'block';
            loading.style.display = 'none';
            console.error('Ошибка загрузки мероприятий:', error);
        }
    },

    async renderAllEventsTable() {
        const tableBody = document.getElementById('eventsTable');
        const container = document.getElementById('eventsTableContainer');
        const noEvents = document.getElementById('noAllEvents');
        const loading = document.getElementById('loadingAllEvents');
        
        if (!tableBody || !container || !noEvents || !loading) return;
        
        try {
            container.style.display = 'none';
            noEvents.style.display = 'none';
            loading.style.display = 'block';
            
            const events = await DashboardAPI.getEvents();
            
            if (events.length === 0) {
                container.style.display = 'none';
                noEvents.style.display = 'block';
                loading.style.display = 'none';
                return;
            }
            
            tableBody.innerHTML = events.map(event => `
                <tr>
                    <td>${this.escapeHtml(event.name)}</td>
                    <td>${this.getEventTypeText(event.event_type)}</td>
                    <td>${this.formatDateTime(event.start_date)}</td>
                    <td>${this.escapeHtml(event.group_name || '—')}</td>
                    <td>${this.escapeHtml(event.venue_name || '—')}</td>
                    <td>
                        <span class="event-status status-${event.status}">
                            ${this.getStatusText(event.status)}
                        </span>
                    </td>
                    <td>
                        <div class="table-actions">
                            ${this.currentUser.role === 'coordinator' ? `
                            <button class="action-btn view-btn btn-small" onclick="editEvent(${event.id})" title="Просмотр">
                                <i class="fas fa-eye"></i>
                            </button>
                            ` : `
                            <button class="action-btn edit-btn btn-small" onclick="editEvent(${event.id})" title="Редактировать">
                                <i class="fas fa-edit"></i>
                            </button>
                            `}
                            ${this.currentUser.role !== 'coordinator' ? `
                            <button class="action-btn delete-btn btn-small" onclick="confirmDeleteEvent(${event.id})" title="Удалить">
                                <i class="fas fa-trash"></i>
                            </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
            
            container.style.display = 'block';
            noEvents.style.display = 'none';
            loading.style.display = 'none';
            
        } catch (error) {
            container.style.display = 'none';
            noEvents.style.display = 'block';
            loading.style.display = 'none';
            console.error('Ошибка загрузки мероприятий:', error);
        }
    },

    async renderGroups() {
        const tableBody = document.getElementById('groupsTable');
        const container = document.getElementById('groupsTableContainer');
        const noGroups = document.getElementById('noGroups');
        const loading = document.getElementById('loadingGroups');
        
        if (!tableBody || !container || !noGroups || !loading) return;
        
        try {
            container.style.display = 'none';
            noGroups.style.display = 'none';
            loading.style.display = 'block';
            
            const groups = await DashboardAPI.getGroups();
            
            if (groups.length === 0) {
                container.style.display = 'none';
                noGroups.style.display = 'block';
                loading.style.display = 'none';
                return;
            }
            
            tableBody.innerHTML = groups.map(group => `
                <tr>
                    <td>${this.escapeHtml(group.name)}</td>
                    <td>${this.escapeHtml(group.company_name || '—')}</td>
                    <td>${this.escapeHtml(group.manager_name || '—')}</td>
                    <td>${group.member_count || '—'}</td>
                    <td>${group.debut_date ? this.formatDate(group.debut_date) : '—'}</td>
                    <td>${this.escapeHtml(group.genre || '—')}</td>
                    <td>
                        <span class="event-status ${group.status === 'active' ? 'status-confirmed' : 'status-cancelled'}">
                            ${group.status === 'active' ? 'Активна' : 'Неактивна'}
                        </span>
                    </td>
                    <td>${group.event_count || 0}</td>
                </tr>
            `).join('');
            
            container.style.display = 'block';
            noGroups.style.display = 'none';
            loading.style.display = 'none';
            
        } catch (error) {
            container.style.display = 'none';
            noGroups.style.display = 'block';
            loading.style.display = 'none';
            console.error('Ошибка загрузки групп:', error);
        }
    },

    async renderVenues() {
        const tableBody = document.getElementById('venuesTable');
        const container = document.getElementById('venuesTableContainer');
        const noVenues = document.getElementById('noVenues');
        const loading = document.getElementById('loadingVenues');
        
        if (!tableBody || !container || !noVenues || !loading) return;
        
        try {
            container.style.display = 'none';
            noVenues.style.display = 'none';
            loading.style.display = 'block';
            
            const venues = await DashboardAPI.getVenues();
            
            if (venues.length === 0) {
                container.style.display = 'none';
                noVenues.style.display = 'block';
                loading.style.display = 'none';
                return;
            }
            
            tableBody.innerHTML = venues.map(venue => `
                <tr>
                    <td>${this.escapeHtml(venue.name)}</td>
                    <td>${this.escapeHtml(venue.city || '—')}</td>
                    <td>${this.escapeHtml(venue.address || '—')}</td>
                    <td>${venue.capacity ? venue.capacity.toLocaleString() : '—'}</td>
                    <td>${this.escapeHtml(venue.venue_type || '—')}</td>
                    <td>${this.escapeHtml(venue.contact_person || '—')}</td>
                    <td>${this.escapeHtml(venue.contact_phone || '—')}</td>
                </tr>
            `).join('');
            
            container.style.display = 'block';
            noVenues.style.display = 'none';
            loading.style.display = 'none';
            
        } catch (error) {
            container.style.display = 'none';
            noVenues.style.display = 'block';
            loading.style.display = 'none';
            console.error('Ошибка загрузки площадок:', error);
        }
    },

    async renderTechTeams() {
        const tableBody = document.getElementById('techTeamsTable');
        const container = document.getElementById('techTeamsTableContainer');
        const noTechTeams = document.getElementById('noTechTeams');
        const loading = document.getElementById('loadingTechTeams');
        
        if (!tableBody || !container || !noTechTeams || !loading) return;
        
        try {
            container.style.display = 'none';
            noTechTeams.style.display = 'none';
            loading.style.display = 'block';
            
            const teams = await DashboardAPI.getTechTeams();
            
            if (teams.length === 0) {
                container.style.display = 'none';
                noTechTeams.style.display = 'block';
                loading.style.display = 'none';
                return;
            }
            
            tableBody.innerHTML = teams.map(team => `
                <tr>
                    <td>${this.escapeHtml(team.name)}</td>
                    <td>${this.getTeamTypeText(team.team_type)}</td>
                    <td>${this.escapeHtml(team.leader_name || '—')}</td>
                    <td>${team.member_count || '—'}</td>
                    <td>
                        <span class="event-status ${team.status === 'available' ? 'status-confirmed' : 'status-cancelled'}">
                            ${team.status === 'available' ? 'Доступна' : 'Занята'}
                        </span>
                    </td>
                    <td>${this.escapeHtml(team.specialization || '—')}</td>
                </tr>
            `).join('');
            
            container.style.display = 'block';
            noTechTeams.style.display = 'none';
            loading.style.display = 'none';
            
        } catch (error) {
            container.style.display = 'none';
            noTechTeams.style.display = 'block';
            loading.style.display = 'none';
            console.error('Ошибка загрузки технических команд:', error);
        }
    },

    async renderManagerCoordinators() {
        const container = document.getElementById('coordinatorsContainer');
        const tableContainer = document.getElementById('coordinatorsTableContainer');
        const loading = document.getElementById('loadingCoordinators');
        const noCoordinators = document.getElementById('noCoordinators');
        const tableBody = document.getElementById('coordinatorsTable');
        
        if (!container || !tableContainer || !loading || !noCoordinators || !tableBody) return;
        
        try {
            tableContainer.style.display = 'none';
            noCoordinators.style.display = 'none';
            loading.style.display = 'block';
            
            const coordinators = await DashboardAPI.getManagerCoordinators();
            
            if (coordinators.length === 0) {
                tableContainer.style.display = 'none';
                noCoordinators.style.display = 'block';
                loading.style.display = 'none';
                return;
            }
            
            tableBody.innerHTML = coordinators.map(coordinator => {
                const worksWithMyGroups = coordinator.manager_group_events && 
                                         coordinator.manager_group_events !== 'Не работает с вашими группами';
                
                return `
                    <tr>
                        <td>
                            <strong>${this.escapeHtml(coordinator.full_name)}</strong>
                            ${worksWithMyGroups ? 
                                '<span class="tag" style="background: #e8f5e9; color: #388e3c; margin-left: 8px;">Работает с вами</span>' : 
                                ''}
                        </td>
                        <td>${this.escapeHtml(coordinator.email || '—')}</td>
                        <td>${this.escapeHtml(coordinator.phone || '—')}</td>
                        <td>${this.escapeHtml(coordinator.specialization || '—')}</td>
                        <td>
                            ${worksWithMyGroups ? 
                                `<div style="max-height: 100px; overflow-y: auto;">
                                    ${this.escapeHtml(coordinator.manager_group_events || '').split(', ').filter(e => e).map(event => 
                                        `<div class="tag tag-info" style="margin: 2px;">${event}</div>`
                                    ).join('')}
                                </div>` : 
                                '<span style="color: #999;">Не работает с вашими группами</span>'}
                        </td>
                        <td>
                            ${coordinator.all_events ? 
                                `<div style="max-height: 100px; overflow-y: auto;">
                                    ${this.escapeHtml(coordinator.all_events || '').split(', ').filter(e => e).map(event => 
                                        `<div class="tag tag-warning" style="margin: 2px;">${event}</div>`
                                    ).join('')}
                                </div>` : 
                                '<span style="color: #999;">Нет мероприятий</span>'}
                        </td>
                    </tr>
                `;
            }).join('');
            
            tableContainer.style.display = 'block';
            noCoordinators.style.display = 'none';
            loading.style.display = 'none';
            
        } catch (error) {
            tableContainer.style.display = 'none';
            noCoordinators.style.display = 'block';
            loading.style.display = 'none';
            console.error('Error rendering coordinators:', error);
        }
    },

    async loadFilterData() {
        try {
            const groups = await DashboardAPI.getGroups();
            const groupSelect = document.getElementById('filterGroup');
            if (groupSelect) {
                groupSelect.innerHTML = '<option value="">Все группы</option>' +
                    groups.map(group => `<option value="${group.id}">${this.escapeHtml(group.name)}</option>`).join('');
            }
            
            const venues = await DashboardAPI.getVenues();
            const venueSelect = document.getElementById('filterVenue');
            if (venueSelect) {
                venueSelect.innerHTML = '<option value="">Все площадки</option>' +
                    venues.map(venue => `<option value="${venue.id}">${this.escapeHtml(venue.name)} (${this.escapeHtml(venue.city || '')})</option>`).join('');
            }
            
            const eventGroupSelect = document.getElementById('eventGroup');
            if (eventGroupSelect) {
                let options = '<option value="">Выберите группу</option>';
                
                if (this.currentUser.role === 'manager') {
                    const myGroups = groups.filter(group => group.manager_id === this.currentUser.managerId);
                    options += myGroups.map(group => `<option value="${group.id}">${this.escapeHtml(group.name)}</option>`).join('');
                } else {
                    options += groups.map(group => `<option value="${group.id}">${this.escapeHtml(group.name)}</option>`).join('');
                }
                
                eventGroupSelect.innerHTML = options;
            }
            
            const eventVenueSelect = document.getElementById('eventVenue');
            if (eventVenueSelect) {
                eventVenueSelect.innerHTML = '<option value="">Выберите площадку</option>' +
                    venues.map(venue => `<option value="${venue.id}">${this.escapeHtml(venue.name)} (${this.escapeHtml(venue.city || '')})</option>`).join('');
            }
            
        } catch (error) {
            console.error('Error loading filter data:', error);
        }
    },

    async editEvent(eventId) {
        try {
            const event = await DashboardAPI.getEvent(eventId);
            await this.openEventModal(event);
        } catch (error) {
            this.showError('eventsError', 'Ошибка загрузки мероприятия: ' + error.message);
        }
    },

    confirmDeleteEvent(eventId) {
        if (confirm('Вы уверены, что хотите удалить это мероприятие?')) {
            this.deleteEventFromDB(eventId);
        }
    },
    async getFullEventData(eventId) {
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

        const eventData = result.rows[0];
        
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
        
        eventData.coordinators = coordinatorsResult.rows;
        eventData.techTeams = techTeamsResult.rows;

        return eventData;
    },
    
    async deleteEventFromDB(eventId) {
        try {
            await DashboardAPI.deleteEvent(eventId);
            this.showSuccess('eventsSuccess', 'Мероприятие успешно удалено');
            
            await this.updateStats();
            await this.renderUpcomingEvents();
            await this.renderAllEventsTable();
            
        } catch (error) {
            this.showError('eventsError', 'Ошибка удаления мероприятия: ' + error.message);
        }
    },

    addNewEvent() {
        this.openEventModal();
    },

    async openEventModal(event = null) {
        const modal = document.getElementById('eventModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('eventForm');
        
        await this.loadFilterData();
        
        if (event) {
            this.currentEventId = event.id;
            
            if (this.currentUser.role === 'coordinator') {
                title.textContent = 'Просмотр мероприятия';
            } else {
                title.textContent = 'Редактировать мероприятие';
            }
            
            document.getElementById('eventName').value = event.name;
            document.getElementById('eventType').value = event.event_type;
            document.getElementById('eventStartDate').value = this.formatDateTimeLocal(event.start_date);
            document.getElementById('eventEndDate').value = this.formatDateTimeLocal(event.end_date);
            document.getElementById('eventGroup').value = event.group_id || '';
            document.getElementById('eventVenue').value = event.venue_id || '';
            document.getElementById('eventStatus').value = event.status;
            document.getElementById('eventDescription').value = event.description || '';
            
            if (this.currentUser.role === 'coordinator') {
                document.getElementById('eventName').readOnly = true;
                document.getElementById('eventType').disabled = true;
                document.getElementById('eventStartDate').readOnly = true;
                document.getElementById('eventEndDate').readOnly = true;
                document.getElementById('eventGroup').disabled = true;
                document.getElementById('eventVenue').disabled = true;
                document.getElementById('eventStatus').disabled = true;
                document.getElementById('eventDescription').readOnly = true;
                document.getElementById('saveEventBtn').style.display = 'none';
                
                document.getElementById('coordinatorTechTeamsSection').style.display = 'block';
                await this.loadTechTeamsForCoordinator();
                await this.loadEventTechTeams(event.id);
            } else {
                document.getElementById('coordinatorTechTeamsSection').style.display = 'none';
                document.getElementById('saveEventBtn').style.display = 'block';
            }
            
            this.checkCompletionStatus(event.start_date);
            
        } else {
            this.currentEventId = null;
            title.textContent = 'Новое мероприятие';
            form.reset();
            
            document.getElementById('eventStatus').value = 'planned';
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            document.getElementById('eventStartDate').value = this.formatDateTimeLocal(tomorrow);
            document.getElementById('eventEndDate').value = this.formatDateTimeLocal(new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000));
            
            document.getElementById('coordinatorTechTeamsSection').style.display = 'none';
            document.getElementById('completionWarning').style.display = 'none';
        }
        
        modal.classList.add('active');
    },

    checkCompletionStatus(startDate) {
        const statusSelect = document.getElementById('eventStatus');
        const warning = document.getElementById('completionWarning');
        
        if (statusSelect.value === 'completed') {
            const eventDate = new Date(startDate);
            const now = new Date();
            
            if (eventDate > now) {
                warning.style.display = 'block';
                warning.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Нельзя отметить как завершенное мероприятие, которое еще не состоялось';
            } else {
                warning.style.display = 'none';
            }
        } else {
            warning.style.display = 'none';
        }
    },

    closeEventModal() {
        document.getElementById('eventModal').classList.remove('active');
        document.getElementById('eventForm').reset();
        document.getElementById('eventFormError').style.display = 'none';
        document.getElementById('completionWarning').style.display = 'none';
        document.getElementById('coordinatorTechTeamsSection').style.display = 'none';
        this.currentEventId = null;
        this.currentEventTechTeams = [];
        
        document.getElementById('eventName').readOnly = false;
        document.getElementById('eventType').disabled = false;
        document.getElementById('eventStartDate').readOnly = false;
        document.getElementById('eventEndDate').readOnly = false;
        document.getElementById('eventGroup').disabled = false;
        document.getElementById('eventVenue').disabled = false;
        document.getElementById('eventStatus').disabled = false;
        document.getElementById('eventDescription').readOnly = false;
        document.getElementById('saveEventBtn').style.display = 'block';
    },

    async saveEvent(eventData) {
        try {
            if (eventData.status === 'completed') {
                const eventDate = new Date(eventData.start_date);
                const now = new Date();
                
                if (eventDate > now) {
                    throw new Error('Нельзя отметить как завершенное мероприятие, которое еще не состоялось');
                }
            }
            
            if (this.currentEventId) {
                await DashboardAPI.updateEvent(this.currentEventId, eventData);
                this.showSuccess('eventsSuccess', 'Мероприятие успешно обновлено');
            } else {
                await DashboardAPI.createEvent(eventData);
                this.showSuccess('eventsSuccess', 'Мероприятие успешно создано');
            }
            
            this.closeEventModal();
            await this.updateStats();
            await this.renderUpcomingEvents();
            await this.renderAllEventsTable();
            
        } catch (error) {
            this.showError('eventFormError', 'Ошибка сохранения: ' + error.message);
        }
    },

    async loadTechTeamsForCoordinator() {
        try {
            const teams = await DashboardAPI.getTechTeams();
            const techTeamSelect = document.getElementById('techTeamSelect');
            if (techTeamSelect) {
                techTeamSelect.innerHTML = '<option value="">Выберите техническую команду</option>' +
                    teams.map(team => 
                        `<option value="${team.id}">${this.escapeHtml(team.name)} (${this.getTeamTypeText(team.team_type)})</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Error loading tech teams for coordinator:', error);
        }
    },

    async loadEventTechTeams(eventId) {
        try {
            const teams = await DashboardAPI.getEventTechTeams(eventId);
            this.currentEventTechTeams = teams;
            
            const tableBody = document.getElementById('techTeamsTableBody');
            if (tableBody) {
                if (teams.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center" style="padding: 20px; color: #999;">
                                Нет назначенных технических команд
                            </td>
                        </tr>
                    `;
                } else {
                    tableBody.innerHTML = teams.map(team => `
                        <tr>
                            <td>${this.escapeHtml(team.name)}</td>
                            <td>${this.getTeamTypeText(team.team_type)}</td>
                            <td>${this.escapeHtml(team.specialization || '—')}</td>
                            <td>${this.escapeHtml(team.notes || '—')}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="action-btn delete-btn btn-small" onclick="removeTechTeamFromCurrentEvent(${team.id})" title="Удалить">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading event tech teams:', error);
        }
    },

    async addTechTeamToCurrentEvent() {
        const techTeamId = document.getElementById('techTeamSelect').value;
        const notes = document.getElementById('techTeamNotes').value;
        
        if (!techTeamId) {
            this.showError('eventFormError', 'Выберите техническую команду');
            return;
        }
        
        try {
            await DashboardAPI.addTechTeamToEvent(this.currentEventId, techTeamId, notes);
            this.showSuccess('eventsSuccess', 'Техническая команда добавлена');
            
            await this.loadEventTechTeams(this.currentEventId);
            
            document.getElementById('techTeamSelect').value = '';
            document.getElementById('techTeamNotes').value = '';
            
        } catch (error) {
            this.showError('eventFormError', 'Ошибка добавления технической команды: ' + error.message);
        }
    },

    async removeTechTeamFromCurrentEvent(techTeamId) {
        if (!confirm('Вы уверены, что хотите удалить эту техническую команду с мероприятия?')) {
            return;
        }
        
        try {
            await DashboardAPI.removeTechTeamFromEvent(this.currentEventId, techTeamId);
            this.showSuccess('eventsSuccess', 'Техническая команда удалена');
            
            await this.loadEventTechTeams(this.currentEventId);
            
        } catch (error) {
            this.showError('eventFormError', 'Ошибка удаления технической команды: ' + error.message);
        }
    },

    applyFilters() {
        const status = document.getElementById('filterStatus').value;
        const eventType = document.getElementById('filterType').value;
        const groupId = document.getElementById('filterGroup').value;
        const venueId = document.getElementById('filterVenue').value;
        const dateFrom = document.getElementById('filterDateFrom').value;
        const dateTo = document.getElementById('filterDateTo').value;
        
        const filters = {};
        if (status) filters.status = status;
        if (eventType) filters.event_type = eventType;
        if (groupId) filters.group_id = groupId;
        if (venueId) filters.venue_id = venueId;
        if (dateFrom) filters.start_date_from = dateFrom;
        if (dateTo) filters.start_date_to = dateTo;
        
        DashboardAPI.getEvents(filters).then(events => {
            this.renderFilteredEvents(events);
        });
        
        document.getElementById('filterPanel').style.display = 'none';
    },

    renderFilteredEvents(events) {
        const tableBody = document.getElementById('eventsTable');
        const container = document.getElementById('eventsTableContainer');
        const noEvents = document.getElementById('noAllEvents');
        
        if (events.length === 0) {
            container.style.display = 'none';
            noEvents.style.display = 'block';
            return;
        }
        
        tableBody.innerHTML = events.map(event => `
            <tr>
                <td>${this.escapeHtml(event.name)}</td>
                <td>${this.getEventTypeText(event.event_type)}</td>
                <td>${this.formatDateTime(event.start_date)}</td>
                <td>${this.escapeHtml(event.group_name || '—')}</td>
                <td>${this.escapeHtml(event.venue_name || '—')}</td>
                <td>
                    <span class="event-status status-${event.status}">
                        ${this.getStatusText(event.status)}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        ${this.currentUser.role === 'coordinator' ? `
                        <button class="action-btn view-btn btn-small" onclick="editEvent(${event.id})" title="Просмотр">
                            <i class="fas fa-eye"></i>
                        </button>
                        ` : `
                        <button class="action-btn edit-btn btn-small" onclick="editEvent(${event.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        `}
                        ${this.currentUser.role !== 'coordinator' ? `
                        <button class="action-btn delete-btn btn-small" onclick="confirmDeleteEvent(${event.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
        
        container.style.display = 'block';
        noEvents.style.display = 'none';
    },

    resetFilters() {
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterType').value = '';
        document.getElementById('filterGroup').value = '';
        document.getElementById('filterVenue').value = '';
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';
        document.getElementById('filterSort').value = 'start_date_desc';
        
        this.renderAllEventsTable();
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
            setTimeout(() => element.style.display = 'none', 5000);
        }
    },

    showSuccess(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
            setTimeout(() => element.style.display = 'none', 5000);
        }
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    },

    formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatDateTimeLocal(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return localDate.toISOString().slice(0, 16);
    },

    getRoleText(role) {
        const roles = {
            'manager': 'Менеджер',
            'admin': 'Администратор',
            'coordinator': 'Координатор',
            'artist': 'Артист',
            'fan': 'Фанат'
        };
        return roles[role] || role;
    },

    getStatusText(status) {
        const statuses = {
            'planned': 'Запланировано',
            'confirmed': 'Подтверждено',
            'completed': 'Завершено',
            'cancelled': 'Отменено'
        };
        return statuses[status] || status;
    },

    getEventTypeText(type) {
        const types = {
            'concert': 'Концерт',
            'fanmeeting': 'Фан-встреча',
            'showcase': 'Презентация',
            'rehearsal': 'Репетиция',
            'recording': 'Запись'
        };
        return types[type] || type;
    },

    getTeamTypeText(type) {
        const types = {
            'sound': 'Звуковая',
            'lighting': 'Световая',
            'stage': 'Сценическая',
            'security': 'Безопасность',
            'video': 'Видео',
            'special_effects': 'Спецэффекты'
        };
        return types[type] || type;
    },

    attachEventListeners() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                const pageId = e.currentTarget.dataset.page + 'Page';
                
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
                document.getElementById(pageId).classList.add('active');
                
                switch(e.currentTarget.dataset.page) {
                    case 'dashboard':
                        await this.updateStats();
                        await this.renderUpcomingEvents();
                        break;
                    case 'events':
                        await this.loadFilterData();
                        await this.renderAllEventsTable();
                        break;
                    case 'groups':
                        await this.renderGroups();
                        break;
                    case 'venues':
                        await this.renderVenues();
                        break;
                    case 'tech-teams':
                        await this.renderTechTeams();
                        if (this.currentUser.role === 'manager' || this.currentUser.role === 'admin') {
                            await this.renderManagerCoordinators();
                        }
                        break;
                    case 'profile':
                        break;
                }
            });
        });

        const addEventBtn = document.getElementById('addEventBtn');
        const addEventBtn2 = document.getElementById('addEventBtn2');
        
        if (addEventBtn) addEventBtn.addEventListener('click', () => this.addNewEvent());
        if (addEventBtn2) addEventBtn2.addEventListener('click', () => this.addNewEvent());

        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                if (this.currentUser.role === 'coordinator') {
                    this.showError('eventFormError', 'Координатор не может редактировать основную информацию о мероприятии');
                    return;
                }
                
                const eventData = {
                    name: document.getElementById('eventName').value,
                    event_type: document.getElementById('eventType').value,
                    start_date: document.getElementById('eventStartDate').value,
                    end_date: document.getElementById('eventEndDate').value,
                    group_id: parseInt(document.getElementById('eventGroup').value),
                    venue_id: parseInt(document.getElementById('eventVenue').value),
                    status: document.getElementById('eventStatus').value,
                    description: document.getElementById('eventDescription').value
                };
                
                await this.saveEvent(eventData);
            });
        }

        const addTechTeamBtn = document.getElementById('addTechTeamBtn');
        if (addTechTeamBtn) {
            addTechTeamBtn.addEventListener('click', () => this.addTechTeamToCurrentEvent());
        }

        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelEventBtn = document.getElementById('cancelEventBtn');
        
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeEventModal());
        if (cancelEventBtn) cancelEventBtn.addEventListener('click', () => this.closeEventModal());

        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeEventModal();
                }
            });
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => DashboardAPI.logout());
        }

        const filterToggleBtn = document.getElementById('filterToggleBtn');
        if (filterToggleBtn) {
            filterToggleBtn.addEventListener('click', () => {
                const panel = document.getElementById('filterPanel');
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            });
        }

        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        const resetFiltersBtn = document.getElementById('resetFiltersBtn');
        
        if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', () => this.resetFilters());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEventModal();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await DashboardUI.init();
});

window.DashboardAPI = DashboardAPI;
window.DashboardUI = DashboardUI;

const loginApp = {
    config: {
        apiUrl: 'http://localhost:5500',
        roleEmails: {
            'manager': 'manager@jype.com',
            'admin': 'admin@jype.com',
            'coordinator': 'coordinator@jype.com'
        }
    },

    init: function() {
        this.selectRole('manager');
        this.attachEventListeners();
    },
    attachEventListeners: function() {
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
    },

    switchTab: function(tab) {
        const tabs = document.querySelectorAll('.tab');
        const contents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        if (tab === 'login') {
            tabs[0].classList.add('active');
            document.getElementById('loginTab').classList.add('active');
        } else {
            tabs[1].classList.add('active');
            document.getElementById('registerTab').classList.add('active');
        }
        
        this.hideMessages();
    },
    selectRole: function(role) {
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.includes(this.getRoleDisplayName(role))) {
                btn.classList.add('active');
            }
        });
        
        document.getElementById('role').value = role;
        
        if (this.config.roleEmails[role]) {
            document.getElementById('email').value = this.config.roleEmails[role];
        }
    },

    getRoleDisplayName: function(role) {
        const names = {
            'manager': 'Менеджер',
            'admin': 'Администратор',
            'coordinator': 'Координатор'
        };
        return names[role] || role;
    },
    handleLogin: async function(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        
        this.disableButton(loginBtn, '<i class="fas fa-spinner fa-spin"></i> Вход...');
        this.hideMessages();
        
        try {
            console.log('🔐 Attempting login for:', email);
            
            const response = await fetch(`${this.config.apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            console.log('📥 Login response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Login successful:', data.user.email);
                
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                console.log('💾 Token saved to localStorage');
                
                window.location.href = 'dashboard.html';
            } else {
                const error = await response.json();
                console.error('❌ Login failed:', error);
                this.showError(error.error || 'Ошибка входа');
            }
            
        } catch (error) {
            console.error('🔥 Login error:', error);
            this.showError('Сервер недоступен. Убедитесь, что сервер запущен на localhost:5500');
        } finally {
            this.enableButton(loginBtn, '<i class="fas fa-sign-in-alt"></i> Войти');
        }
    },

    handleRegister: async function(event) {
        event.preventDefault();
        
        const formData = this.getRegistrationFormData();
        
        if (!this.validateRegistration(formData)) {
            return;
        }
        
        const registerBtn = document.getElementById('registerBtn');
        this.disableButton(registerBtn, '<i class="fas fa-spinner fa-spin"></i> Регистрация...');
        this.hideMessages();
        
        try {
            console.log('📝 Attempting to register company:', formData.companyName);
            
            const response = await fetch(`${this.config.apiUrl}/api/auth/register-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            console.log('📥 Registration response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Registration successful:', data);
                
                this.showSuccess(`Компания "${data.company.name}" успешно зарегистрирована! Вы можете войти как администратор.`);
                
                document.getElementById('registerForm').reset();
                
                setTimeout(() => {
                    this.switchTab('login');
                    document.getElementById('email').value = formData.adminEmail;
                    this.selectRole('admin');
                }, 2000);
                
            } else {
                const error = await response.json();
                console.error('❌ Registration failed:', error);
                this.showError(error.error || 'Ошибка при регистрации');
            }
            
        } catch (error) {
            console.error('🔥 Registration error:', error);
            this.showError('Сервер недоступен. Убедитесь, что сервер запущен на localhost:5500');
        } finally {
            this.enableButton(registerBtn, '<i class="fas fa-user-plus"></i> Зарегистрировать компанию');
        }
    },

    getRegistrationFormData: function() {
        return {
            companyName: document.getElementById('companyName').value,
            adminFullName: document.getElementById('adminFullName').value,
            adminEmail: document.getElementById('adminEmail').value,
            adminPassword: document.getElementById('adminPassword').value,
            adminConfirmPassword: document.getElementById('adminConfirmPassword').value,
            adminPhone: document.getElementById('adminPhone').value || null,
            companyFounded: document.getElementById('companyFounded').value || null,
            companyWebsite: document.getElementById('companyWebsite').value || null,
            companyAddress: document.getElementById('companyAddress').value || null,
            companyDescription: document.getElementById('companyDescription').value || null
        };
    },

    validateRegistration: function(data) {
        if (!data.companyName || !data.adminFullName || !data.adminEmail || !data.adminPassword) {
            this.showError('Пожалуйста, заполните все обязательные поля');
            return false;
        }
        
        if (data.adminPassword.length < 6) {
            this.showError('Пароль должен содержать минимум 6 символов');
            return false;
        }
        
        if (data.adminPassword !== data.adminConfirmPassword) {
            this.showError('Пароли не совпадают');
            return false;
        }
        
        return true;
    },
    showError: function(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.className = 'error-message';
        
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    },

    showSuccess: function(message) {
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        successMessage.className = 'success-message';
    },

    hideMessages: function() {
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('successMessage').style.display = 'none';
    },

    disableButton: function(button, html) {
        button.disabled = true;
        button.innerHTML = html;
    },

    enableButton: function(button, html) {
        button.disabled = false;
        button.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    window.loginApp = loginApp;
    loginApp.init();
});
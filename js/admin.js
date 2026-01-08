document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const adminSidebar = document.getElementById('adminSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (mobileMenuToggle && adminSidebar) {
        mobileMenuToggle.addEventListener('click', function() {
            adminSidebar.classList.toggle('active');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
        });
        
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function() {
                adminSidebar.classList.remove('active');
                this.classList.remove('active');
            });
        }
    }

    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            resetErrors();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            let isValid = true;
            
            if (!username) {
                showError('usernameError', 'Username harus diisi');
                isValid = false;
            } else if (username.length < 3) {
                showError('usernameError', 'Username minimal 3 karakter');
                isValid = false;
            }
            
            if (!password) {
                showError('passwordError', 'Password harus diisi');
                isValid = false;
            } else if (password.length < 6) {
                showError('passwordError', 'Password minimal 6 karakter');
                isValid = false;
            }
            
            if (isValid) {
                loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
                loginButton.disabled = true;
                
                setTimeout(function() {
                    const validCredentials = checkCredentials(username, password);
                    
                    if (validCredentials) {
                        localStorage.setItem('adminLoggedIn', 'true');
                        localStorage.setItem('adminUsername', username);
                        
                        window.location.href = 'dashboard.html';
                    } else {
                        showError('loginError', 'Username atau password salah');
                        
                        loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                        loginButton.disabled = false;
                    }
                }, 1000); 
            }
        });
    }
    
    function checkCredentials(username, password) {
        const demoCredentials = {
            'ihsan': 'password123',
            'admin': 'seirama123',
            'superadmin': 'superadmin123'
        };
        
        return demoCredentials[username] === password;
    }
    
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.color = '#e74c3c';
            errorElement.style.fontSize = '14px';
            errorElement.style.marginTop = '5px';
        }
    }
    
    function resetErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }
    
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
    }
});
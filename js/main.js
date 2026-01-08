document.addEventListener('DOMContentLoaded', function() {
    
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            const spans = hamburger.querySelectorAll('span');
            if (hamburger.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !hamburger.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
    
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            const selectedLang = this.value;
            
            this.disabled = true;
            
            setTimeout(() => {
                this.disabled = false;
                alert(`Language changed to ${selectedLang === 'id' ? 'Indonesian' : 'English'}. In a real application, this would load the appropriate translations.`);
            }, 500);
        });
    }
    
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            
            if (!emailInput || !submitBtn) return;
            
            const email = emailInput.value.trim();
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Subscribing...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                
                emailInput.value = '';
                
            }, 1500);
        });
    });
    
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.service-card, .project-card, .news-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    document.querySelectorAll('.service-card, .project-card, .news-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
    
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function highlightNavLink() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavLink);
    
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        const styles = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 350px;
                animation: slideIn 0.3s ease;
            }
            .notification-content {
                background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
                color: white;
                padding: 16px 20px;
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .notification-message {
                flex: 1;
                margin-right: 10px;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                line-height: 1;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        document.body.appendChild(notification);
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    const statNumbers = document.querySelectorAll('.stat-card h3');
    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statNumbers.forEach(stat => {
                        const target = parseInt(stat.textContent);
                        const duration = 2000;
                        const increment = target / (duration / 16);
                        let current = 0;
                        
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                stat.textContent = target + '+';
                                clearInterval(timer);
                            } else {
                                stat.textContent = Math.floor(current) + '+';
                            }
                        }, 16);
                    });
                    
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(document.querySelector('.hero-stats'));
    }
    
    // Back to Top Button
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '↑';
    backToTop.className = 'back-to-top';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background-color: var(--primary-yellow);
        color: var(--dark-blue);
        border: none;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        display: none;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;
    
    backToTop.addEventListener('mouseover', function() {
        this.style.backgroundColor = 'var(--yellow-dark)';
        this.style.transform = 'translateY(-3px)';
    });
    
    backToTop.addEventListener('mouseout', function() {
        this.style.backgroundColor = 'var(--primary-yellow)';
        this.style.transform = 'translateY(0)';
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    });
});

function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;
    
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        input.classList.remove('error');
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }
        
        if (!input.value.trim()) {
            showFieldError(input, 'This field is required');
            isValid = false;
        }
        
        if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value.trim())) {
                showFieldError(input, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        if (input.type === 'tel' && input.value.trim()) {
            const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
            if (!phoneRegex.test(input.value.trim().replace(/\s+/g, ''))) {
                showFieldError(input, 'Please enter a valid Indonesian phone number');
                isValid = false;
            }
        }
        
        if (input.type === 'file' && input.hasAttribute('required')) {
            if (!input.files || input.files.length === 0) {
                showFieldError(input, 'Please select a file');
                isValid = false;
            } else {
                const file = input.files[0];
                const allowedTypes = input.getAttribute('data-allowed-types');
                const maxSize = input.getAttribute('data-max-size');
                
                if (allowedTypes) {
                    const allowedExtensions = allowedTypes.split(',').map(ext => ext.trim());
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    
                    if (!allowedExtensions.includes('.' + fileExtension)) {
                        showFieldError(input, `Only ${allowedTypes} files are allowed`);
                        isValid = false;
                    }
                }
                
                if (maxSize && file.size > maxSize * 1024 * 1024) {
                    showFieldError(input, `File size must be less than ${maxSize}MB`);
                    isValid = false;
                }
            }
        }
    });
    
    return isValid;
}

function showFieldError(input, message) {
    input.classList.add('error');
    
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        display: block;
        color: #f44336;
        font-size: 0.875rem;
        margin-top: 4px;
    `;
    
    input.parentNode.insertBefore(errorElement, input.nextSibling);
    
    input.style.borderColor = '#f44336';
    input.addEventListener('input', function() {
        this.style.borderColor = '';
        if (errorElement.parentNode) {
            errorElement.remove();
        }
    }, { once: true });
}
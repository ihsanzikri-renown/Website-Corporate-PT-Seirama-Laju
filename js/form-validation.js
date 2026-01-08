const VALIDATION_CONFIG = {
    EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    
    PHONE_REGEX: /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
    
    MAX_FILE_SIZE: 5,
    MAX_CV_SIZE: 5,
    MAX_IMAGE_SIZE: 2,
    
    ALLOWED_CV_TYPES: ['.pdf', '.doc', '.docx'],
    ALLOWED_IMAGE_TYPES: ['.jpg', '.jpeg', '.png', '.webp'],
    ALLOWED_DOC_TYPES: ['.pdf', '.doc', '.docx', '.txt'],
    
    MESSAGES: {
        REQUIRED: 'Field ini wajib diisi',
        EMAIL_INVALID: 'Format email tidak valid',
        PHONE_INVALID: 'Format nomor telepon Indonesia tidak valid. Contoh: 081234567890',
        MIN_LENGTH: 'Minimal {min} karakter',
        MAX_LENGTH: 'Maksimal {max} karakter',
        FILE_TOO_LARGE: 'File terlalu besar. Maksimal {max}MB',
        FILE_TYPE_INVALID: 'Format file tidak didukung. Gunakan: {types}',
        PASSWORD_MISMATCH: 'Password tidak sama',
        TERMS_REQUIRED: 'Anda harus menyetujui syarat dan ketentuan',
        SUCCESS: 'Form berhasil dikirim!',
        ERROR: 'Terjadi kesalahan. Silakan coba lagi.'
    }
};


/**
 * Validasi form berdasarkan ID
 * @param {string} formId
 * @returns {boolean}
 */
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Form dengan ID "${formId}" tidak ditemukan`);
        return false;
    }

    let isValid = true;
    const requiredFields = form.querySelectorAll('[data-required]');
    
    clearAllErrors(form);

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
            markFieldAsInvalid(field);
        } else {
            markFieldAsValid(field);
        }
    });

    switch(formId) {
        case 'applicationForm':
            isValid = validateApplicationForm(form) && isValid;
            break;
        case 'contactForm':
            isValid = validateContactForm(form) && isValid;
            break;
        case 'newsletterForm':
            isValid = validateNewsletterForm(form) && isValid;
            break;
        case 'adminLoginForm':
            isValid = validateLoginForm(form) && isValid;
            break;
    }

    return isValid;
}

/**
 * Validasi single field
 * @param {HTMLElement} field
 * @returns {boolean}
 */
function validateField(field) {
    const value = field.value.trim();
    const type = field.type || field.getAttribute('type') || 'text';
    const isRequired = field.hasAttribute('data-required');
    
    if (field.type === 'hidden') return true;
    
    if (isRequired && !value) {
        showFieldError(field, VALIDATION_CONFIG.MESSAGES.REQUIRED);
        return false;
    }
    
    if (!value && !isRequired) return true;
    
    switch(type) {
        case 'email':
            if (!VALIDATION_CONFIG.EMAIL_REGEX.test(value)) {
                showFieldError(field, VALIDATION_CONFIG.MESSAGES.EMAIL_INVALID);
                return false;
            }
            break;
            
        case 'tel':
        case 'phone':
            const cleanPhone = value.replace(/[\s\-\(\)\.]/g, '');
            if (!VALIDATION_CONFIG.PHONE_REGEX.test(cleanPhone)) {
                showFieldError(field, VALIDATION_CONFIG.MESSAGES.PHONE_INVALID);
                return false;
            }
            break;
            
        case 'password':
            if (value.length < 6) {
                showFieldError(field, VALIDATION_CONFIG.MESSAGES.MIN_LENGTH.replace('{min}', '6'));
                return false;
            }
            break;
            
        case 'file':
            if (field.files && field.files.length > 0) {
                return validateFile(field);
            }
            break;
            
        case 'checkbox':
            if (!field.checked && isRequired) {
                showFieldError(field, VALIDATION_CONFIG.MESSAGES.TERMS_REQUIRED);
                return false;
            }
            break;
            
        default:
            const minLength = field.getAttribute('data-min-length');
            const maxLength = field.getAttribute('data-max-length');
            
            if (minLength && value.length < parseInt(minLength)) {
                showFieldError(field, VALIDATION_CONFIG.MESSAGES.MIN_LENGTH.replace('{min}', minLength));
                return false;
            }
            
            if (maxLength && value.length > parseInt(maxLength)) {
                showFieldError(field, VALIDATION_CONFIG.MESSAGES.MAX_LENGTH.replace('{max}', maxLength));
                return false;
            }
    }
    
    return true;
}


/**
 * Validasi file upload
 * @param {HTMLInputElement} fileInput
 * @returns {boolean} 
 */
function validateFile(fileInput) {
    const file = fileInput.files[0];
    if (!file) return true;
    
    const maxSize = fileInput.getAttribute('data-max-size') || 
                    fileInput.getAttribute('data-max-file-size') || 
                    VALIDATION_CONFIG.MAX_FILE_SIZE;
    const maxSizeBytes = maxSize * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
        const message = VALIDATION_CONFIG.MESSAGES.FILE_TOO_LARGE.replace('{max}', maxSize);
        showFieldError(fileInput, message);
        return false;
    }
    
    const allowedTypes = fileInput.getAttribute('data-allowed-types');
    if (allowedTypes) {
        const allowedExtensions = allowedTypes.split(',').map(ext => ext.trim().toLowerCase());
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            const message = VALIDATION_CONFIG.MESSAGES.FILE_TYPE_INVALID.replace('{types}', allowedTypes);
            showFieldError(fileInput, message);
            return false;
        }
    }
    
    if (fileInput.id === 'cvFile' || fileInput.name === 'cv') {
        return validateCVFile(file);
    }
    
    if (file.type.startsWith('image/')) {
        return validateImageFile(file);
    }
    
    return true;
}

/**
 * Validasi file CV khusus
 * @param {File} file
 * @returns {boolean}
 */
function validateCVFile(file) {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
        showFieldError(document.getElementById('cvFile'), 
            VALIDATION_CONFIG.MESSAGES.FILE_TYPE_INVALID.replace('{types}', '.pdf, .doc, .docx'));
        return false;
    }
    
    if (file.size > VALIDATION_CONFIG.MAX_CV_SIZE * 1024 * 1024) {
        showFieldError(document.getElementById('cvFile'),
            VALIDATION_CONFIG.MESSAGES.FILE_TOO_LARGE.replace('{max}', VALIDATION_CONFIG.MAX_CV_SIZE));
        return false;
    }
    
    return true;
}

/**
 * Validasi file gambar
 * @param {File} file
 * @returns {boolean}
 */
function validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
        showFieldError(document.activeElement,
            VALIDATION_CONFIG.MESSAGES.FILE_TYPE_INVALID.replace('{types}', 'JPG, PNG, WebP'));
        return false;
    }
    
    if (file.size > VALIDATION_CONFIG.MAX_IMAGE_SIZE * 1024 * 1024) {
        showFieldError(document.activeElement,
            VALIDATION_CONFIG.MESSAGES.FILE_TOO_LARGE.replace('{max}', VALIDATION_CONFIG.MAX_IMAGE_SIZE));
        return false;
    }
    
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            const maxWidth = 1920;
            const maxHeight = 1080;
            
            if (this.width > maxWidth || this.height > maxHeight) {
                showFieldError(document.activeElement,
                    `Ukuran gambar terlalu besar. Maksimal ${maxWidth}x${maxHeight} piksel`);
                resolve(false);
            } else {
                resolve(true);
            }
        };
        img.onerror = function() {
            showFieldError(document.activeElement, 'File gambar tidak valid');
            resolve(false);
        };
        img.src = URL.createObjectURL(file);
    });
}


/**
 * Validasi form aplikasi kerja
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
function validateApplicationForm(form) {
    let isValid = true;
    
    const email = form.querySelector('#applicantEmail');
    if (email && email.value && !VALIDATION_CONFIG.EMAIL_REGEX.test(email.value)) {
        showFieldError(email, VALIDATION_CONFIG.MESSAGES.EMAIL_INVALID);
        isValid = false;
    }
    
    const phone = form.querySelector('#applicantPhone');
    if (phone && phone.value) {
        const cleanPhone = phone.value.replace(/[\s\-\(\)\.]/g, '');
        if (!VALIDATION_CONFIG.PHONE_REGEX.test(cleanPhone)) {
            showFieldError(phone, VALIDATION_CONFIG.MESSAGES.PHONE_INVALID);
            isValid = false;
        }
    }
    
    const cvFile = form.querySelector('#cvFile');
    if (cvFile && cvFile.files.length > 0) {
        if (!validateCVFile(cvFile.files[0])) {
            isValid = false;
        }
    } else if (cvFile && cvFile.hasAttribute('data-required')) {
        showFieldError(cvFile, VALIDATION_CONFIG.MESSAGES.REQUIRED);
        isValid = false;
    }
    
    const terms = form.querySelector('input[name="privacy"]');
    if (terms && !terms.checked) {
        showFieldError(terms, VALIDATION_CONFIG.MESSAGES.TERMS_REQUIRED);
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validasi form kontak
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
function validateContactForm(form) {
    let isValid = true;
    
    const email = form.querySelector('input[type="email"]');
    if (email && email.value && !VALIDATION_CONFIG.EMAIL_REGEX.test(email.value)) {
        showFieldError(email, VALIDATION_CONFIG.MESSAGES.EMAIL_INVALID);
        isValid = false;
    }
    
    const category = form.querySelector('select[name="category"]');
    if (category && category.value === '' && category.hasAttribute('data-required')) {
        showFieldError(category, 'Pilih kategori pesan');
        isValid = false;
    }
    
    const message = form.querySelector('textarea[name="message"]');
    if (message && message.value.trim().length < 10) {
        showFieldError(message, 'Pesan minimal 10 karakter');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validasi form newsletter
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
function validateNewsletterForm(form) {
    const email = form.querySelector('input[type="email"]');
    if (email && !VALIDATION_CONFIG.EMAIL_REGEX.test(email.value)) {
        showFieldError(email, VALIDATION_CONFIG.MESSAGES.EMAIL_INVALID);
        return false;
    }
    return true;
}

/**
 * Validasi form login admin
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
function validateLoginForm(form) {
    let isValid = true;
    
    const username = form.querySelector('input[name="username"]');
    const password = form.querySelector('input[name="password"]');
    
    if (username && username.value.length < 3) {
        showFieldError(username, 'Username minimal 3 karakter');
        isValid = false;
    }
    
    if (password && password.value.length < 6) {
        showFieldError(password, 'Password minimal 6 karakter');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Tampilkan error message untuk field
 * @param {HTMLElement} field
 * @param {string} message
 */
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #f44336;
        font-size: 0.875rem;
        margin-top: 5px;
        animation: fadeIn 0.3s ease;
    `;
    
    if (field.type === 'checkbox' || field.type === 'radio') {
        field.parentNode.appendChild(errorElement);
    } else {
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    
    field.focus();
    
    const removeErrorOnInput = () => {
        field.classList.remove('error');
        errorElement.remove();
        field.removeEventListener('input', removeErrorOnInput);
    };
    
    field.addEventListener('input', removeErrorOnInput, { once: true });
}

/**
 * Hapus error message dari field
 * @param {HTMLElement} field
 */
function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
    
    const parentError = field.parentNode.querySelector('.error-message');
    if (parentError) {
        parentError.remove();
    }
}

/**
 * Hapus semua error messages dari form
 * @param {HTMLFormElement} form 
 */
function clearAllErrors(form) {
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
    
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(message => {
        message.remove();
    });
}

/**
 * Tandai field sebagai valid
 * @param {HTMLElement} field 
 */
function markFieldAsValid(field) {
    field.classList.remove('error');
    field.classList.add('valid');
    
    setTimeout(() => {
        field.classList.remove('valid');
    }, 3000);
}

/**
 * Tandai field sebagai invalid
 * @param {HTMLElement} field 
 */
function markFieldAsInvalid(field) {
    field.classList.add('error');
    field.classList.remove('valid');
    
    field.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

/**
 * Handle form submission dengan validasi
 * @param {Event} event 
 * @param {Function} successCallback 
 * @param {Function} errorCallback 
 */
function handleFormSubmit(event, successCallback = null, errorCallback = null) {
    event.preventDefault();
    
    const form = event.target;
    const formId = form.id || 'form';
    
    if (!validateForm(formId)) {
        showFormError(form, 'Periksa kembali data yang Anda masukkan');
        if (errorCallback) errorCallback(form);
        return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    const originalState = {
        text: submitButton.innerHTML,
        disabled: submitButton.disabled
    };
    
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    submitButton.disabled = true;
    
    const formData = new FormData(form);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });
    
    setTimeout(() => {
        const isSuccess = Math.random() > 0.2;
        
        if (isSuccess) {
            submitButton.innerHTML = '<i class="fas fa-check"></i> Berhasil!';
            submitButton.style.backgroundColor = '#4CAF50';
            
            showFormSuccess(form, VALIDATION_CONFIG.MESSAGES.SUCCESS);
            
            if (!formId.includes('login')) {
                setTimeout(() => {
                    form.reset();
                    submitButton.innerHTML = originalState.text;
                    submitButton.style.backgroundColor = '';
                    submitButton.disabled = originalState.disabled;
                }, 2000);
            }
            
            if (successCallback) successCallback(formObject);
            
        } else {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            showFormError(form, VALIDATION_CONFIG.MESSAGES.ERROR);
            
            if (errorCallback) errorCallback(formObject);
        }
    }, 1500); 
}

/**
 * Tampilkan success message untuk form
 * @param {HTMLFormElement} form
 * @param {string} message
 */
function showFormSuccess(form, message) {
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const successElement = document.createElement('div');
    successElement.className = 'form-message success';
    successElement.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    successElement.style.cssText = `
        background-color: #4CAF50;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        margin: 15px 0;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    form.insertBefore(successElement, form.firstChild);
    
    setTimeout(() => {
        if (successElement.parentNode) {
            successElement.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => successElement.remove(), 300);
        }
    }, 5000);
}

/**
 * Tampilkan error message untuk form
 * @param {HTMLFormElement} form
 * @param {string} message
 */
function showFormError(form, message) {
    const existingMessage = form.querySelector('.form-message.error');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const errorElement = document.createElement('div');
    errorElement.className = 'form-message error';
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    errorElement.style.cssText = `
        background-color: #f44336;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        margin: 15px 0;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    form.insertBefore(errorElement, form.firstChild);
    
    setTimeout(() => {
        if (errorElement.parentNode) {
            errorElement.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => errorElement.remove(), 300);
        }
    }, 5000);
}

/**
 * Setup real-time validation untuk form
 * @param {string} formId
 */
function setupRealTimeValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'hidden') return;
        
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        if (input.type === 'email' || input.type === 'tel') {
            input.addEventListener('input', debounce(() => {
                validateField(input);
            }, 500));
        }
        
        if (input.type === 'file') {
            input.addEventListener('change', () => {
                validateFile(input);
            });
        }
    });
}

/**
 * Debounce function untuk performance
 * @param {Function} func 
 * @param {number} wait
 * @returns {Function} 
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


/**
 * Setup auto-save untuk form yang panjang
 * @param {string} formId 
 * @param {string} storageKey 
 */
function setupFormAutoSave(formId, storageKey) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    let saveTimer;
    
    form.addEventListener('input', debounce(() => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            saveFormDraft(form, storageKey);
        }, 2000);
    }, 500));
    
    window.addEventListener('load', () => {
        loadFormDraft(form, storageKey);
    });
}

/**
 * Simpan draft form ke localStorage
 * @param {HTMLFormElement} form
 * @param {string} storageKey
 */
function saveFormDraft(form, storageKey) {
    const formData = {};
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            formData[input.name] = input.checked;
        } else if (input.type !== 'file') {
            formData[input.name] = input.value;
        }
    });
    
    localStorage.setItem(storageKey, JSON.stringify({
        data: formData,
        timestamp: new Date().toISOString()
    }));
    
    showSaveIndicator(form, 'Draft disimpan');
}

/**
 * Load draft form dari localStorage
 * @param {HTMLFormElement} form
 * @param {string} storageKey 
 */
function loadFormDraft(form, storageKey) {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    
    try {
        const { data, timestamp } = JSON.parse(saved);
        
        if (confirm(`Ada draft yang disimpan pada ${new Date(timestamp).toLocaleString()}. Lanjutkan?`)) {
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        input.checked = data[key];
                    } else {
                        input.value = data[key];
                    }
                }
            });
            
            showSaveIndicator(form, 'Draft dimuat ulang');
        }
    } catch (error) {
        console.error('Error loading form draft:', error);
    }
}

/**
 * Tampilkan save indicator
 * @param {HTMLFormElement} form
 * @param {string} message
 */
function showSaveIndicator(form, message) {
    const existingIndicator = form.querySelector('.save-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    const indicator = document.createElement('div');
    indicator.className = 'save-indicator';
    indicator.textContent = message;
    indicator.style.cssText = `
        position: absolute;
        bottom: -25px;
        right: 0;
        font-size: 0.75rem;
        color: #4CAF50;
        animation: fadeInOut 2s ease;
    `;
    
    form.style.position = 'relative';
    form.appendChild(indicator);
    
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.remove();
        }
    }, 2000);
}

/**
 * Initialize semua form validation
 */
function initializeFormValidation() {
    console.log('Initializing form validation...');
    
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        const formId = form.id || `form-${Math.random().toString(36).substr(2, 9)}`;
        if (!form.id) form.id = formId;
        
        form.addEventListener('submit', (event) => {
            handleFormSubmit(event, 
                (data) => console.log('Form submitted successfully:', data),
                (data) => console.log('Form submission failed:', data)
            );
        });
        
        setupRealTimeValidation(formId);
        
        if (form.hasAttribute('data-auto-save')) {
            const storageKey = form.getAttribute('data-storage-key') || `form-draft-${formId}`;
            setupFormAutoSave(formId, storageKey);
        }
    });
    
    addValidationStyles();
}

/**
 * Tambahkan CSS styles untuk validation
 */
function addValidationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; }
            10%, 90% { opacity: 1; }
        }
        
        input.error, select.error, textarea.error {
            border-color: #f44336 !important;
            box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2) !important;
        }
        
        input.valid, select.valid, textarea.valid {
            border-color: #4CAF50 !important;
        }
        
        .error-message {
            color: #f44336;
            font-size: 0.875rem;
            margin-top: 5px;
            animation: fadeIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Format phone number ke format Indonesia
 * @param {string} phone
 * @returns {string}
 */
function formatPhoneNumber(phone) {
    const clean = phone.replace(/\D/g, '');
    
    if (clean.startsWith('0')) {
        return '+62' + clean.substring(1);
    } else if (clean.startsWith('62')) {
        return '+' + clean;
    } else if (clean.startsWith('8')) {
        return '+62' + clean;
    }
    
    return phone;
}

/**
 * Validasi email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    return VALIDATION_CONFIG.EMAIL_REGEX.test(email);
}

/**
 * Validasi nomor telepon Indonesia
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
    const clean = phone.replace(/[\s\-\(\)\.]/g, '');
    return VALIDATION_CONFIG.PHONE_REGEX.test(clean);
}

/**
 * Validasi URL
 * @param {string} url
 * @returns {boolean}
 */
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get file extension
 * @param {string} filename
 * @returns {string}
 */
function getFileExtension(filename) {
    return '.' + filename.split('.').pop().toLowerCase();
}

window.FormValidation = {
    validateForm,
    validateField,
    validateFile,
    validateCVFile,
    validateApplicationForm,
    validateContactForm,
    handleFormSubmit,
    setupRealTimeValidation,
    setupFormAutoSave,
    initializeFormValidation,
    isValidEmail,
    isValidPhone,
    formatPhoneNumber
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof initializeFormValidation === 'function') {
        initializeFormValidation();
    }
});

/**
 * Log validation errors ke console
 * @param {string} formId
 * @param {Array} errors
 */
function logValidationErrors(formId, errors) {
    if (errors.length === 0) return;
    
    console.group(`📝 Validation Errors - ${formId}`);
    errors.forEach((error, index) => {
        console.error(`${index + 1}. ${error.field}: ${error.message}`);
    });
    console.groupEnd();
}

/**
 * Log form submission ke console
 * @param {string} formId 
 * @param {Object} data
 * @param {boolean} success
 */
function logFormSubmission(formId, data, success) {
    const icon = success ? '✅' : '❌';
    const status = success ? 'SUCCESS' : 'FAILED';
    
    console.group(`${icon} Form Submission - ${formId} (${status})`);
    console.log('📋 Form Data:', data);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.groupEnd();
}

console.log('✅ form-validation.js loaded successfully');
console.log('📋 Available functions:');
console.log('  • validateForm(formId)');
console.log('  • validateField(field)');
console.log('  • handleFormSubmit(event)');
console.log('  • initializeFormValidation()');
console.log('  • FormValidation.isValidEmail(email)');
console.log('  • FormValidation.isValidPhone(phone)');

export {
    validateForm,
    validateField,
    validateFile,
    validateApplicationForm,
    validateContactForm,
    handleFormSubmit,
    initializeFormValidation,
    isValidEmail,
    isValidPhone
};
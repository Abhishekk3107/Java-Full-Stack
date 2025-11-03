
    // Get form and elements
    const form = document.getElementById('signupForm');
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');

    // Error message elements
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const phoneError = document.getElementById('phoneError');
    const passwordError = document.getElementById('passwordError');
    const confirmError = document.getElementById('confirmError');
    const strengthText = document.getElementById('strengthText');

    // Real-time validation flags
    let isNameValid = false;
    let isEmailValid = false;
    let isPhoneValid = true; // optional
    let isPasswordValid = false;
    let isConfirmValid = false;

    // Utility to clear errors
    function clearError(field, errorSpan) {
        errorSpan.textContent = '';
        field.classList.remove('shake');
    }

    // Name validation
    fullName.addEventListener('input', function() {
        const value = fullName.value.trim();
        if (value.length === 0) {
            nameError.textContent = 'Full name is required.';
            isNameValid = false;
        } else if (value.length < 2) {
            nameError.textContent = 'Name must be at least 2 characters.';
            isNameValid = false;
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
            nameError.textContent = 'Only letters and spaces allowed.';
            isNameValid = false;
        } else {
            clearError(fullName, nameError);
            nameError.classList.remove('error');
            nameError.classList.add('success');
            nameError.textContent = 'Looks good!';
            isNameValid = true;
        }
        updateSubmitButton();
    });

    // Email validation
    email.addEventListener('input', function() {
        const value = email.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (value.length === 0) {
            emailError.textContent = 'Email is required.';
            isEmailValid = false;
        } else if (!emailRegex.test(value)) {
            emailError.textContent = 'Please enter a valid email address.';
            isEmailValid = false;
        } else {
            clearError(email, emailError);
            emailError.classList.remove('error');
            emailError.classList.add('success');
            emailError.textContent = 'Valid email!';
            isEmailValid = true;
        }
        updateSubmitButton();
    });

    // Phone validation (optional but with format)
    phone.addEventListener('input', function() {
        const value = phone.value.replace(/\D/g, ''); // remove non-digits
        let formatted = '';
        if (value.length > 0) formatted += value.substring(0, 3);
        if (value.length >= 4) formatted += '-' + value.substring(3, 6);
        if (value.length >= 7) formatted += '-' + value.substring(6, 10);
        phone.value = formatted;

        if (phone.value.length === 0) {
            clearError(phone, phoneError);
            isPhoneValid = true;
        } else if (phone.value.length !== 12) {
            phoneError.textContent = 'Use format: 555-123-4567';
            isPhoneValid = false;
        } else {
            clearError(phone, phoneError);
            isPhoneValid = true;
        }
        updateSubmitButton();
    });

    // Password strength and validation
    password.addEventListener('input', function() {
        const value = password.value;
        let strength = 0;
        let feedback = '';

        // Reset
        strengthText.className = 'password-strength';

        if (value.length >= 8) strength++;
        if (/[a-z]/.test(value)) strength++;
        if (/[A-Z]/.test(value)) strength++;
        if (/[0-9]/.test(value)) strength++;
        if (/[^a-zA-Z0-9]/.test(value)) strength++;

        if (value.length === 0) {
            passwordError.textContent = 'Password is required.';
            isPasswordValid = false;
            strengthText.textContent = 'Enter a password';
        } else if (value.length < 8) {
            passwordError.textContent = 'Password must be at least 8 characters.';
            isPasswordValid = false;
            strengthText.textContent = 'Too short';
            strengthText.classList.add('strength-weak');
        } else if (strength < 3) {
            passwordError.textContent = 'Use uppercase, lowercase, and numbers.';
            isPasswordValid = false;
            strengthText.textContent = 'Weak password';
            strengthText.classList.add('strength-weak');
        } else if (strength < 5) {
            clearError(password, passwordError);
            isPasswordValid = true;
            strengthText.textContent = 'Medium strength';
            strengthText.classList.add('strength-medium');
        } else {
            clearError(password, passwordError);
            isPasswordValid = true;
            strengthText.textContent = 'Strong password!';
            strengthText.classList.add('strength-strong');
        }

        // Re-check confirm password if already typed
        if (confirmPassword.value) {
            validateConfirmPassword();
        }
        updateSubmitButton();
    });

    // Confirm password
    function validateConfirmPassword() {
        if (confirmPassword.value === '') {
            confirmError.textContent = 'Please confirm your password.';
            isConfirmValid = false;
        } else if (confirmPassword.value !== password.value) {
            confirmError.textContent = 'Passwords do not match.';
            isConfirmValid = false;
        } else {
            clearError(confirmPassword, confirmError);
            confirmError.classList.remove('error');
            confirmError.classList.add('success');
            confirmError.textContent = 'Passwords match!';
            isConfirmValid = true;
        }
    }

    confirmPassword.addEventListener('input', function() {
        validateConfirmPassword();
        updateSubmitButton();
    });

    // Update submit button state
    function updateSubmitButton() {
        const allValid = isNameValid && isEmailValid && isPhoneValid && isPasswordValid && isConfirmValid;
        submitBtn.disabled = !allValid;
    }

    // Form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Final validation (in case of direct submit)
        if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
            alert('Please fix the errors in the form.');
            return;
        }

        // Simulate success
        alert('Account created successfully! (This is a demo)');
        // In real app: send data via fetch/AJAX
        // form.submit();
    });

    // Initial state
    updateSubmitButton();

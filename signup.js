// Signup form handling
const handleSignup = async (formData) => {
    try {
        // Validate form data first
        validateForm(formData);

        // Attempt signup
        const response = await auth.signup(formData);
        
        if (response.success) {
            // Show success message
            showMessage('Account created successfully! Redirecting...', 'success');
            // Redirect to feed page after successful signup
            setTimeout(() => {
                window.location.href = '/feed';
            }, 1500);
        } else {
            // Show error message
            showMessage(response.error, 'error');
        }
        return response;
    } catch (error) {
        showMessage(error.message, 'error');
        return { success: false, error: error.message };
    }
};

// Form validation
const validateForm = (formData) => {
    const errors = [];

    if (!formData.username || formData.username.length < 3) {
        errors.push('Username must be at least 3 characters long');
    }

    if (!formData.email || !formData.email.includes('@')) {
        errors.push('Please enter a valid email address');
    }

    if (!formData.password || formData.password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
    }

    // Check password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    if (errors.length > 0) {
        throw new Error(errors.join('\n'));
    }

    return true;
};

// Helper function to show messages
const showMessage = (message, type) => {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
        messageElement.style.display = 'block';
    } else {
        alert(message); // Fallback if message element doesn't exist
    }
};

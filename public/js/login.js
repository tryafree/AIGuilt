// Login form handling
const handleLoginRequest = async (formData) => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: formData.email,
                password: formData.password
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
            id: data.user._id,
            username: data.user.username,
            email: data.user.email
        }));
        localStorage.setItem('isLoggedIn', 'true');

        // Redirect to profile page
        window.location.href = '/profile.html';
        
        return { success: true, message: 'Login successful!' };
    } catch (error) {
        console.error('Login error:', error);
        throw new Error('Login failed: ' + error.message);
    }
};

// Initialize login form
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                await handleLoginRequest({ email, password });
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }
});

// Helper function to show messages
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'}`;
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

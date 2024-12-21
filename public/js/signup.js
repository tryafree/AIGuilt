// Signup form handling
const handleSignup = async (formData) => {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: formData.username,
                email: formData.email,
                password: formData.password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        return {
            success: true,
            message: 'Account created successfully! Redirecting to login...'
        };
    } catch (error) {
        console.error('Signup error:', error);
        throw new Error(error.message || 'Signup failed. Please try again.');
    }
};

// API endpoints configuration
const API_CONFIG = {
    BASE_URL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api',
    CREDENTIALS: true,
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

// Error handling
class APIError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'APIError';
    }
}

// API response handler
const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        const error = isJson ? data.message : 'An error occurred';
        throw new APIError(error, response.status);
    }

    return data;
};

// Authentication API
const auth = {
    async register(userData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(userData)
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    },

    async login(credentials) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(credentials)
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    },

    async logout() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: API_CONFIG.HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    },

    async getCurrentUser() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
                credentials: 'include',
                headers: API_CONFIG.HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    }
};

// Posts API
const posts = {
    async create(postData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/posts`, {
                method: 'POST',
                credentials: 'include',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(postData)
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    },

    async getAll() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/posts`, {
                credentials: 'include',
                headers: API_CONFIG.HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    },

    async getById(id) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/posts/${id}`, {
                credentials: 'include',
                headers: API_CONFIG.HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    },

    async update(id, postData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/posts/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(postData)
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    },

    async delete(id) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/posts/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: API_CONFIG.HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    }
};

// User API
const users = {
    async updateProfile(profileData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/users/profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(profileData)
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    },

    async updatePassword(passwordData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/users/password`, {
                method: 'PUT',
                credentials: 'include',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(passwordData)
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    },

    async deleteAccount() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/users`, {
                method: 'DELETE',
                credentials: 'include',
                headers: API_CONFIG.HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    }
};

// Comments API
const comments = {
    async getComments(postId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/posts/${postId}/comments`, {
                credentials: 'include',
                headers: API_CONFIG.HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    },

    async addComment(postId, commentData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/posts/${postId}/comments`, {
                method: 'POST',
                credentials: 'include',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(commentData)
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    }
};

// Likes API
const likes = {
    async likePost(postId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/posts/${postId}/like`, {
                method: 'POST',
                credentials: 'include',
                headers: API_CONFIG.HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    }
};

// Stats API
const stats = {
    async getUserStats() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/users/stats`, {
                credentials: 'include',
                headers: API_CONFIG.HEADERS
            });
            return handleResponse(response);
        } catch (error) {
            throw new APIError(error.message, error.status);
        }
    }
};

// Export API modules
export const API = {
    auth,
    posts,
    users,
    comments,
    likes,
    stats
};

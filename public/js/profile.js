// Profile API functions
async function updateProfile(profileData) {
    try {
        const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to update profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Profile update error:', error);
        throw error;
    }
}

async function changePassword(passwordData) {
    try {
        const response = await fetch('/api/users/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(passwordData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to change password');
        }

        return await response.json();
    } catch (error) {
        console.error('Password change error:', error);
        throw error;
    }
}

async function uploadAvatar(file) {
    try {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch('/api/users/avatar', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to upload avatar');
        }

        return await response.json();
    } catch (error) {
        console.error('Avatar upload error:', error);
        throw error;
    }
}

async function getProfile() {
    try {
        const response = await fetch('/api/users/profile', {
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to load profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Profile load error:', error);
        throw error;
    }
}

// Post API functions
async function createPost(postData) {
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to create post');
        }

        return await response.json();
    } catch (error) {
        console.error('Post creation error:', error);
        throw error;
    }
}

async function getUserPosts() {
    try {
        const response = await fetch('/api/posts/user', {
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to load posts');
        }

        return await response.json();
    } catch (error) {
        console.error('Posts load error:', error);
        throw error;
    }
}

async function deletePost(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete post');
        }

        return await response.json();
    } catch (error) {
        console.error('Post deletion error:', error);
        throw error;
    }
}

async function likePost(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to like/unlike post');
        }

        return await response.json();
    } catch (error) {
        console.error('Post like error:', error);
        throw error;
    }
}

async function addComment(postId, content) {
    try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to add comment');
        }

        return await response.json();
    } catch (error) {
        console.error('Comment creation error:', error);
        throw error;
    }
}

// Export all functions
export {
    updateProfile,
    changePassword,
    uploadAvatar,
    getProfile,
    createPost,
    getUserPosts,
    deletePost,
    likePost,
    addComment
};

document.addEventListener('DOMContentLoaded', () => {
    const editProfileBtn = document.querySelector('.btn');
    const profileForm = document.getElementById('profile-form');
    
    editProfileBtn.addEventListener('click', () => {
        // Toggle form visibility
        if (profileForm.style.display === 'none') {
            profileForm.style.display = 'block';
            editProfileBtn.textContent = 'Cancel';
        } else {
            profileForm.style.display = 'none';
            editProfileBtn.textContent = 'Edit Profile';
        }
    });

    // Handle form submission
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            displayName: document.getElementById('display-name').value,
            bio: document.getElementById('bio').value,
            location: document.getElementById('location').value,
            interests: document.getElementById('interests').value
        };

        // Save to database
        fetch('/api/users/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            profileForm.style.display = 'none';
            editProfileBtn.textContent = 'Edit Profile';
            // Refresh profile data
            loadProfileData();
        });
    });
});

function logout() {
    localStorage.clear();
    window.location.href = '/auth.html';
}

// Add post creation functionality
function createPost() {
    const postContent = document.getElementById('post-content').value;
    
    fetch('/api/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: postContent,
            author: localStorage.getItem('userEmail'),
            timestamp: new Date()
        })
    })
    .then(response => response.json())
    .then(post => {
        // Clear the input
        document.getElementById('post-content').value = '';
        
        // Emit socket event for real-time feed update
        socket.emit('newPost', post);
        
        // Update feed immediately
        const feedContainer = document.querySelector('.feed-container');
        if (feedContainer) {
            const postElement = createPostElement(post);
            feedContainer.insertBefore(postElement, feedContainer.firstChild);
        }
    });
}
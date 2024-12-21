const app = Vue.createApp({
    data() {
        return {
            user: {
                _id: '',
                username: '',
                email: '',
                profilePicture: 'https://via.placeholder.com/150',
                role: 'User',
                joinedDate: new Date()
            },
            stats: {
                posts: 0,
                comments: 0,
                likes: 0
            },
            editMode: false,
            alert: null,
            posts: [],
            newPost: {
                content: '',
                category: ''
            },
            newComment: {}
        }
    },
    computed: {
        joinedDateFormatted() {
            return new Date(this.user.joinedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }
    },
    methods: {
        async fetchUserData() {
            try {
                const response = await api.get('/api/user/profile')
                this.user = response.data
                this.fetchUserStats()
            } catch (error) {
                this.showAlert('Error fetching user data', 'danger')
            }
        },
        async fetchUserStats() {
            try {
                const response = await api.get('/api/user/stats')
                this.stats = response.data
            } catch (error) {
                this.showAlert('Error fetching user stats', 'danger')
            }
        },
        async fetchPosts() {
            try {
                const response = await api.get('/api/posts')
                this.posts = response.data
            } catch (error) {
                this.showAlert('Error fetching posts', 'danger')
            }
        },
        async createPost() {
            try {
                await api.post('/api/posts', this.newPost)
                this.newPost.content = ''
                this.newPost.category = ''
                await this.fetchPosts()
                this.showAlert('Post created successfully!', 'success')
            } catch (error) {
                this.showAlert('Error creating post', 'danger')
            }
        },
        async likePost(postId) {
            try {
                await api.post(`/api/posts/${postId}/like`)
                await this.fetchPosts()
            } catch (error) {
                this.showAlert('Error liking post', 'danger')
            }
        },
        async deletePost(postId) {
            if (confirm('Are you sure you want to delete this post?')) {
                try {
                    await api.delete(`/api/posts/${postId}`)
                    await this.fetchPosts()
                    this.showAlert('Post deleted successfully!', 'success')
                } catch (error) {
                    this.showAlert('Error deleting post', 'danger')
                }
            }
        },
        async addComment(postId) {
            if (!this.newComment[postId]) return
            
            try {
                await api.post(`/api/posts/${postId}/comments`, {
                    content: this.newComment[postId]
                })
                this.newComment[postId] = ''
                await this.fetchPosts()
            } catch (error) {
                this.showAlert('Error adding comment', 'danger')
            }
        },
        showComments(postId) {
            const post = this.posts.find(p => p._id === postId)
            if (post) {
                post.showComments = !post.showComments
            }
        },
        async handleProfilePictureChange(event) {
            const file = event.target.files[0]
            if (!file) return

            const formData = new FormData()
            formData.append('profilePicture', file)

            try {
                await api.post('/api/user/profile-picture', formData)
                await this.fetchUserData()
                this.showAlert('Profile picture updated successfully!', 'success')
            } catch (error) {
                this.showAlert('Error updating profile picture', 'danger')
            }
        },
        async updateProfile(event) {
            event.preventDefault()
            try {
                await api.put('/api/user/profile', {
                    username: this.user.username,
                    email: this.user.email
                })
                this.editMode = false
                this.showAlert('Profile updated successfully!', 'success')
            } catch (error) {
                this.showAlert('Error updating profile', 'danger')
            }
        },
        async handleLogout() {
            try {
                await api.post('/api/auth/logout')
                window.location.href = '/login.html'
            } catch (error) {
                this.showAlert('Error logging out', 'danger')
            }
        },
        showAlert(message, type = 'info') {
            this.alert = { message, type }
            setTimeout(() => {
                this.alert = null
            }, 3000)
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    },
    mounted() {
        this.fetchUserData()
        this.fetchPosts()
    }
}).mount('#app')

const app = Vue.createApp({
    data() {
        return {
            isLoggedIn: false,
            newPost: '',
            posts: [],
            articles: [
                {
                    id: 1,
                    title: 'The Impact of AI on Professional Identity',
                    excerpt: 'Exploring how AI integration affects workers\' sense of professional worth and identity.',
                    author: 'Dr. Sarah Chen',
                    image: 'images/article1.jpg'
                },
                {
                    id: 2,
                    title: 'AI Guilt in Creative Industries',
                    excerpt: 'Understanding the psychological impact of AI tools on creative professionals.',
                    author: 'Prof. Michael Roberts',
                    image: 'images/article2.jpg'
                }
            ]
        }
    },
    methods: {
        async checkLoginStatus() {
            try {
                const response = await fetch('api/check_auth.php');
                const data = await response.json();
                this.isLoggedIn = data.isLoggedIn;
            } catch (error) {
                console.error('Error checking login status:', error);
            }
        },
        async loadPosts() {
            try {
                const response = await fetch('api/posts.php');
                const data = await response.json();
                this.posts = data;
            } catch (error) {
                console.error('Error loading posts:', error);
            }
        },
        async submitPost() {
            if (!this.newPost.trim()) return;
            
            try {
                const response = await fetch('api/posts.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: this.newPost })
                });
                
                const data = await response.json();
                if (response.ok) {
                    this.posts.unshift(data);
                    this.newPost = '';
                }
            } catch (error) {
                console.error('Error submitting post:', error);
                alert('Failed to create post. Please try again.');
            }
        },
        async upvotePost(post) {
            if (!this.isLoggedIn) {
                alert('Please log in to upvote posts');
                return;
            }
            
            try {
                const response = await fetch(`api/upvote.php?post_id=${post.id}`, {
                    method: 'POST'
                });
                
                if (response.ok) {
                    post.upvotes = (post.upvotes || 0) + 1;
                }
            } catch (error) {
                console.error('Error upvoting post:', error);
            }
        },
        async replyToPost(post) {
            if (!this.isLoggedIn) {
                alert('Please log in to reply to posts');
                return;
            }
            
            const reply = prompt('Enter your reply:');
            if (!reply) return;
            
            try {
                const response = await fetch('api/comments.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        post_id: post.id,
                        content: reply
                    })
                });
                
                if (response.ok) {
                    this.loadPosts(); // Reload posts to show new comment
                }
            } catch (error) {
                console.error('Error posting reply:', error);
            }
        },
        async logout() {
            try {
                await fetch('api/logout.php');
                window.location.href = 'login.php';
            } catch (error) {
                console.error('Error logging out:', error);
            }
        },
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }
    },
    mounted() {
        this.checkLoginStatus();
        this.loadPosts();
    }
}).mount('#app');

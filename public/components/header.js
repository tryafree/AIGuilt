// Header component
const headerComponent = {
    template: `
        <nav class="navbar navbar-expand-lg">
            <div class="container">
                <a class="navbar-brand" href="/">AI Guilt</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <template v-if="!isAuthenticated">
                            <li class="nav-item">
                                <a class="nav-link" href="#" @click="scrollToForm">Join Now</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#" @click="showLoginModal">Login</a>
                            </li>
                        </template>
                        <template v-else>
                            <li class="nav-item">
                                <a class="nav-link" :class="{ active: currentPage === 'feed' }" href="/feed">Feed</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" :class="{ active: currentPage === 'profile' }" href="/profile">Profile</a>
                            </li>
                        </template>
                        <li class="nav-item">
                            <a class="nav-link" :class="{ active: currentPage === 'about' }" href="/about">About</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{ active: currentPage === 'resources' }" href="/resources">Resources</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{ active: currentPage === 'contact' }" href="/contact">Contact</a>
                        </li>
                        <li class="nav-item" v-if="isAuthenticated">
                            <a class="nav-link" href="#" @click="logout">Logout</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `,
    props: {
        currentPage: {
            type: String,
            required: true
        }
    },
    computed: {
        isAuthenticated() {
            return auth.isAuthenticated();
        }
    },
    methods: {
        showLoginModal() {
            this.$emit('show-login');
        },
        scrollToForm() {
            this.$emit('scroll-to-form');
        },
        logout() {
            auth.logout();
        }
    }
};

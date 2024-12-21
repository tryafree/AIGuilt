<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Guilt - Exploring Ethical Implications of AI</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vue@3.2.36/dist/vue.global.js"></script>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="app">
        <nav class="navbar navbar-expand-lg">
            <div class="container">
                <a class="navbar-brand" href="/">AI Guilt</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="about.php">About</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="resources.php">Resources</a>
                        </li>
                        <li class="nav-item" v-if="!isLoggedIn">
                            <a class="nav-link" href="register.php">Sign Up</a>
                        </li>
                        <li class="nav-item" v-if="!isLoggedIn">
                            <a class="nav-link" href="login.php">Login</a>
                        </li>
                        <li class="nav-item" v-if="isLoggedIn">
                            <a class="nav-link" href="profile.php">Profile</a>
                        </li>
                        <li class="nav-item" v-if="isLoggedIn">
                            <a class="nav-link" href="#" @click="logout">Logout</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <div class="container mt-4">
            <div class="row">
                <!-- Left column: Member feed -->
                <div class="col-md-6">
                    <h2>Community Feed</h2>
                    <div v-if="isLoggedIn" class="mb-4">
                        <textarea class="form-control bg-dark text-white" v-model="newPost" rows="3" placeholder="Share your AI guilt experience..."></textarea>
                        <button class="btn btn-primary mt-2" @click="submitPost">Post</button>
                    </div>
                    <div class="feed-item" v-for="post in posts" :key="post.id">
                        <div class="d-flex align-items-center mb-2">
                            <img :src="post.profile_image || 'images/default-avatar.png'" class="avatar me-2" :alt="post.username">
                            <h5 class="mb-0">{{ post.username }}</h5>
                        </div>
                        <p>{{ post.content }}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">{{ formatDate(post.created_at) }}</small>
                            <div>
                                <button class="btn btn-sm btn-outline-primary me-2" @click="upvotePost(post)">
                                    Upvote ({{ post.upvotes || 0 }})
                                </button>
                                <button class="btn btn-sm btn-outline-secondary" @click="replyToPost(post)">Reply</button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Right column: Latest Research -->
                <div class="col-md-6">
                    <h2>Latest AI Guilt Research</h2>
                    <div v-for="article in articles" :key="article.id" class="research-card">
                        <img :src="article.image" :alt="article.title" class="research-image">
                        <h4>{{ article.title }}</h4>
                        <p>{{ article.excerpt }}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">By {{ article.author }}</small>
                            <a :href="'article.php?id=' + article.id" class="btn btn-primary btn-sm">Read More</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="js/main.js"></script>
</body>
</html>

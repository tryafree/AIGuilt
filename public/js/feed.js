function loadPosts() {
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            const feedContainer = document.querySelector('.feed-container');
            feedContainer.innerHTML = '';
            posts.forEach(post => {
                feedContainer.innerHTML += `
                    <div class="post">
                        <p class="author">${post.author}</p>
                        <p class="content">${post.content}</p>
                        <p class="timestamp">${new Date(post.timestamp).toLocaleString()}</p>
                    </div>
                `;
            });
        });
}

document.addEventListener('DOMContentLoaded', loadPosts);

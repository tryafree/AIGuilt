function displayPosts(posts) {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <img src="${post.profile_image || 'assets/images/default-profile.png'}" class="profile-pic">
                <span class="username">${post.username}</span>
            </div>
            <div class="post-content">
                ${post.content}
            </div>
            <div class="post-footer">
                <span class="timestamp">${new Date(post.created_at).toLocaleString()}</span>
            </div>
            <div class="comments">
                ${post.comments ? post.comments.map(comment => `
                    <div class="comment">
                        <img src="${comment.profile_image || 'assets/images/default-profile.png'}" class="comment-profile-pic">
                        <span class="comment-username">${comment.username}</span>
                        <span class="comment-content">${comment.content}</span>
                    </div>
                `).join('') : ''}
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
}

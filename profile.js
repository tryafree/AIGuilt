function createPost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const category = document.getElementById('post-category').value;
    const imageFile = document.getElementById('post-image').files[0];

    if (!content.trim()) {
        alert('Please write something before posting!');
        return;
    }

    // Here you would typically send this data to your backend
    const postData = {
        title: title,
        content: content,
        category: category,
        image: imageFile,
        timestamp: new Date().toISOString(),
        author: document.getElementById('display-name').value || 'Anonymous'
    };

    console.log('Post created:', postData);
    // Clear form after posting
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    document.getElementById('post-category').value = '';
    document.getElementById('post-image').value = '';
}

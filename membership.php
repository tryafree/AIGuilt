<script>
document.getElementById('membershipForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    fetch('/register.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            window.location.href = '/verify-email.html';
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});
</script>

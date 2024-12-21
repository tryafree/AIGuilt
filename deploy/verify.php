<?php
require_once 'db_connect.php';

$token = $_GET['token'] ?? '';
$verified = false;
$message = '';

if (!empty($token)) {
    $stmt = $conn->prepare("SELECT id FROM users WHERE verification_token = ? AND is_verified = 0");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Update user as verified
        $update_stmt = $conn->prepare("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?");
        $update_stmt->bind_param("i", $user['id']);
        
        if ($update_stmt->execute()) {
            $verified = true;
            $message = 'Your account has been successfully verified! You can now login.';
        } else {
            $message = 'An error occurred while verifying your account. Please try again.';
        }
        $update_stmt->close();
    } else {
        $message = 'Invalid verification token or account already verified.';
    }
    $stmt->close();
} else {
    $message = 'No verification token provided.';
}

$conn->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Account - AI Guilt</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg">
        <div class="container">
            <a class="navbar-brand" href="/">AI Guilt</a>
        </div>
    </nav>

    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="feed-item text-center">
                    <h2 class="mb-4">Account Verification</h2>
                    <p><?php echo htmlspecialchars($message); ?></p>
                    <?php if ($verified): ?>
                        <a href="login.php" class="btn btn-primary">Login Now</a>
                    <?php else: ?>
                        <a href="/" class="btn btn-primary">Return to Home</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>

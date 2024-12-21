<?php
require_once '../db_connect.php';
require_once '../includes/email.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$username = $_POST['username'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// Validate input
if (empty($username) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Check if email already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit;
}
$stmt->close();

// Check if username already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Username already taken']);
    exit;
}
$stmt->close();

// Hash password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Generate verification token
$verification_token = bin2hex(random_bytes(32));

// Insert new user
$stmt = $conn->prepare("INSERT INTO users (username, email, password, verification_token) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $username, $email, $hashed_password, $verification_token);

if ($stmt->execute()) {
    // Send verification email
    $verification_link = "https://" . $_SERVER['HTTP_HOST'] . "/verify.php?token=" . $verification_token;
    
    $subject = "Verify your AI Guilt account";
    $message = "Hello $username,\n\n";
    $message .= "Thank you for registering at AI Guilt. Please click the link below to verify your account:\n\n";
    $message .= $verification_link . "\n\n";
    $message .= "If you didn't create this account, please ignore this email.\n\n";
    $message .= "Best regards,\nAI Guilt Team";
    
    if (sendEmail($email, $subject, $message)) {
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful! Please check your email to verify your account.'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful! However, we could not send the verification email. Please contact support.'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Registration failed. Please try again.'
    ]);
}

$stmt->close();
$conn->close();
?>

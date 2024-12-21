<?php
session_start();
require_once '../db_connect.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get user profile
    $stmt = $conn->prepare("SELECT id, username, email, bio, profile_image, created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    echo json_encode($user);
} 
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Update user profile
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Handle profile image upload
    if (isset($_FILES['profile_image'])) {
        $target_dir = "../uploads/profile_images/";
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        
        $file_extension = strtolower(pathinfo($_FILES["profile_image"]["name"], PATHINFO_EXTENSION));
        $new_filename = $user_id . '_' . time() . '.' . $file_extension;
        $target_file = $target_dir . $new_filename;
        
        if (move_uploaded_file($_FILES["profile_image"]["tmp_name"], $target_file)) {
            $profile_image = 'uploads/profile_images/' . $new_filename;
            $stmt = $conn->prepare("UPDATE users SET profile_image = ? WHERE id = ?");
            $stmt->bind_param("si", $profile_image, $user_id);
            $stmt->execute();
        }
    }
    
    // Update other profile information
    if (isset($data['bio'])) {
        $stmt = $conn->prepare("UPDATE users SET bio = ? WHERE id = ?");
        $stmt->bind_param("si", $data['bio'], $user_id);
        $stmt->execute();
    }
    
    if (isset($data['email'])) {
        $stmt = $conn->prepare("UPDATE users SET email = ? WHERE id = ?");
        $stmt->bind_param("si", $data['email'], $user_id);
        $stmt->execute();
    }
    
    echo json_encode(['success' => true]);
}

$conn->close();
?>

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
    // Get posts with user information
    $stmt = $conn->prepare("
        SELECT p.*, u.username, u.profile_image 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        ORDER BY p.created_at DESC
    ");
    $stmt->execute();
    $result = $stmt->get_result();
    $posts = [];
    
    while ($row = $result->fetch_assoc()) {
        // Get comments for each post
        $comment_stmt = $conn->prepare("
            SELECT c.*, u.username, u.profile_image 
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        ");
        $comment_stmt->bind_param("i", $row['id']);
        $comment_stmt->execute();
        $comments = $comment_stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        $row['comments'] = $comments;
        $posts[] = $row;
    }
    
    echo json_encode($posts);
} 
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create new post
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['content']) || empty($data['content'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Content is required']);
        exit;
    }
    
    $stmt = $conn->prepare("INSERT INTO posts (user_id, content) VALUES (?, ?)");
    $stmt->bind_param("is", $user_id, $data['content']);
    
    if ($stmt->execute()) {
        $post_id = $stmt->insert_id;
        
        // Get the created post with user information
        $stmt = $conn->prepare("
            SELECT p.*, u.username, u.profile_image 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.id = ?
        ");
        $stmt->bind_param("i", $post_id);
        $stmt->execute();
        $post = $stmt->get_result()->fetch_assoc();
        
        echo json_encode($post);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create post']);
    }
}

$conn->close();
?>

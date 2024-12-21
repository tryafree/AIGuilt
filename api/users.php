<?php
header('Content-Type: application/json');
require_once '../includes/db_connect.php';

class UserController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }

    public function getProfile($userId) {
        $stmt = $this->db->prepare("SELECT id, email, display_name, bio, profile_picture FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

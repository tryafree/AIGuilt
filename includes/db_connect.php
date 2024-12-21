<?php
$db_host = 'localhost';
$db_name = 'u454156971_xAh7i';
$db_user = 'your_hostinger_username';
$db_pass = 'your_hostinger_password';

try {
    $db = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

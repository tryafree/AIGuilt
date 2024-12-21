<?php
// Database configuration
$db_host = 'localhost';     // Replace with your database host
$db_user = 'username';      // Replace with your database username
$db_pass = 'password';      // Replace with your database password
$db_name = 'aiguilt_db';    // Replace with your database name

// Create connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to utf8mb4
$conn->set_charset("utf8mb4");
?>

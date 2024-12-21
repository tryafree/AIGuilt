<?php
session_start();

// Database configuration
$db_host = '127.0.0.1:3306'; // Or your specific host
$db_user = 'u454156971_Aiguiltadmin';
$db_pass = '$$Capslock2024';
$db_name = 'u454156971_AIGUILT';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST["username"];
    $password = $_POST["password"];


    if (empty($username) || empty($password)) {
        die("Please enter username/email and password");
    }

    try {
       // Check if user exists with username or email
          $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username OR email = :username");
          $stmt->execute(['username' => $username]);
          $user = $stmt->fetch();

       if ($user && password_verify($password, $user['password'])) {
            // Password matches
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['username'] = $user['username'];

            header("Location: index.php"); // Redirect to your home page
              exit();
        } else {
            die("Invalid username/email or password.");
        }

    } catch (PDOException $e) {
          die("Error during login: " . $e->getMessage());
    }
}
?>
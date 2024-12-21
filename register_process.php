<?php
session_start();

// Database configuration
$db_host = '127.0.0.1:3306/'; // Or your specific host
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
    $email = $_POST["email"];
    $password = $_POST["password"];

    // Validation (You might want to add more robust validation)
    if (empty($username) || empty($email) || empty($password)) {
        die("Please fill all fields.");
    }

     if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Invalid email format.");
    }

     if (strlen($password) < 8) {
         die("Password should be at least 8 characters.");
     }

    try {
        // Check if username or email already exists
          $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username OR email = :email");
          $stmt->execute(['username' => $username, 'email' => $email]);
          if ($stmt->fetch()) {
            die("Username or email already exists.");
        }

        // Hash the password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Prepare and execute the INSERT statement
        $stmt = $pdo->prepare("INSERT INTO users (username, password, email) VALUES (:username, :password, :email)");
        $stmt->execute(['username' => $username, 'password' => $hashedPassword, 'email' => $email]);

        // Redirect to login page after successful registration
        $_SESSION['success_message'] = "Registration Successful, Please login.";
        header("Location: login.php");
         exit();

    } catch (PDOException $e) {
        die("Error during registration: " . $e->getMessage());
    }
}
?>
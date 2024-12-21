<?php
require_once 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $verification_code = $_POST['verification_code'];

    $stmt = $conn->prepare("UPDATE users SET verified = TRUE WHERE verification_code = ?");
    $stmt->bind_param("s", $verification_code);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Email verified successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Verification failed. Please try again."]);
    }

    $stmt->close();
    $conn->close();
}
?>

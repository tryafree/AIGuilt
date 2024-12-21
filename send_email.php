<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

function send_verification_email($to, $verification_code) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.example.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'your_email@example.com';
        $mail->Password   = 'your_email_password';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('noreply@aiguilt.com', 'AI Guilt');
        $mail->addAddress($to);

        $mail->isHTML(true);
        $mail->Subject = 'Verify your email for AI Guilt';
        $mail->Body    = "Please click the following link to verify your email: https://aiguilt.com/verify.html?code=$verification_code";

        $mail->send();
        return true;
    } catch (Exception $e) {
        return false;
    }
}
?>

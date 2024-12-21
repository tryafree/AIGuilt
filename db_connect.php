<?php
$servername = "localhost"; // Your Hostinger database host
$username = "u123456789_aiguilt"; // Your Hostinger database username
$password = "YourDatabasePassword"; // Your Hostinger database password
$dbname = "u123456789_aiguilt"; // Your Hostinger database name

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>

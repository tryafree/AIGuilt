<?php
session_start();

// Check if user is not logged in and redirect to login page
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Guilt - Home</title>
    <meta name="description" content="Explore the concept of AI Guilt. Connect with other members, post and contribute to the conversation.">
    <meta name="keywords" content="AI Guilt, Artificial Intelligence, Ethics, Psychology, Community, Discussion">
    <meta name="robots" content="index, follow">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-dark text-light">

    <header class="bg-dark text-light py-3">
        <div class="container d-flex justify-content-between align-items-center">
            <h1>AI Guilt</h1>
            <div>
                <!-- Navigation links can go here -->
            </div>
        </div>
    </header>


    <div class="container mt-4">
         <div class="d-flex justify-content-between align-items-center">
            <h2 class="mb-0">Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?>!</h2>
              <a href="logout.php" class="btn btn-secondary">Logout</a>
        </div>

        <div class="mt-4">
          <h3 class="text-center mt-4">Community Feed</h3>
            <p class="text-center">Coming Soon...</p>
        </div>
    </div>
  <footer class="bg-dark text-light py-3 mt-5">
        <div class="container d-flex justify-content-between align-items-center">
            <div class="text-start">
                Long Beach, California, USA
            </div>
            <div class="text-center">
                <a href="mailto:info@aiguilt.com">info@aiguilt.com</a>
            </div>
            <div class="text-end">
               1-562-444-8463
            </div>
        </div>
     <div class="container d-flex justify-content-center align-items-center mt-2">
                <a href="privacy.php" class="me-3">Privacy Policy</a>
                 <a href="terms.php" >Terms of Use</a>
           </div>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
</body>
</html>
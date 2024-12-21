<<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Guilt - Register</title>
        <meta name="description" content="Register an account to begin exploring the concept of AI Guilt">
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
    <div class="container">
        <div class="row justify-content-center mt-5">
            <div class="col-md-6">
                <h2 class="text-center mb-4">Register</h2>
                <form action="register_process.php" method="post">
                    <div class="mb-3">
                        <label for="username" class="form-label">Username</label>
                        <input type="text" class="form-control" id="username" name="username" required>
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email" name="email" required>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Register</button>
                </form>
                <p class="mt-3 text-center">Already have an account? <a href="login.php" class="text-light">Login</a></p>
            </div>
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
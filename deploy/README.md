# AI Guilt Website

A community-driven platform to explore the psychological and ethical implications of AI technology.

## Features

- User Authentication System
  - Registration with email verification
  - Secure login/logout
  - Password hashing
- Community Feed
  - Create and view posts
  - Upvote system
  - Commenting system
- User Profiles
  - Profile image upload
  - Bio editing
  - View user's posts and activity

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Composer
- Web server (Apache/Nginx)
- SSL certificate (for secure connections)

## Installation

1. Clone the repository to your web server
2. Install dependencies:
   ```bash
   composer install
   ```

3. Create a MySQL database and import the schema:
   ```bash
   mysql -u your_username -p < setup/database.sql
   ```

4. Configure your database connection:
   - Copy `db_connect.example.php` to `db_connect.php`
   - Update the credentials in `db_connect.php`

5. Configure email settings:
   - Update SMTP settings in `includes/email.php`
   - Replace placeholder email credentials with your actual email service credentials

6. Set up directories:
   ```bash
   mkdir uploads
   mkdir uploads/profile_images
   chmod 777 uploads/profile_images
   ```

7. Configure your web server:
   - Set document root to the project directory
   - Enable URL rewriting (for clean URLs)
   - Enable SSL

## Security Considerations

1. Keep `db_connect.php` and email credentials secure
2. Regularly update dependencies using `composer update`
3. Implement rate limiting for API endpoints
4. Use HTTPS for all connections
5. Regularly backup the database

## Directory Structure

```
deploy/
├── api/               # API endpoints
├── css/              # Stylesheets
├── js/               # JavaScript files
├── includes/         # PHP includes
├── uploads/          # User uploads
├── vendor/           # Composer dependencies
└── setup/            # Setup files
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

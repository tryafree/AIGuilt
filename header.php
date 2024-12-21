<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<header class="site-header">
    <div class="site-branding">
        <h1 class="site-title">
            <a href="<?php echo esc_url(home_url('/')); ?>">
                <?php bloginfo('name'); ?>
            </a>
        </h1>
        <p class="site-description"><?php bloginfo('description'); ?></p>
    </div>

    <nav class="main-navigation">
        <a href="index.html" class="nav-link">Home</a>
            'theme_location' => 'primary',
            'menu_class' => 'nav-menu',
        ));
        ?>
    </nav>
</header>

<div class="site-content">

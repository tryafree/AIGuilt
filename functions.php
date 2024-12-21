<?php
if (!defined('_S_VERSION')) {
    define('_S_VERSION', '1.0.0');
}

function aiguilt_setup() {
    // Add default posts and comments RSS feed links to head
    add_theme_support('automatic-feed-links');

    // Let WordPress manage the document title
    add_theme_support('title-tag');

    // Enable support for Post Thumbnails on posts and pages
    add_theme_support('post-thumbnails');

    // Register Navigation Menus
    register_nav_menus(array(
        'primary' => esc_html__('Primary Menu', 'aiguilt'),
    ));

    // Add theme support for selective refresh for widgets.
    add_theme_support('customize-selective-refresh-widgets');
}
add_action('after_setup_theme', 'aiguilt_setup');

// Enqueue scripts and styles
function aiguilt_scripts() {
    wp_enqueue_style('aiguilt-style', get_stylesheet_uri(), array(), _S_VERSION);
    wp_enqueue_script('aiguilt-navigation', get_template_directory_uri() . '/js/navigation.js', array(), _S_VERSION, true);
}
add_action('wp_enqueue_scripts', 'aiguilt_scripts');

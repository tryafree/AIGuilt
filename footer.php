    </div><!-- .site-content -->

    <footer class="site-footer">
        <div class="site-info">
            <?php
            printf(
                esc_html__('© %d %s. All rights reserved.', 'aiguilt'),
                date('Y'),
                get_bloginfo('name')
            );
            ?>
        </div>
    </footer>

    <?php wp_footer(); ?>
</body>
</html>

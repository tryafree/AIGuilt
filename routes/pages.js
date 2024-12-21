const express = require('express');
const router = express.Router();
const path = require('path');

// Home page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// About page
router.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../about.html'));
});

// Feed page (protected)
router.get('/feed', (req, res) => {
    res.sendFile(path.join(__dirname, '../feed.html'));
});

// Profile page (protected)
router.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../profile.html'));
});

// Edit profile page (protected)
router.get('/edit-profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../edit-profile.html'));
});

// Resources page
router.get('/resources', (req, res) => {
    res.sendFile(path.join(__dirname, '../resources.html'));
});

// Research page
router.get('/research', (req, res) => {
    res.sendFile(path.join(__dirname, '../research.html'));
});

// Contact page
router.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../contact.html'));
});

// Terms page
router.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, '../terms.html'));
});

// Privacy page
router.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, '../privacy.html'));
});

// Blog pages
router.get('/blog/1', (req, res) => {
    res.sendFile(path.join(__dirname, '../blog1.html'));
});

router.get('/blog/ai-and-job-loss', (req, res) => {
    res.sendFile(path.join(__dirname, '../blog2-ai-and-job-loss.html'));
});

module.exports = router;

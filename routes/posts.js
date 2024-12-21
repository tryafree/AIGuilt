const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.post('/', async (req, res) => {
    try {
        const post = new Post({
            content: req.body.content,
            author: req.body.author
        });
        
        await post.save();
        
        // Emit to all connected clients
        req.io.emit('newPost', post);
        
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ timestamp: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
// Delete a post
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await post.remove();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Like/unlike a post
router.post('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.user._id);
        const liked = likeIndex === -1;

        if (liked) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        res.json(liked);
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get comments for a post
router.get('/:id/comments', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post.comments);
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a comment to a post
router.post('/:id/comments', protect, [
    body('content').trim().isLength({ min: 1 }).escape()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = {
            content: req.body.content,
            author: req.user._id,
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        const populatedComment = {
            ...comment,
            author: {
                _id: req.user._id,
                username: req.user.username,
                profilePicture: req.user.profilePicture
            }
        };

        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Repost a post
router.post('/:id/repost', protect, async (req, res) => {
    try {
        const originalPost = await Post.findById(req.params.id);
        if (!originalPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user has already reposted
        const existingRepost = await Post.findOne({
            author: req.user._id,
            originalPost: originalPost._id,
            isRepost: true
        });

        if (existingRepost) {
            return res.status(400).json({ message: 'You have already reposted this post' });
        }

        const repost = new Post({
            content: originalPost.content,
            category: originalPost.category,
            author: req.user._id,
            originalPost: originalPost._id,
            isRepost: true,
            hashtags: originalPost.hashtags,
            mediaUrls: originalPost.mediaUrls
        });

        await repost.save();
        originalPost.reposts.push(req.user._id);
        await originalPost.save();

        const populatedRepost = await repost.populate([
            { path: 'author', select: 'username profilePicture' },
            { path: 'originalPost', populate: { path: 'author', select: 'username profilePicture' }}
        ]);

        // Notify original post author of repost
        req.io.to(`user:${originalPost.author}`).emit('repost', {
            post: originalPost._id,
            repostedBy: req.user._id
        });

        // Emit repost to followers
        const user = await User.findById(req.user._id);
        if (user.followers && user.followers.length > 0) {
            user.followers.forEach(followerId => {
                req.io.to(`user:${followerId}`).emit('newPost', populatedRepost);
            });
        }

        res.status(201).json(populatedRepost);
    } catch (error) {
        console.error('Error reposting:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get timeline posts (posts from followed users and self)
router.get('/timeline', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const following = user.following || [];
        
        const posts = await Post.find({
            $or: [
                { author: { $in: [...following, req.user._id] } },
                { 'reposts.user': { $in: [...following, req.user._id] } }
            ]
        })
        .populate('author', 'username profilePicture')
        .populate({
            path: 'originalPost',
            populate: { path: 'author', select: 'username profilePicture' }
        })
        .sort({ createdAt: -1 })
        .limit(20);

        res.json(posts);
    } catch (error) {
        console.error('Error getting timeline:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search posts by hashtag
router.get('/hashtag/:tag', protect, async (req, res) => {
    try {
        const posts = await Post.find({ hashtags: req.params.tag })
            .populate('author', 'username profilePicture')
            .populate({
                path: 'originalPost',
                populate: { path: 'author', select: 'username profilePicture' }
            })
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Error searching by hashtag:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

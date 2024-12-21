const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { rateLimiters } = require('../middleware/rateLimit');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

// Create a comment
router.post('/:postId', protect, rateLimiters.api, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        const { content, parentCommentId } = req.body;

        const commentData = {
            author: req.user._id,
            post: req.params.postId,
            content,
            mentions: extractMentions(content)
        };

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Parent comment not found'
                });
            }
            commentData.parentComment = parentCommentId;
        }

        const comment = await Comment.create(commentData);
        
        // Update post with new comment
        post.comments.push(comment._id);
        await post.save();

        // If this is a reply, update parent comment
        if (parentCommentId) {
            await Comment.findByIdAndUpdate(parentCommentId, {
                $push: { replies: comment._id }
            });
        }

        // Notify mentioned users
        if (comment.mentions.length > 0) {
            await notifyMentionedUsers(comment);
        }

        // Notify post author
        if (post.author.toString() !== req.user._id.toString()) {
            await User.findByIdAndUpdate(post.author, {
                $push: {
                    notifications: {
                        type: 'comment',
                        sender: req.user._id,
                        content: `${req.user.displayName} commented on your post`,
                        relatedItem: post._id,
                        itemModel: 'Post'
                    }
                }
            });
        }

        await comment.populate([
            { path: 'author', select: 'displayName username avatar' },
            { path: 'mentions', select: 'displayName username' }
        ]);

        res.status(201).json({
            status: 'success',
            data: { comment }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error creating comment'
        });
    }
});

// Get comments for a post
router.get('/post/:postId', rateLimiters.api, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({
            post: req.params.postId,
            parentComment: null // Only get top-level comments
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'displayName username avatar')
            .populate({
                path: 'replies',
                populate: {
                    path: 'author',
                    select: 'displayName username avatar'
                }
            });

        const total = await Comment.countDocuments({
            post: req.params.postId,
            parentComment: null
        });

        res.json({
            status: 'success',
            data: {
                comments,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching comments'
        });
    }
});

// Update a comment
router.patch('/:commentId', protect, rateLimiters.api, async (req, res) => {
    try {
        const comment = await Comment.findOne({
            _id: req.params.commentId,
            author: req.user._id
        });

        if (!comment) {
            return res.status(404).json({
                status: 'error',
                message: 'Comment not found or unauthorized'
            });
        }

        comment.content = req.body.content;
        comment.mentions = extractMentions(req.body.content);
        comment.edited = true;

        await comment.save();

        await comment.populate('author', 'displayName username avatar');

        res.json({
            status: 'success',
            data: { comment }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error updating comment'
        });
    }
});

// Delete a comment
router.delete('/:commentId', protect, rateLimiters.api, async (req, res) => {
    try {
        const comment = await Comment.findOne({
            _id: req.params.commentId,
            author: req.user._id
        });

        if (!comment) {
            return res.status(404).json({
                status: 'error',
                message: 'Comment not found or unauthorized'
            });
        }

        // Remove comment from post
        await Post.findByIdAndUpdate(comment.post, {
            $pull: { comments: comment._id }
        });

        // If this is a reply, remove it from parent comment
        if (comment.parentComment) {
            await Comment.findByIdAndUpdate(comment.parentComment, {
                $pull: { replies: comment._id }
            });
        }

        // Delete all replies if this is a parent comment
        if (comment.replies.length > 0) {
            await Comment.deleteMany({
                _id: { $in: comment.replies }
            });
        }

        await comment.remove();

        res.json({
            status: 'success',
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error deleting comment'
        });
    }
});

module.exports = router;
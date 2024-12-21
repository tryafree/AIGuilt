// Like/Unlike a comment
router.post('/:commentId/like', protect, rateLimiters.api, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ status: 'error', message: 'Comment not found' });
        }

        const hasLiked = comment.likes.includes(req.user._id);
        if (hasLiked) {
            comment.likes = comment.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            comment.likes.push(req.user._id);
        }

        await comment.save();

        // Emit real-time update
        getIO().to(`post:${comment.post}`).emit('commentLikeUpdate', {
            commentId: comment._id,
            likes: comment.likes.length,
            hasLiked: !hasLiked
        });

        res.json({
            status: 'success',
            data: { likes: comment.likes.length, hasLiked: !hasLiked }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error updating like' });
    }
});

// Report a comment
router.post('/:commentId/report', protect, rateLimiters.api, async (req, res) => {
    try {
        const { reason, description } = req.body;
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ status: 'error', message: 'Comment not found' });
        }

        const existingReport = comment.reports.find(
            report => report.reporter.toString() === req.user._id.toString()
        );

        if (existingReport) {
            return res.status(400).json({ status: 'error', message: 'Already reported' });
        }

        comment.reports.push({
            reporter: req.user._id,
            reason,
            description
        });

        // Auto-flag if multiple reports
        if (comment.reports.length >= 3) {
            comment.moderationStatus = 'flagged';
        }

        await comment.save();

        // Notify moderators
        getIO().to('moderators').emit('newReport', {
            commentId: comment._id,
            postId: comment.post,
            reportCount: comment.reports.length
        });

        res.json({
            status: 'success',
            message: 'Comment reported successfully'
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error reporting comment' });
    }
});

// Moderate a comment (admin/moderator only)
router.patch('/:commentId/moderate', protect, async (req, res) => {
    try {
        if (!['admin', 'moderator'].includes(req.user.role)) {
            return res.status(403).json({ status: 'error', message: 'Unauthorized' });
        }

        const { status, reason } = req.body;
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ status: 'error', message: 'Comment not found' });
        }

        comment.moderationStatus = status;
        comment.moderationReason = reason;
        comment.moderatedBy = req.user._id;
        comment.moderatedAt = new Date();

        await comment.save();

        // Notify comment author
        getIO().to(`user:${comment.author}`).emit('commentModerated', {
            commentId: comment._id,
            status,
            reason
        });

        res.json({
            status: 'success',
            data: { comment }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error moderating comment' });
    }
});
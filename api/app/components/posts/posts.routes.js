const express = require('express');
const router = express.Router();
const { newPostValidators, newReplyValidators } = require('../../utils/validations');
const handleValidationError = require('../../helpers/handleValidationError');
const PostsController = require('./posts.controller');

router
.route('/posts')
.get(PostsController.getHomePosts) //Get posts feed.
.post(newPostValidators, handleValidationError, PostsController.submitPost); //Submit a post.

router.route('/posts/:post_id')
.get(PostsController.getPost) //Get a single post.
.delete(PostsController.deletePost) //Delete post.

//Get post replies
router.route('/posts/:post_id/replies')
.get(PostsController.getPostReplies)
.post(newReplyValidators, handleValidationError, PostsController.submitReply)
.delete(PostsController.deleteReply);

router
.route('/posts/:post_id/likes')
.get(PostsController.getLikingAccounts) //Get liking accounts.
.post(PostsController.likePost) //Create a like on a post.
.delete(PostsController.unlikePost); //Delete a like on a post.

router
.route('/posts/:post_id/reposts')
.get(PostsController.getRepostingAccounts) //Get reposting accounts.
.post(PostsController.repostPost) //Create a repost.
.delete(PostsController.deleteRepost);

module.exports = router;
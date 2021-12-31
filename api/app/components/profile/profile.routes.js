const express = require('express');
const router = express.Router();
const ProfileController = require('./profile.controller');
const PostsController = require('../posts/posts.controller');

router
.route('/profile/:username')
.get(ProfileController.getUserProfile) //Get user profile
.put(ProfileController.updateProfile); //Update user profile

//Get followers
router.get('/profile/:username/followers', ProfileController.getFollowers);

//Get following
router.get('/profile/:username/following', ProfileController.getFollowing);


router
.route('/profile/:username/follow')
.post(ProfileController.followUser) //Follow an user
.delete(ProfileController.unfollowUser); //Delete a follow on a user

router.get('/profile/:username/posts', PostsController.getUserPosts);

module.exports = router;
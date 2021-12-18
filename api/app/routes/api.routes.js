const express = require('express');
const PostsController = require('../controllers/posts.controller');
const ProfileController = require('../controllers/profile.controller');
const handleValidationError = require('../helpers/handleValidationError');
const { newPostValidators, newReplyValidators } = require('../utils/validations');
const router = express.Router();

router.get('/userdata', (req, res) => res.status(200).json({data: req.user}));

router
.route('/profile/:username')
.get(ProfileController.getUserProfile) //Obtener perfil de un usuario
.put(ProfileController.updateProfile); //Actualizar perfil

//Obtener seguidores
router.get('/profile/:username/followers', ProfileController.getFollowers);

//Obtener usuarios que sigue un usuario.
router.get('/profile/:username/following', ProfileController.getFollowing);


router
.route('/profile/:username/follow')
.post(ProfileController.followUser) //Seguir a un usuario
.delete(ProfileController.unfollowUser); //Dejar de seguir a un usuario.

router.get('/profile/:username/posts', PostsController.getUserPosts);


router
.route('/posts')
.get(PostsController.getHomePosts) //Obtener feed de posts.
.post(newPostValidators, handleValidationError, PostsController.submitPost); //Subir post

router.route('/posts/:post_id')
.get(PostsController.getPost) //Obtener un post específico.
.delete(PostsController.deletePost) //Delete post.

//Obtener las respuestas de un post.
router.route('/posts/:post_id/replies')
.get(PostsController.getPostReplies)
.post(newReplyValidators, handleValidationError, PostsController.submitReply)
.delete(PostsController.deleteReply);

router
.route('/posts/:post_id/likes')
.get(PostsController.getLikingAccounts) //Obtener cuentas que dieron like a un post.
.post(PostsController.likePost) //Dar me gusta a un post.
.delete(PostsController.unlikePost); //Quitar me gusta a un post.

router
.route('/posts/:post_id/reposts')
.get(PostsController.getRepostingAccounts) //Obtener cuentas que hicieron repost a un post.
.post(PostsController.repostPost) //Dar repost a un post.
.delete(PostsController.deleteRepost);

router.get('/ping', (req, res) => {
    res.json({data: {message: 'pong!'}});
});

module.exports = router;
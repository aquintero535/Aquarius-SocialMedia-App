const express = require('express');
const { getHomePosts, getUserPosts, submitPost, getPost, deletePost, getPostReplies, likePost, unlikePost, deleteRepost, repostPost, submitReply, deleteReply, getLikingAccounts, getRepostingAccounts } = require('../controllers/PostsController');
const { getUserProfile, updateProfile, getFollowers, getFollowing, followUser, unfollowUser } = require('../controllers/ProfileController');
const { newPostValidators, newReplyValidators } = require('../utils/validations');
const router = express.Router();

router.get('/userdata', (req, res) => res.status(200).json({data: req.user}));

router
.route('/profile/:username')
.get(getUserProfile) //Obtener perfil de un usuario
.put(updateProfile); //Actualizar perfil

//Obtener seguidores
router.get('/profile/:username/followers', getFollowers);

//Obtener usuarios que sigue un usuario.
router.get('/profile/:username/following', getFollowing);


router
.route('/profile/:username/follow')
.post(followUser) //Seguir a un usuario
.delete(unfollowUser); //Dejar de seguir a un usuario.

router.get('/profile/:username/posts', getUserPosts);


router
.route('/posts')
.get(getHomePosts) //Obtener feed de posts.
.post(newPostValidators, submitPost); //Subir post

router.route('/posts/:post_id')
.get(getPost) //Obtener un post específico.
.delete(deletePost) //Delete post.

//Obtener las respuestas de un post.
router.route('/posts/:post_id/replies')
.get(getPostReplies)
.post(newReplyValidators, submitReply)
.delete(deleteReply);

router
.route('/posts/:post_id/likes')
.get(getLikingAccounts) //Obtener cuentas que dieron like a un post.
.post(likePost) //Dar me gusta a un post.
.delete(unlikePost); //Quitar me gusta a un post.

router
.route('/posts/:post_id/reposts')
.get(getRepostingAccounts) //Obtener cuentas que hicieron repost a un post.
.post(repostPost) //Dar repost a un post.
.delete(deleteRepost);

router.get('/ping', (req, res) => {
    res.json({data: {message: 'pong!'}});
});

module.exports = router;
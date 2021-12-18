const { validationResult } = require('express-validator');
const { deleteAtFromUsername } = require('../utils/fixUsername');
const logger = require('../helpers/logger').logger.child({module: 'PostsController'});

const PostsService = require('../services/posts.service');
const FeedService = require('../services/feed.service');
const ProfileService = require('../services/profile.service');

const getHomePosts = async (req, res, next) => {
    try {
        const posts = await FeedService.getHomeFeed(req.user.user_id);
        return res.status(200).json({data: posts});
    } catch (error) {
        logger.error(error, 'Get home posts failed.');
        next(error);
    }
}

const getUserPosts = async (req, res, next) => {
    if (req.params.username) {
        let username = deleteAtFromUsername(req.params.username);
        try {
            let posts = await FeedService.getUserFeed(req.user.user_id, username);
            return res.status(200).json({data: posts});      
        } catch (error) {
            logger.error(error, 'Get user posts failed.');
            next(error);  
        }
    } else {
        return res.status(400).json({error: {message: 'Username is required.'}});
    }
}   

const submitPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(401).json({error: {message: 'Los datos introducidos no son válidos.'}});
    }
    try {
        const post = await PostsService.submit(req.user.user_id, req.body.post_body);
        res.status(200).json({success: true, data: post});
    } catch (error) {
        logger.error(error, 'Unexpected error when submitting post.');
        next(error);
    }
}

const submitReply = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(401).json({error: {message: 'Los datos introducidos no son válidos.'}});
    }
    try {
        const post = await PostsService.submitReply(req.user.user_id, req.body.post_body, req.params.post_id);
        res.status(200).json({success: true, data: post});
    } catch (error) {
        logger.error(error, 'Unexpected error when replying post.');
        res.status(500).json({error: {message: 'Unexpected error.'}});
    }
};

const deleteReply = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(401).json({error: {message: 'Los datos introducidos no son válidos.'}});
    }
    try {   
        await PostsService.deleteReply(req.body.post_id, req.params.post_id);
        res.status(200).json({success: true, data: {message: 'Your post has been deleted.'}});
    } catch (error) {
        logger.error(error, 'Unexpected error when deleting post reply.');
        next(error);
    }
}

const getPost = async (req, res, next) => {
    if (req.params.post_id) {
        try {
            const post = await PostsService.getPost(req.user.user_id, req.params.post_id);
            return res.status(200).json({data: post});
        } catch (error) {
            logger.error(error, 'Unexpected error when querying post.');
            next(error);
        }
    } else {
        return res.status(401).json({error: {message: 'Post ID is required'}});
    }
}

const deletePost = async (req, res, next) => {
    try {
        await PostsService.deletePost(req.params.post_id, req.user.user_id);
        res.status(200).json({success: true, data: {message: 'Post deleted.'}});
    } catch (error) {
        logger.error(error, 'Unexpected error when deleting post.');
        next(error);
    }
}

const getPostReplies = async (req, res, next) => {
    if (req.params.post_id) {
        try {
            const replies = await PostsService.getPostReplies(req.params.post_id, req.user.user_id);
            return res.status(200).json({data: replies});
        } catch (error) {
            logger.error(error, 'Unexpected error when querying replies from post.');
            next(error);
        }
    } else {
        return res.status(401).json({error: {message: 'Post ID is required'}});
    }
}

const getLikingAccounts = async (req, res, next) => {
    if (req.params.post_id){
        try {
            const accounts = await ProfileService.getLikingAccounts(req.params.post_id);
            res.status(200).json({data: accounts});
        } catch (error) {
            logger.error(error, 'Unexpected error when querying liking accounts.');
            next(error);
        }
    } else {
        return res.status(401).json({error: {message: 'Post ID is required'}});
    }
};

const likePost = async (req, res, next) => {
    if (req.params.post_id) {
        try {
            await PostsService.likePost(req.params.post_id, req.user.user_id);
            return res.status(200).json({data: {liked: true}});
        } catch (error) {
            logger.error(error, 'Unexpected error when liking post');
            next(error); 
        }
    } else {
        return res.status(401).json({error: {message: 'Post ID is required'}});
    }
}

const unlikePost = async (req, res, next) => {
    if (req.params.post_id) {
        try {
            await PostsService.unlikePost(req.params.post_id, req.user.user_id);
            return res.status(200).json({data: {liked: false}});
        } catch (error) {
            logger.error(error, 'Unexpected error when unliking post');
            next(error); 
        }
    } else {
        return res.status(401).json({error: {message: 'Post ID is required'}});
    }
}

const repostPost = async (req, res, next) => {
    if (req.params.post_id) {
        try {
            await PostsService.createRepost(req.params.post_id, req.user.user_id);
            return res.status(200).json({data: {reposted: true}});
        } catch (error) {
            logger.error(error, 'Unexpected error when creating repost');
            next(error); 
        }
    } else {
        return res.status(401).json({error: {message: 'Post ID is required'}});
    }
}

const deleteRepost = async (req, res, next) => {
    if (req.params.post_id) {
        try {
            await PostsService.deleteRepost(req.params.post_id, req.user.user_id);
            return res.status(200).json({data: {reposted: false}});
        } catch (error) {
            logger.error(error, 'Unexpected error when deleting repost');
            next(error); 
        }
    } else {
        return res.status(401).json({error: {message: 'Post ID is required'}});
    }
}

const getRepostingAccounts = async (req, res, next) => {
    if (req.params.post_id) {
        try {
            const accounts = await ProfileService.getRepostingAccounts(req.params.post_id);
            return res.status(200).json({data: accounts});
        } catch (error) {
            logger.error(error, 'Unexpected error when querying reposting accounts.');
            next(error);    
        }
    } else {
        return res.status(401).json({error: {message: 'Post ID is required'}});
    }
};

module.exports = {
    getHomePosts,
    getUserPosts,
    submitPost,
    submitReply,
    deleteReply,
    getPost,
    deletePost,
    getPostReplies,
    getLikingAccounts,
    likePost,
    unlikePost,
    repostPost,
    deleteRepost,
    getRepostingAccounts
};
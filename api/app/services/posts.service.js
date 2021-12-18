const logger = require('../helpers/logger').logger.child({module: 'PostsService'});
const Posts = require('../models/post.model');
const { nanoid } = require('nanoid');

const submit = async (userId, postBody) => {
    try {
        const newPostId = nanoid(16);
        await Posts.createPost(userId, postBody, newPostId);
        logger.debug({userId, postBody}, 'Post submitted.');
        logger.debug({userId, postBody}, 'Querying new post...');
        const post = await Posts.getPostFromId(userId, newPostId);
        logger.debug(post, 'Data from submitted post: ');
        return post;
    } catch (error) {
        logger.error(error, 'Unexpected error when submitting post.');
        throw new Error('Unexpected error when submitting post.');
    }
}

const submitReply = async function(userId, postBody, postId) {
    try {
        const newPostId = nanoid(16);
        await Posts.createReply(newPostId, postBody, postId, userId);
        logger.debug({userId, postBody, replied_post_id: postId}, 'Post replied.');
        const post = await Posts.getPostFromId(userId, newPostId);
        logger.debug(post, 'Data from submitted post: ');
        return post;
    } catch (error) {
        logger.error(error, 'Unexpected error when replying post.');
        throw new Error('Unexpected error when replying post.');
    }
};

const deleteReply = async function(postId, post_id_reply_to) {
    try {
        await Posts.deleteReply(postId, post_id_reply_to);
        logger.debug({postId, post_id_reply_to}, 'Reply deleted.');
    } catch (error) {
        logger.error(error, 'Unexpected error when deleting post reply.');
        throw new Error('Unexpected error when deleting post reply.');
    }
}

const getPost = async (userId, postId) => {
    try {
        const post = await Posts.getPostFromId(userId, postId);
        return post;
    } catch (error) {
        logger.error(error, 'Unexpected error when querying post.');
        throw new Error('Unexpected error when querying post.');
    }
}

const deletePost = async (postId, userId) => {
    try {
        await Posts.deletePost(postId, userId);
        logger.debug({postId}, 'Post deleted');
    } catch (error) {
        logger.error(error, 'Unexpected error when deleting post.');
        throw new Error('Unexpected error when deleting post.');
    }
}

const getPostReplies = async (postId, userId) => {
    try {
        const replies = await Posts.getPostReplies(postId, userId);
        return replies;
    } catch (error) {
        logger.error(error, 'Unexpected error when querying replies from post.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    }
}

const likePost = async (postId, userId) => {
    try {
        await Posts.likePost(postId, userId);
        logger.debug({postId, userId}, 'Post liked.');
    } catch (error) {
        logger.error(error, 'Unexpected error when liking post.');
        throw new Error('Unexpected error when liking post.');
    }
}

const unlikePost = async (postId, userId) => {
    try {
        await Posts.unlikePost(postId, userId);
        logger.debug({postId, userId}, 'Post unliked.');
    } catch (error) {
        logger.error(error, 'Unexpected error when unliking post.');
        throw new Error('Unexpected error when unliking post.');
    }
}

const createRepost = async (postId, userId) => {
    try {
        await Posts.createRepost(postId, userId);
        logger.debug({userId, postId}, 'Post reposted.');
    } catch (error) {
        logger.error(error, 'Unexpected error when doing repost.');
        throw new Error('Unexpected error when doing repost.');
    }
}

const deleteRepost = async (postId, userId) => {
    try {
        await Posts.deleteRepost(postId, userId);
        logger.debug({userId, postId}, 'Post reposted.');
    } catch (error) {
        logger.error(error, 'Unexpected error when doing repost.');
        throw new Error('Unexpected error when doing repost.');
    }
}

module.exports = {
    submit,
    submitReply,
    deleteReply,
    getPost,
    deletePost,
    getPostReplies,
    likePost,
    unlikePost,
    createRepost,
    deleteRepost,
}
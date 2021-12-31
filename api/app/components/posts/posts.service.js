const db = require('../../database/db-connection');
const logger = require('../../helpers/logger').logger.child({module: 'PostsService'});
const Posts = require('./post.model');
const { nanoid } = require('nanoid');
const { NotFoundError } = require('../../utils/api-errors');

const submit = async (userId, postBody) => {
    const newPostId = nanoid(16);
    let conn = await db.pool.getConnection();
    await Posts.createPost(userId, postBody, newPostId, conn);
    logger.debug({userId, postBody}, 'Post submitted.');
    logger.debug({userId, postBody}, 'Querying new post...');
    const post = await Posts.getPostFromId(userId, newPostId, conn);
    conn.release();
    logger.debug(post, 'Data from submitted post: ');
    return post;
}

const submitReply = async function(userId, postBody, postId) {
    const newPostId = nanoid(16);
    await Posts.createReply(newPostId, postBody, postId, userId);
    logger.debug({userId, postBody, replied_post_id: postId}, 'Post replied.');
    const post = await Posts.getPostFromId(userId, newPostId);
    logger.debug(post, 'Data from submitted post: ');
    return post;
};

const deleteReply = async function(postId, post_id_reply_to) {
    await Posts.deleteReply(postId, post_id_reply_to);
    logger.debug({postId, post_id_reply_to}, 'Reply deleted.');
}

const getPost = async (userId, postId) => {
    const post = await Posts.getPostFromId(userId, postId);
    if (!post) {
        throw new NotFoundError("This post doesn't exist.");
    }
    return post;
}

const deletePost = async (postId, userId) => {
    await Posts.deletePost(postId, userId);
    logger.debug({postId}, 'Post deleted');
}

const getPostReplies = async (postId, userId) => {
    const replies = await Posts.getPostReplies(postId, userId);
    return replies;
}

const likePost = async (postId, userId) => {
    await Posts.likePost(postId, userId);
    logger.debug({postId, userId}, 'Post liked.');
}

const unlikePost = async (postId, userId) => {
    await Posts.unlikePost(postId, userId);
    logger.debug({postId, userId}, 'Post unliked.');
}

const createRepost = async (postId, userId) => {
    await Posts.createRepost(postId, userId);
    logger.debug({userId, postId}, 'Post reposted.');
}

const deleteRepost = async (postId, userId) => {
    await Posts.deleteRepost(postId, userId);
    logger.debug({userId, postId}, 'Post reposted.');
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
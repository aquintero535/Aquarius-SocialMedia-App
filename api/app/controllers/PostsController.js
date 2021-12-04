const { validationResult } = require('express-validator');
const db = require('../database/db-connection');
const { deleteAtFromUsername } = require('../utils/fixUsername');
const { logger } = require('../helpers/logger');
const moduleLogger = logger.child({module: 'PostsController'});
const { nanoid } = require('nanoid');

const getHomePosts = async function(req, res){
    let conn = null;
    try {
        conn = await db.getConnection();
        moduleLogger.debug('Querying posts...');
        let [myPosts] = await conn.query(`
            SELECT p.post_id, p.body, p.likes, p.reposts,
                p.reply_to, p.replies, up.profile_image, up.profile_name, up.username,
                p.created_at, up_parent.username as 'replying_to',
                EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = p.profile_id) as 'already_reposted',
                EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = p.profile_id) as 'already_liked'
                FROM posts as p
                INNER JOIN users_profiles as up ON p.profile_id = up.profile_id
                LEFT OUTER JOIN users_profiles AS up_parent ON up_parent.profile_id in (select profile_id from posts where post_id = p.reply_to)
                WHERE p.profile_id = ?;
            `, [req.user.user_id]);
        moduleLogger.debug('Querying posts from following accounts...');
        let [postsFromFollowing] = await conn.query(`
            SELECT p.post_id, p.body, p.likes, p.reposts,
                p.reply_to, p.replies, up.profile_image, up.profile_name, up.username,
                p.created_at, up_parent.username as 'replying_to',
                EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = uf.profile_id_one) as 'already_reposted',
                EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = uf.profile_id_one) as 'already_liked'
                FROM posts as p
                INNER JOIN users_profiles as up ON p.profile_id = up.profile_id
                LEFT OUTER JOIN users_profiles AS up_parent ON up_parent.profile_id in (select profile_id from posts where post_id = p.reply_to)
                LEFT OUTER JOIN users_follows as uf ON uf.profile_id_two = up.profile_id
                WHERE uf.profile_id_one = ?;
        `, [req.user.user_id]);
        moduleLogger.debug('Querying reposts from following accounts...');
        let [repostsFromFollowing] = await conn.query(`
            SELECT p.post_id, p.body, p.likes, p.reposts,
            p.reply_to, p.replies, up.profile_image, up.profile_name, up.username,
            up_reposted.username as 'reposted_by', p.created_at,
            rp.created_at as 'repost_created_at', up_parent.username as 'replying_to',
            EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = uf.profile_id_one) as 'already_reposted',
            EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = uf.profile_id_one) as 'already_liked'
                FROM posts as p
                INNER JOIN users_profiles as up ON p.profile_id = up.profile_id
                LEFT OUTER JOIN users_profiles AS up_parent ON up_parent.profile_id in (select profile_id from posts where post_id = p.reply_to)
                INNER JOIN reposts as rp ON rp.post_id = p.post_id
                LEFT OUTER JOIN users_profiles AS up_reposted ON up_reposted.profile_id = rp.profile_id
                INNER JOIN users_follows as uf ON uf.profile_id_two = rp.profile_id
                WHERE p.post_id in (select post_id from reposts where profile_id in (select profile_id_two from users_follows where profile_id_one = ?))
                    AND uf.profile_id_one = ?;
        `, [req.user.user_id, req.user.user_id]);
        let postsFeed = [...myPosts, ...postsFromFollowing, ...repostsFromFollowing];
        postsFeed.sort(sortPostsAndReposts);
        moduleLogger.debug({postsFeed}, 'Posts from feed: ');
        res.status(200).json({data: postsFeed})
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when querying posts from feed.');
        res.status(500).json({error: {message: 'Unexpected error.'}});
    } finally {
        conn?.release();
    }
}

const getUserPosts = async function(req, res) {
    let conn = null;
    try {
        if (req.params.username){
            let username = deleteAtFromUsername(req.params.username);
            moduleLogger.debug(`Querying posts from username: ${username}`);
            conn = await db.getConnection();
            let [postsFromUser] = await conn.query(`
                SELECT p.post_id, p.body, p.likes,
                p.reposts, p.replies, p.reply_to, up.profile_image, up.profile_name, up.username,
                p.created_at, up_parent.username as 'replying_to',
                EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = ?) as 'already_reposted',
                EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = ?) as 'already_liked'
                FROM posts AS p
                INNER JOIN users_profiles AS up ON p.profile_id = up.profile_id
                LEFT OUTER JOIN users_profiles AS up_parent ON up_parent.profile_id in (select profile_id from posts where post_id = p.reply_to)
                WHERE up.username = ?
            `, [req.user.user_id, req.user.user_id, username]);
            moduleLogger.debug(`Querying reposts from username: ${username}`);
            let [repostsFromUser] = await conn.query(`
                SELECT p.post_id, p.body, p.likes,
                p.reposts, p.replies, p.reply_to, up.profile_image, up.profile_name, up.username,
                up_reposted.username as 'reposted_by', p.created_at, up_parent.username as 'replying_to',
                EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = ?) as 'already_reposted',
                EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = ?) as 'already_liked'
                FROM posts AS p
                INNER JOIN users_profiles AS up ON p.profile_id = up.profile_id
                LEFT OUTER JOIN users_profiles AS up_parent ON up_parent.profile_id in (select profile_id from posts where post_id = p.reply_to)
                LEFT OUTER JOIN reposts as rp ON rp.post_id = p.post_id
                LEFT OUTER JOIN users_profiles AS up_reposted ON up_reposted.profile_id = rp.profile_id
                WHERE p.post_id in (SELECT post_id from reposts where profile_id in (select profile_id from users_profiles where username = ?))
                    AND rp.profile_id in (select profile_id from users_profiles where username = ?)
            `, [req.user.user_id, req.user.user_id, username, username]);
            let userPosts = [...postsFromUser, ...repostsFromUser];
            userPosts.sort(sortPostsAndReposts);
            moduleLogger.debug({userPosts}, `Posts from ${username}`);
            res.status(200).json({data: userPosts});
        } else {
            throw new Error('Username is required.')
        }
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when querying posts from user.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    } finally {
        conn?.release();
    }
}

const submitPost = async function(req, res){
    let conn = null;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) throw errors;
        let newPostId = nanoid(16);
        conn = await db.getConnection();
        let [result] = await conn.query('INSERT INTO posts (post_id, profile_id, body) VALUES (?, ?, ?);'
        , [newPostId, req.user.user_id, req.body.post_body]);
        moduleLogger.debug({user_id: req.user.user_id, post_body: req.body.post_body, query_response: result}, 'Post submitted.');
        let [post] = await db.query(`
                SELECT p.post_id, p.body, p.created_at, p.likes,
                p.reposts, p.replies, p.reply_to, up.profile_image, up.profile_name, up.username,
                up_parent.username as 'replying_to',
                EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = ?) as 'already_reposted',
                EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = ?) as 'already_liked'
                FROM posts as p
                INNER JOIN users_profiles as up ON p.profile_id = up.profile_id
                LEFT OUTER JOIN users_profiles as up_parent ON up_parent.profile_id in (select profile_id from posts where post_id = p.reply_to)
                WHERE p.post_id = ?;
            `, [req.user.user_id, req.user.user_id, newPostId]);
        moduleLogger.debug({post}, 'Data from submitted post: ');
        res.status(200).json({success: true, data: post[0]});
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when submitting post.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    } finally {
        conn?.release();
    }
}

const submitReply = async function(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) throw errors;
        let newPostId = nanoid(16);
        let arguments = [newPostId, req.user.user_id, req.body.post_body, req.params.post_id];
        let [result] = await db.query('CALL newReply(?, ?, ?, ?)', arguments);
        moduleLogger.debug({user_id: req.user.user_id, post_body: req.body.post_body, replied_post_id: req.params.post_id, query_response: result}, 'Post replied.');
        let [post] = await db.query(`
                SELECT p.post_id, p.body, p.created_at, p.likes,
                p.reposts, p.replies, p.reply_to, up.profile_image, up.profile_name, up.username,
                up_parent.username as 'replying_to',
                EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = ?) as 'already_reposted',
                EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = ?) as 'already_liked'
                FROM posts as p
                INNER JOIN users_profiles as up ON p.profile_id = up.profile_id
                LEFT OUTER JOIN users_profiles as up_parent ON up_parent.profile_id in (select profile_id from posts where post_id = p.reply_to)
                WHERE p.post_id = ?;
            `, [req.user.user_id, req.user.user_id, newPostId]);
        res.status(200).json({success: true, data: post[0]});
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when replying post.');
        res.status(500).json({error: {message: 'Unexpected error.'}});
    }
};

const deleteReply = async function(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) throw errors;
        let arguments = [req.body.post_id, req.params.post_id];
        await db.query('CALL deleteReply(?, ?)', arguments);
        moduleLogger.debug({post_id: req.body.post_id, reply_to: req.params.post_id}, 'Reply deleted.');
        res.status(200).json({success: true, data: {message: 'Your post has been deleted.'}});
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when deleting post reply.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    }
}

const getPost = async function(req, res){
    try {
        if (req.params.post_id){
            let [post] = await db.query(`
                SELECT p.post_id, p.body, p.created_at, p.likes,
                p.reposts, p.replies, p.reply_to, up.profile_image, up.profile_name, up.username,
                up_parent.username as 'replying_to',
                EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = ?) as 'already_reposted',
                EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = ?) as 'already_liked'
                FROM posts as p
                INNER JOIN users_profiles as up ON p.profile_id = up.profile_id
                LEFT OUTER JOIN users_profiles as up_parent ON up_parent.profile_id in (select profile_id from posts where post_id = p.reply_to)
                WHERE p.post_id = ?;
            `, [req.user.user_id, req.user.user_id, req.params.post_id]);
            moduleLogger.debug({post}, 'Post obtained.');
            res.status(200).json({data: post[0]});
        } else {
            throw new Error('Post ID is required.');
        }
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when querying post.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    }
}

const deletePost = async function(req, res) {
    try {
        let [result] = await db.query(`
            DELETE FROM posts WHERE post_id = ? AND profile_id = ?;
        `, [req.params.post_id, req.user.user_id]);
        moduleLogger.debug({result}, 'Post deleted.');
        res.status(200).json({success: true, data: {message: 'Post deleted.'}});
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when deleting post.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    }
}

const getPostReplies = async function(req, res){
    try {
        if (req.params.post_id){
            let [replies] = await db.query(`
                SELECT p.post_id, p.body, p.profile_id, p.created_at, p.likes,
                p.reposts, p.replies, p.reply_to, up.profile_image, up.profile_name, up.username,
                EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = ?) as 'already_reposted',
                EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = ?) as 'already_liked'
                    FROM posts as p
                    INNER JOIN users_profiles as up ON p.profile_id = up.profile_id
                    WHERE p.reply_to = ?;
            `, [req.user.user_id, req.user.user_id, req.params.post_id]);
            moduleLogger.debug({replies}, `Replies to post id: ${req.params.post_id}`);
            res.status(200).json({data: replies});
        } else {
            throw new Error('Post ID is required.');
        }
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when querying replies from post.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    }
}

const getLikingAccounts = async function(req, res) {
    try {
        if (req.params.post_id){
            let [accounts] = await db.query(`
                SELECT up.profile_id, up.profile_image, up.profile_name,
                up.profile_bio, up.username FROM users_profiles AS up
                INNER JOIN posts_likes AS pl
                ON up.profile_id = pl.profile_id
                WHERE pl.post_id = ?; 
            `, [req.params.post_id]);
            moduleLogger.debug({accounts}, `Accounts who liked post id: ${req.params.post_id}`);
            res.status(200).json({data: [...accounts]});
        }
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when querying liking accounts.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    }
};

const likePost = async function(req, res) {
    try {
        if (req.params.post_id){
            await db.query('INSERT INTO posts_likes (profile_id, post_id) VALUES (?, ?);'
            , [req.user.user_id, req.params.post_id]);
            moduleLogger.debug({user_id: req.user.user_id, post_id: req.params.post_id}, 'Post liked.');
            res.status(200).json({data: {liked: true}});
        } else {
            throw new Error('Post ID is required.');
        }
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when liking post.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    }
}

const unlikePost = async function(req, res) {
    try {
        if (req.params.post_id){
            await db.query('DELETE FROM posts_likes WHERE profile_id = ? AND post_id = ?;'
            , [req.user.user_id, req.params.post_id]);
            moduleLogger.debug({user_id: req.user.user_id, post_id: req.params.post_id}, 'Post unliked.');
            res.status(200).json({data: {liked: false}});
        } else {
            throw new Error('Post ID is required.');
        }
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when unliking post.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    }
}

const repostPost = async function(req, res) {
    try {
        if (req.params.post_id){
            await db.query('INSERT INTO reposts (profile_id, post_id) VALUES (?, ?);'
            , [req.user.user_id, req.params.post_id]);
            moduleLogger.debug({user_id: req.user.user_id, post_id: req.params.post_id}, 'Post reposted.');
            res.status(200).json({data: {reposted: true}});
        } else {
            throw new Error('Post ID is required.');
        }
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when doing repost.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    }
}

const deleteRepost = async function(req, res) {
    try {
        if (req.params.post_id){
            await db.query('DELETE FROM reposts WHERE profile_id = ? AND post_id = ?;'
            , [req.user.user_id, req.params.post_id]);
            moduleLogger.debug({user_id: req.user.user_id, post_id: req.params.post_id}, 'Post unreposted.');
            res.status(200).json({data: {reposted: false}});
        } else {
            throw new Error('Post ID is required.');
        }
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when deleting repost.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    }
}

const getRepostingAccounts = async function(req, res) {
    try {
        if (req.params.post_id){
            let [accounts] = await db.query(`
                SELECT up.profile_id, up.profile_image, up.profile_name,
                up.profile_bio, up.username FROM users_profiles AS up
                INNER JOIN reposts as rp
                    ON rp.profile_id = up.profile_id
                WHERE rp.post_id = ?;
            `, [req.params.post_id]);
            moduleLogger.debug({accounts}, `Accounts who reposted post id: ${req.params.post_id}`);
            res.status(200).json({data: [...accounts]});
        }
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when queryning reposting accounts.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    }
};

const sortPostsAndReposts = function (post1, post2) {
    if (post1.repost_created_at || post2.repost_created_at){
        if (post1.repost_created_at > post2.created_at || post1.created_at > post2.repost_created_at || post1.repost_created_at > post2.repost_created_at)
        return -1;
        else if (post1.repost_created_at < post2.created_at || post1.created_at < post2.repost_created_at || post1.repost_created_at < post2.repost_created_at)
        return 1;
        else return 0;
    } else{
        if (post1.created_at === post2.created_at) return 0;
        return (post1.created_at > post2.created_at) ? -1 : 1;
    } 
}

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
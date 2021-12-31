const db = require('../../database/db-connection');
const { sortPostsByDate } = require('../../utils/post-sorting');
const logger = require('../../helpers/logger').logger.child({module: 'FeedService'});

const Posts = require('../posts/post.model');

const getHomeFeed = async (userId) => {
    let conn = await db.pool.getConnection();
    logger.debug('Querying posts...');
    const myPosts = await Posts.getPostsFromMine(userId, conn);
    logger.debug('Querying posts from following accounts...');
    const postsFromFollowing = await Posts.getPostsFromFollowing(userId, conn);
    logger.debug('Querying reposts from following accounts...');
    const repostsFromFollowing = await Posts.getRepostsFromFollowing(userId, conn);
    conn.release();
    let feed = [...myPosts, ...postsFromFollowing, ...repostsFromFollowing];
    feed.sort(sortPostsByDate);
    logger.debug({feed}, 'Posts from feed: ');
    return feed;
}

const getUserFeed = async (userId, username) => {
    let conn = await db.pool.getConnection();
    logger.debug(`Querying posts from username: ${username}`);
    const userPosts = await Posts.getPostsFromUser(userId, username, conn);
    logger.debug(`Querying reposts from username: ${username}`);
    const userReposts = await Posts.getRepostsFromUser(userId, username, conn);
    conn.release();
    let feed = [...userPosts, ...userReposts];
    feed.sort(sortPostsByDate);
    logger.debug({feed}, `Posts from ${username}`);
    return feed;
}

module.exports = {
    getHomeFeed,
    getUserFeed
}
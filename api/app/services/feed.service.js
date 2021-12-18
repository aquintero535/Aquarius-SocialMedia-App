const { sortPostsByDate } = require('../utils/post-sorting');
const logger = require('../helpers/logger').logger.child({module: 'FeedService'});

const Posts = require('../models/post.model');

const getHomeFeed = async (userId) => {
    try {
        logger.debug('Querying posts...');
        const myPosts = await Posts.getPostsFromMine(userId);
        logger.debug('Querying posts from following accounts...');
        const postsFromFollowing = await Posts.getPostsFromFollowing(userId);
        logger.debug('Querying reposts from following accounts...');
        const repostsFromFollowing = await Posts.getRepostsFromFollowing(userId);
        let feed = [...myPosts, ...postsFromFollowing, ...repostsFromFollowing];
        feed.sort(sortPostsByDate);
        logger.debug({feed}, 'Posts from feed: ');
        return feed;
    } catch (error) {
        logger.error(error, 'Unexpected error when getting home feed.');
        throw new Error('Unexpected error when getting home feed.');
    }
}

const getUserFeed = async (userId, username) => {
    try {
        logger.debug(`Querying posts from username: ${username}`);
        const userPosts = await Posts.getPostsFromUser(userId, username);
        logger.debug(`Querying reposts from username: ${username}`);
        const userReposts = await Posts.getRepostsFromUser(userId, username);
        let feed = [...userPosts, ...userReposts];
        feed.sort(sortPostsByDate);
        logger.debug({feed}, `Posts from ${username}`);
        return feed;
    } catch (error) {
        logger.error(error, 'Unexpected error when getting user feed.');
        throw new Error('Unexpected error when getting user feed.');
    }
}

module.exports = {
    getHomeFeed,
    getUserFeed
}
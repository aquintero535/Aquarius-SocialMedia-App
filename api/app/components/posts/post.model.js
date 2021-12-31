const { doQuery } = require('../../database/db-connection');

const createPost = async (userId, postBody, newPostId, conn) => {
    await doQuery('INSERT INTO posts (post_id, profile_id, body) VALUES (?, ?, ?);'
    , [newPostId, userId, postBody], conn);
}

const createReply = async (newPostId, postBody, postId, userId, conn) => {
    const arguments = [newPostId, userId, postBody, postId];
    await doQuery('CALL newReply(?, ?, ?, ?)', arguments, conn);
}

const deleteReply = async (postId, postIdReplyTo, conn) => {
    const arguments = [postId, postIdReplyTo];
    await doQuery('CALL deleteReply(?, ?)', arguments, conn);
}

const getPostFromId = async (userId, postId, conn) => {
    const [post] = await doQuery(`
        SELECT 
        p.post_id,
        p.body,
        p.created_at,
        p.likes,
        p.reposts,
        p.replies,
        p.reply_to,
        up.profile_image,
        up.profile_name,
        up.username,
        up_parent.username as 'replying_to',
        EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = ?) as 'already_reposted',
        EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = ?) as 'already_liked'
        FROM posts as p
        INNER JOIN users_profiles as up ON p.profile_id = up.profile_id
        LEFT OUTER JOIN users_profiles as up_parent ON up_parent.profile_id in (select profile_id from posts where post_id = p.reply_to)
        WHERE p.post_id = ? LIMIT 1;
        `, [userId, userId, postId], conn);
    return post[0];
}

const getPostsFromMine = async (userId, conn) => {
    const [posts] = await doQuery(`
        SELECT 
        p.post_id,
        p.body,
        p.likes,
        p.reposts,
        p.reply_to,
        p.replies,
        up.profile_image,
        up.profile_name,
        up.username,
        p.created_at,
        up_parent.username as 'replying_to',
        EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = p.profile_id) as 'already_reposted',
        EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = p.profile_id) as 'already_liked'
        FROM posts as p
        INNER JOIN users_profiles as up ON p.profile_id = up.profile_id
        LEFT OUTER JOIN users_profiles AS up_parent ON up_parent.profile_id in (select profile_id from posts where post_id = p.reply_to)
        WHERE p.profile_id = ?;
    `, [userId], conn);
    return posts;
}

const getPostsFromFollowing = async (userId, conn) => {
    const [posts] = await doQuery(`
        SELECT p.post_id,
        p.body,
        p.likes,
        p.reposts,
        p.reply_to,
        p.replies,
        up.profile_image,
        up.profile_name,
        up.username,
        p.created_at,
        up_parent.username as 'replying_to',
        EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = uf.profile_id_one) as 'already_reposted',
        EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = uf.profile_id_one) as 'already_liked'
        FROM posts as p
        INNER JOIN users_profiles as up ON p.profile_id = up.profile_id
        LEFT OUTER JOIN users_profiles AS up_parent ON up_parent.profile_id in (select profile_id from posts where post_id = p.reply_to)
        LEFT OUTER JOIN users_follows as uf ON uf.profile_id_two = up.profile_id
        WHERE uf.profile_id_one = ?;
    `, [userId], conn);
    return posts;
}

const getRepostsFromFollowing = async (userId, conn) => {
    const [posts] = await doQuery(`
        SELECT
        p.post_id,
        p.body,
        p.likes,
        p.reposts,
        p.reply_to,
        p.replies,
        up.profile_image,
        up.profile_name,
        up.username,
        up_reposted.username as 'reposted_by',
        p.created_at,
        rp.created_at as 'repost_created_at',
        up_parent.username as 'replying_to',
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
    `, [userId, userId], conn);
    return posts;
}

const getPostsFromUser = async (userId, username, conn) => {
    const [posts] = await doQuery(`
        SELECT 
        p.post_id,
        p.body,
        p.likes,
        p.reposts,
        p.replies,
        p.reply_to,
        up.profile_image,
        up.profile_name,
        up.username,
        p.created_at,
        up_parent.username as 'replying_to',
        EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = ?) as 'already_reposted',
        EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = ?) as 'already_liked'
        FROM posts AS p
        INNER JOIN users_profiles AS up ON p.profile_id = up.profile_id
        LEFT OUTER JOIN users_profiles AS up_parent ON up_parent.profile_id in (select profile_id from posts where post_id = p.reply_to)
        WHERE up.username = ?
    `, [userId, userId, username], conn);
    return posts;
};

const getRepostsFromUser = async (userId, username, conn) => {
    const [posts] = await doQuery(`
        SELECT 
        p.post_id,
        p.body,
        p.likes,
        p.reposts,
        p.replies,
        p.reply_to,
        up.profile_image,
        up.profile_name,
        up.username,
        up_reposted.username as 'reposted_by',
        p.created_at,
        up_parent.username as 'replying_to',
        EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = ?) as 'already_reposted',
        EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = ?) as 'already_liked'
        FROM posts AS p
        INNER JOIN users_profiles AS up ON p.profile_id = up.profile_id
        LEFT OUTER JOIN users_profiles AS up_parent ON up_parent.profile_id in (select profile_id from posts where post_id = p.reply_to)
        LEFT OUTER JOIN reposts as rp ON rp.post_id = p.post_id
        LEFT OUTER JOIN users_profiles AS up_reposted ON up_reposted.profile_id = rp.profile_id
        WHERE p.post_id in (SELECT post_id from reposts where profile_id in (select profile_id from users_profiles where username = ?))
        AND rp.profile_id in (select profile_id from users_profiles where username = ?)
    `, [userId, userId, username, username], conn);
    return posts;
};

const deletePost = async (postId, userId, conn) => {
    await doQuery('DELETE FROM posts WHERE post_id = ? AND profile_id = ?;', [postId, userId], conn);
}

const getPostReplies = async (postId, userId, conn) => {
    const [posts] = await doQuery(`
        SELECT 
        p.post_id,
        p.body,
        p.profile_id,
        p.created_at,
        p.likes,
        p.reposts,
        p.replies,
        p.reply_to,
        up.profile_image,
        up.profile_name,
        up.username,
        EXISTS (select 1 from reposts WHERE reposts.post_id = p.post_id AND reposts.profile_id = ?) as 'already_reposted',
        EXISTS (select 1 from posts_likes WHERE posts_likes.post_id = p.post_id AND posts_likes.profile_id = ?) as 'already_liked'
        FROM posts as p
        INNER JOIN users_profiles as up ON p.profile_id = up.profile_id
        WHERE p.reply_to = ?;
    `, [userId, userId, postId], conn);
    return posts;
}

const likePost = async (postId, userId, conn) => {
    await doQuery('INSERT INTO posts_likes (profile_id, post_id) VALUES (?, ?);', [userId, postId], conn);
}

const unlikePost = async (postId, userId, conn) => {
    await doQuery('DELETE FROM posts_likes WHERE profile_id = ? AND post_id = ?;', [userId, postId], conn);
}

const createRepost = async (postId, userId, conn) => {
    await doQuery('INSERT INTO reposts (profile_id, post_id) VALUES (?, ?);', [userId, postId], conn);
}

const deleteRepost = async (postId, userId, conn) => {
    await doQuery('DELETE FROM reposts WHERE profile_id = ? AND post_id = ?;', [userId, postId], conn);
}

module.exports = {
    createPost,
    createReply,
    deleteReply,
    getPostFromId,
    getPostsFromMine,
    getPostsFromFollowing,
    getRepostsFromFollowing,
    getPostsFromUser,
    getRepostsFromUser,
    getPostReplies,
    deletePost,
    likePost,
    unlikePost,
    createRepost,
    deleteRepost
}
const db = require('../database/db-connection');

const createProfile = async (profileValues) => {
    await db.query('INSERT INTO users_profiles SET ?', [profileValues]);
}

const getUserProfile = async (username, userId) => {
    const [profile] = await db.query(`
        SELECT 
        up.user_id,
        up.profile_id,
        up.profile_header,
        up.profile_image,
        up.profile_name,
        up.profile_bio,
        up.username,
        up.followers,
        up.following,
        EXISTS(select 1 from users_follows where users_follows.profile_id_two = up.profile_id and users_follows.profile_id_one = ?) as 'is_following'
        FROM users_profiles as up
        WHERE username = ?;
    `, [userId, username]);
    return profile[0];
}

const findOneById = async (id) => {
    const [userProfile] = await db.query(`
        SELECT 
        profile_name,
        profile_image,
        username,
        followers,
        following
        FROM users_profiles WHERE user_id = ?;
    `, [id]);
    return userProfile[0];
}

const getLikingAccounts = async (postId) => {
    const [accounts] = await db.query(`
        SELECT 
        up.profile_id,
        up.profile_image,
        up.profile_name,
        up.profile_bio,
        up.username 
        FROM users_profiles AS up
        INNER JOIN posts_likes AS pl
        ON up.profile_id = pl.profile_id
        WHERE pl.post_id = ?; 
    `, [postId]);
    return accounts;
}

const getRepostingAccounts = async (postId) => {
    const [accounts] = await db.query(`
        SELECT
        up.profile_id,
        up.profile_image,
        up.profile_name,
        up.profile_bio,
        up.username FROM users_profiles AS up
        INNER JOIN reposts as rp
        ON rp.profile_id = up.profile_id
        WHERE rp.post_id = ?;
    `, [postId]);
    return accounts;
}

const getFollowers = async (username) => {
    const [followers] = await db.query(`
        SELECT 
        up.profile_id,
        up.profile_image,
        up.profile_name,
        up.profile_bio,
        up.username
        FROM users_profiles AS up
        INNER JOIN users_follows as uf ON uf.profile_id_one = up.profile_id
        WHERE uf.profile_id_two = (select profile_id from users_profiles where username = ?);
    `, [username]);
    return followers;
}

const getFollowing = async (username) => {
    const [following] = await db.query(`
        SELECT 
        up.profile_id,
        up.profile_image,
        up.profile_name,
        up.profile_bio,
        up.username
        FROM users_profiles AS up
        INNER JOIN users_follows as uf ON uf.profile_id_two = up.profile_id
        WHERE uf.profile_id_one = (select profile_id from users_profiles where username = ?);
    `, [username]);
    return following;
}

const update = async (data, userId) => {
    await db.query('UPDATE users_profiles SET ? WHERE profile_id=?;', [data, userId]);
}; 

const addFollow = async (userToFollowId, userId) => {
    await db.query('INSERT INTO users_follows (profile_id_one, profile_id_two) VALUES (?, ?);'
    , [userId, userToFollowId]);
};

const removeFollow = async (userToFollowId, userId) => {
    await db.query('DELETE FROM users_follows where profile_id_one = ? AND profile_id_two = ?;'
    , [userId, userToFollowId]);
};

module.exports = {
    createProfile,
    getUserProfile,
    findOneById,
    getLikingAccounts,
    getRepostingAccounts,
    getFollowers,
    getFollowing,
    update,
    addFollow,
    removeFollow
}
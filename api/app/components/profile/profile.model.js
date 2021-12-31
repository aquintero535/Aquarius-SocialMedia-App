const {doQuery} = require('../../database/db-connection');

const createProfile = async (profileValues, conn) => {
    await doQuery('INSERT INTO users_profiles SET ?', [profileValues], conn);
}

const getUserProfile = async (username, userId, conn) => {
    const [profile] = await doQuery(`
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
    `, [userId, username], conn);
    return profile[0];
}

const findOneById = async (id, conn) => {
    const [userProfile] = await doQuery(`
        SELECT 
        profile_name,
        profile_image,
        username,
        followers,
        following
        FROM users_profiles WHERE user_id = ?;
    `, [id], conn);
    return userProfile[0];
}

const getLikingAccounts = async (postId, conn) => {
    const [accounts] = await doQuery(`
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
    `, [postId], conn);
    return accounts;
}

const getRepostingAccounts = async (postId, conn) => {
    const [accounts] = await doQuery(`
        SELECT
        up.profile_id,
        up.profile_image,
        up.profile_name,
        up.profile_bio,
        up.username FROM users_profiles AS up
        INNER JOIN reposts as rp
        ON rp.profile_id = up.profile_id
        WHERE rp.post_id = ?;
    `, [postId], conn);
    return accounts;
}

const getFollowers = async (username, conn) => {
    const [followers] = await doQuery(`
        SELECT 
        up.profile_id,
        up.profile_image,
        up.profile_name,
        up.profile_bio,
        up.username
        FROM users_profiles AS up
        INNER JOIN users_follows as uf ON uf.profile_id_one = up.profile_id
        WHERE uf.profile_id_two = (select profile_id from users_profiles where username = ?);
    `, [username], conn);
    return followers;
}

const getFollowing = async (username, conn) => {
    const [following] = await doQuery(`
        SELECT 
        up.profile_id,
        up.profile_image,
        up.profile_name,
        up.profile_bio,
        up.username
        FROM users_profiles AS up
        INNER JOIN users_follows as uf ON uf.profile_id_two = up.profile_id
        WHERE uf.profile_id_one = (select profile_id from users_profiles where username = ?);
    `, [username], conn);
    return following;
}

const update = async (data, userId, conn) => {
    await doQuery('UPDATE users_profiles SET ? WHERE profile_id=?;', [data, userId], conn);
}; 

const addFollow = async (userToFollowId, userId, conn) => {
    await doQuery('INSERT INTO users_follows (profile_id_one, profile_id_two) VALUES (?, ?);'
    , [userId, userToFollowId], conn);
};

const removeFollow = async (userToFollowId, userId, conn) => {
    await doQuery('DELETE FROM users_follows where profile_id_one = ? AND profile_id_two = ?;'
    , [userId, userToFollowId], conn);
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
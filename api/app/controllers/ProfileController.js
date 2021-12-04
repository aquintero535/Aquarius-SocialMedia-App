const db = require('../database/db-connection');
const formidable = require('formidable');
const jimp = require('jimp');
const { deleteAtFromUsername } = require('../utils/fixUsername');
const publicDir = `./public`;
const { logger } = require('../helpers/logger');
const moduleLogger = logger.child({module: 'ProfileController'});
const getUserProfile = async function (req, res) {
    let username = deleteAtFromUsername(req.params.username);
    try {
        let [userProfile] = await db.query(`
        SELECT up.user_id, up.profile_id, up.profile_header, up.profile_image,
            up.profile_name, up.profile_bio, up.username, up.followers, up.following,
            EXISTS(select 1 from users_follows where users_follows.profile_id_two = up.profile_id and users_follows.profile_id_one = ?) as 'is_following'
            FROM users_profiles as up
            WHERE username = ?;
        `, [req.user.user_id, username]);
        res.status(200).json({data: userProfile[0]});
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when querying an user profile.');
        res.status(500).json({errors: [{message: 'Unexpected error.'}]});
    }
}

//TODO: When uploading profile headers I get a 413 status code response (request too large).
const updateProfile = (req, res) => {
    let username = deleteAtFromUsername(req.params.username);
    try {
        moduleLogger.debug('Parsing request form...');
        formidable().parse(req, async function(err, fields, files) {
            if (err) throw err;
            if (req.user.user_id != fields.user_id) {
                moduleLogger.error('Cannot update user profile with an user id different from signed in user id.');
                res.status(401).end();
                return;
            }
            let data = {profile_name : fields?.profile_name, profile_bio : fields?.profile_bio};
            moduleLogger.debug({fields, files}, 'Updating user profile.');
            if (files.profile_header) {
                let tempPath = files.profile_header.path;
                let publicPath = `/files/profile_headers/${req.user.user_id}.jpg`; 
                let serverPath = `${publicDir}${publicPath}`;
                moduleLogger.debug({tempPath, publicPath, serverPath}, 'Reading profile header from tempPath...');
                let image = await jimp.read(tempPath);
                moduleLogger.debug('Writing profile header in: ', serverPath);
                await image.resize(791, 400).quality(100).writeAsync(serverPath);
                data.profile_header = publicPath;
            }
            if (files.profile_image) {
                let tempPath = files.profile_image.path;
                let publicPath = `/files/profile_images/${req.user.user_id}.jpg`; 
                let serverPath = `${publicDir}${publicPath}`;
                moduleLogger.debug({tempPath, publicPath, serverPath}, 'Reading profile image from tempPath...');
                let image = await jimp.read(tempPath);
                moduleLogger.debug('Writing profile image in ', serverPath);
                await image.resize(400, 400).quality(100).writeAsync(serverPath);
                data.profile_image = publicPath;
            }
            moduleLogger.debug({data}, 'Updating profile...');
            await db.query('UPDATE users_profiles SET ? WHERE profile_id=?;', [data, req.user.user_id]);
            moduleLogger.debug('Profile updated');
            res.status(200).json({success: true, data: {message: "Profile updated.", profile_header: data.profile_header, profile_image: data.profile_image}});
        });
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when updating user profile.');
        res.status(500).json({errors: [{message: 'Unexpected error'}]});
    }
};

const getFollowers = async function(req, res) {
    let username = deleteAtFromUsername(req.params.username);
    try {
        let [followers] = await db.query(`
            SELECT up.profile_id, up.profile_image, up.profile_name, up.profile_bio, up.username
            FROM users_profiles AS up
            INNER JOIN users_follows as uf ON uf.profile_id_one = up.profile_id
            WHERE uf.profile_id_two = (select profile_id from users_profiles where username = ?);
        `, [username]);
        moduleLogger.debug({followers}, 'Followers obtained.');
        res.status(200).json({data: followers});
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when querying followers.');
        res.status(500).json({errors: [{message: 'Unexpected error'}]});
    }
};

const getFollowing = async function(req, res) {
    let username = deleteAtFromUsername(req.params.username);
    try {
        let [following] = await db.query(`
            SELECT up.profile_id, up.profile_image, up.profile_name, up.profile_bio, up.username
            FROM users_profiles AS up
            INNER JOIN users_follows as uf ON uf.profile_id_two = up.profile_id
            WHERE uf.profile_id_one = (select profile_id from users_profiles where username = ?);
        `, [username]);
        moduleLogger.debug({following}, 'Following accounts obtained.');
        res.status(200).json({data: following});
    } catch (error) {
        moduleLogger.error(error, 'Unexpected error when querying following accounts.');
        res.status(500).json({errors: [{message: 'Unexpected error'}]});
    }
};

const followUser = async function(req, res) {
    if (req.body.user_to_follow_id) {
        try {
         let [result] = await db.query('INSERT INTO users_follows (profile_id_one, profile_id_two) VALUES (?, ?);'
         , [req.user.user_id, req.body.user_to_follow_id]);
         moduleLogger.debug(`New follow. \nFollowing user: ${req.user.user_id}. \nFollowed user: ${req.body.user_to_follow_id}`);  
         res.status(200).json({data: {following: true, message: "User followed"}}); 
        } catch (error) {
            moduleLogger.error(error, 'Unexpected error when following an account.');
            res.status(500).json({errors: [{message: 'Unexpected error'}]});
        }
    } else res.status(500).json({errors: [{message: 'Unexpected error'}]});
};

const unfollowUser = async function (req, res) {
    if (req.body.user_to_follow_id) {
        try {
         let [result] = await db.query('DELETE FROM users_follows where profile_id_one = ? AND profile_id_two = ?;'
         , [req.user.user_id, req.body.user_to_follow_id]);
         moduleLogger.debug(`Follow deleted. \nFollowing user: ${req.user.user_id}. \nUnfollowed user: ${req.body.user_to_follow_id}`);    
         res.status(200).json({data: {following: false, message: "User unfollowed"}}); 
        } catch (error) {
            moduleLogger.error(error, 'Unexpected error when unfollowing user.');
            res.status(500).json({errors: [{message: 'Unexpected error'}]});
        }
    } else res.status(500).json({errors: [{message: 'Unexpected error'}]});
};

module.exports = {
    getUserProfile,
    updateProfile,
    getFollowers,
    getFollowing,
    followUser,
    unfollowUser
};
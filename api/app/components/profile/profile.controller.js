const formidable = require('formidable');
const { BadRequestError } = require('../../utils/api-errors');
const { deleteAtFromUsername } = require('../../utils/fixUsername');

const logger = require('../../helpers/logger').logger.child({module: 'ProfileController'});
const ProfileService = require('./profile.service');

const getUserProfile = async (req, res, next) => {
    let username = deleteAtFromUsername(req.params.username);
    try {
        const profile = await ProfileService.getUserProfile(username, req.user.user_id);
        res.status(200).json({data: profile});
    } catch (error) {
        logger.error(error, 'Unexpected error when querying an user profile.');
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        logger.debug('Parsing request form...');
        formidable().parse(req, async function(err, fields, files) {
            if (err) throw err;
            const profile = await ProfileService.updateProfile(req.user.user_id, fields, files);
            return res.status(200).json({success: true, data: {message: 'Profile updated', ...profile}});
        });
    } catch (error) {
        logger.error(error, 'Unexpected error when updating user profile.');
        next(error);
    }
};

const getFollowers = async (req, res, next) => {
    let username = deleteAtFromUsername(req.params.username);
    try {
        const followers = await ProfileService.getFollowers(username);
        res.status(200).json({data: followers});
    } catch (error) {
        logger.error(error, 'Unexpected error when querying followers.');
        next(error);
    }
};

const getFollowing = async (req, res, next) => {
    let username = deleteAtFromUsername(req.params.username);
    try {
        const following = await ProfileService.getFollowing(username);
        res.status(200).json({data: following});
    } catch (error) {
        logger.error(error, 'Unexpected error when querying following users.');
        next(error);
    }
};

const followUser = async (req, res, next) => {
    if (!req.body.user_to_follow_id) {
        throw new BadRequestError('User to follow ID is required.');
    }
    try {
        await ProfileService.followUser(req.body.user_to_follow_id, req.user.user_id);
        res.status(200).json({data: {following: true, message: "User followed"}}); 
    } catch (error) {
        logger.error(error, 'Unexpected error when following an account.');
        next(error);
    }
};

const unfollowUser = async (req, res, next) => {
    if (!req.body.user_to_follow_id) {
        throw new BadRequestError('User to follow ID is required.');
    }
    try {
        await ProfileService.unfollowUser(req.body.user_to_follow_id, req.user.user_id);
        res.status(200).json({data: {following: false, message: "User unfollowed"}}); 
    } catch (error) {
        logger.error(error, 'Unexpected error when unfollowing an account.');
        next(error);
    }
};

module.exports = {
    getUserProfile,
    updateProfile,
    getFollowers,
    getFollowing,
    followUser,
    unfollowUser
};
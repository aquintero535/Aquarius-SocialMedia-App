const logger = require('../helpers/logger').logger.child({module: 'ProfileService'});

const UploadService = require('../services/upload.service');
const UserProfile = require('../models/profile.model');

const getUserProfile = async (username, userId) => {
    try {
        const profile = await UserProfile.getUserProfile(username, userId);
        if (!profile) {
            return [null, 'USER_NOT_FOUND'];
        }
        return [profile, null];
    } catch (error) {
        logger.error(error, 'Unexpected error when querying an user profile.');
        throw new Error('Unexpected error when querying an user profile.');
    }
}

const getLikingAccounts = async (postId) => {
    try {
        const accounts = await UserProfile.getLikingAccounts(postId);
        logger.debug({accounts}, `Accounts who liked post id: ${postId}`); 
        return accounts;
    } catch (error) {
        logger.error(error, 'Unexpected error when querying liking accounts.');
        throw new Error('Unexpected error when querying liking accounts.');
    }
};

const getRepostingAccounts = async (postId) => {
    try {
        const accounts = await UserProfile.getRepostingAccounts(postId);
        logger.debug({accounts}, `Accounts who reposted post id: ${postId}`);
        return accounts;
    } catch (error) {
        logger.error(error, 'Unexpected error when queryning reposting accounts.');
        throw new Error('Unexpected error when queryning reposting accounts.');
    }
};

const getFollowers = async (username) => {
    try {
        const followers = await UserProfile.getFollowers(username);
        logger.debug({followers}, 'Followers obtained.');
        return followers;
    } catch (error) {
        logger.error(error, 'Unexpected error when querying followers.');
        throw new Error('Unexpected error when querying followers.');
    }
}

const getFollowing = async (username) => {
    try {
        const following = await UserProfile.getFollowing(username);
        logger.debug({following}, 'Followers obtained.');
        return following;
    } catch (error) {
        logger.error(error, 'Unexpected error when querying followers.');
        throw new Error('Unexpected error when querying followers.');
    }
}

const updateProfile = async (userId, fields, files) => {
    try {
        let data = {profile_name : fields?.profile_name, profile_bio : fields?.profile_bio};
        logger.debug({fields, files}, 'Updating user profile.');
        if (files.profile_header) {
            data.profile_header = await UploadService.uploadProfileHeader(files.profile_header, userId);
        }
        if (files.profile_image) {
            data.profile_image = await UploadService.uploadProfileImage(files.profile_image, userId);
        }
        logger.debug({data}, 'Updating profile...');
        await UserProfile.update(data, userId);
        logger.debug('Profile updated');
        return { profile_header: data.profile_header, profile_image: data.profile_image };
    } catch (error) {
        logger.error(error, 'Unexpected error when updating user profile.');
        throw new Error('Unexpected error when updating user profile.');
    }
};

const followUser = async (userToFollowId, userId) => {
    try {
        await UserProfile.addFollow(userToFollowId, userId);
        logger.debug(`New follow. \nFollowing user: ${userId}. \nFollowed user: ${userToFollowId}`);  
    } catch (error) {
        logger.error(error, 'Unexpected error when following an account.');
        throw new Error('Unexpected error when following an account.');
    }
};

const unfollowUser = async (userToFollowId, userId) => {
    try {
        await UserProfile.removeFollow(userToFollowId, userId);
        logger.debug(`Follow removed. \nFormer following user: ${userId}. \nFormer followed user: ${userToFollowId}`);  
    } catch (error) {
        logger.error(error, 'Unexpected error when unfollowing an account.');
        throw new Error('Unexpected error when unfollowing an account.');
    }
};

module.exports = {
    getUserProfile,
    getLikingAccounts,
    getRepostingAccounts,
    getFollowers,
    getFollowing,
    updateProfile,
    followUser,
    unfollowUser
}
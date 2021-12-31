const logger = require('../../helpers/logger').logger.child({module: 'ProfileService'});

const { NotFoundError } = require('../../utils/api-errors');
const UploadService = require('../upload/upload.service');
const UserProfile = require('./profile.model');

const getUserProfile = async (username, userId) => {
    const profile = await UserProfile.getUserProfile(username, userId);
    if (!profile)
        throw new NotFoundError("This user profile doesn't exist.");
    return profile;
};

const getLikingAccounts = async (postId) => {
    const accounts = await UserProfile.getLikingAccounts(postId);
    logger.debug({accounts}, `Accounts who liked post id: ${postId}`); 
    return accounts;
};

const getRepostingAccounts = async (postId) => {
    const accounts = await UserProfile.getRepostingAccounts(postId);
    logger.debug({accounts}, `Accounts who reposted post id: ${postId}`);
    return accounts;
};

const getFollowers = async (username) => {
    const followers = await UserProfile.getFollowers(username);
    logger.debug({followers}, 'Followers obtained.');
    return followers;
};

const getFollowing = async (username) => {
    const following = await UserProfile.getFollowing(username);
    logger.debug({following}, 'Followers obtained.');
    return following;
};

const updateProfile = async (userId, fields, files) => {
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
};

const followUser = async (userToFollowId, userId) => {
    await UserProfile.addFollow(userToFollowId, userId);
    logger.debug(`New follow. \nFollowing user: ${userId}. \nFollowed user: ${userToFollowId}`);  
};

const unfollowUser = async (userToFollowId, userId) => {
    await UserProfile.removeFollow(userToFollowId, userId);
    logger.debug(`Follow removed. \nFormer following user: ${userId}. \nFormer followed user: ${userToFollowId}`);  
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
};
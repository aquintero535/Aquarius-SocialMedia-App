const jimp = require('jimp');
const publicDir = `./public`;

const logger = require('../../helpers/logger').logger.child({module: 'UploadService'});

const uploadProfileHeader = async (profileHeader, userId) => {
    let tempPath = profileHeader.path;
    let publicPath = `/files/profile_headers/${userId}.jpg`; 
    let serverPath = `${publicDir}${publicPath}`;
    logger.debug({tempPath, publicPath, serverPath}, 'Reading profile header from tempPath...');
    let image = await jimp.read(tempPath);
    logger.debug('Writing profile header in: ', serverPath);
    await image.resize(791, 400).quality(100).writeAsync(serverPath);
    return publicPath;
};

const uploadProfileImage = async (profileImage, userId) => {
    let tempPath = profileImage.path;
    let publicPath = `/files/profile_images/${userId}.jpg`; 
    let serverPath = `${publicDir}${publicPath}`;
    logger.debug({tempPath, publicPath, serverPath}, 'Reading profile image from tempPath...');
    let image = await jimp.read(tempPath);
    logger.debug('Writing profile image in ', serverPath);
    await image.resize(400, 400).quality(100).writeAsync(serverPath);
    return publicPath;
};

module.exports = {
    uploadProfileHeader,
    uploadProfileImage
};
import { helpHttp } from "../helpers/helpHttp";
import { helpUpload } from "../helpers/helpUpload";
import { getAuthHeader } from "../helpers/authHeader";

const API_URL = process.env.REACT_APP_API_URL;

const defaultHeaders = {headers: {...getAuthHeader()}};
const defaultPostHeaders = {
    headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()  
    }
}

export class ApiService {
    static fetchUserData = () => {
        return helpHttp().get(`${API_URL}/api/userdata`, defaultHeaders);
    }

    static fetchHomePosts = () => {
        return helpHttp().get(`${API_URL}/api/posts`, defaultHeaders);
    }

    static fetchUserPosts = (username) => {
        return helpHttp().get(`${API_URL}/api/profile/${username}/posts`, defaultHeaders);
    }

    static fetchPost = (postId) => {
        return helpHttp().get(`${API_URL}/api/posts/${postId}`, defaultHeaders);
    }

    static fetchPostReplies = (parentPostId) => {
        return helpHttp().get(`${API_URL}/api/posts/${parentPostId}/replies`, defaultHeaders);
    }

    static submitNewPost = (postBody) => {
        return helpHttp().post(`${API_URL}/api/posts`, {
            body: {post_body: postBody},
            ...defaultPostHeaders
        });
    }

    static submitNewReply = (postBody, repliedPostId) => {
        return helpHttp().post(`${API_URL}/api/posts/${repliedPostId}/replies`, {
            body: {post_body: postBody},
            ...defaultPostHeaders
        })
    }

    static deleteReply = (replyId, repliedPostId) => {
        return helpHttp().del(`${API_URL}/api/posts/${repliedPostId}/replies`, {
            body: {post_id: replyId},
            ...defaultPostHeaders
        });
    }

    static fetchUserProfile = (username) => {
        return helpHttp().get(`${API_URL}/api/profile/${username}`, defaultHeaders);
    }

    static toggleFollowUser = (username, userToFollowId, isFollowing) => {
        let endpoint = `${API_URL}/api/profile/${username}/follow`;
        let options = {
            body: {user_to_follow_id: userToFollowId},
            ...defaultPostHeaders
        };

        if (!isFollowing) {
            return helpHttp().post(endpoint, options);
        } else {
            return helpHttp().del(endpoint, options);
        }
    }

    static getFollowing = (username) => {
        return helpHttp().get(`${API_URL}/api/profile/${username}/following`, defaultHeaders);
    }

    static getFollowers = (username) => {
        return helpHttp().get(`${API_URL}/api/profile/${username}/followers`, defaultHeaders);
    }

    static editUserProfile = (username, form) => {
        let data = new FormData();
        if (form.profile_header) data.append('profile_header', form.profile_header);
        if (form.profile_image) data.append('profile_image', form.profile_image);
        data.append('profile_name', form.profile_name);
        data.append('profile_bio', form.profile_bio);
        return helpUpload(`${API_URL}/api/profile/${username}`, data);
    }

    static fetchLikingAccounts = (postId) => {
        return helpHttp().get(`${API_URL}/api/posts/${postId}/likes`, defaultHeaders);
    }

    static togglePostLike = (postId, liked) => {
        let endpoint = `${API_URL}/api/posts/${postId}/likes`;
        if (!liked) {
            return helpHttp().post(endpoint, defaultHeaders);
        } else {
            return helpHttp().del(endpoint, defaultHeaders);
        }
    }

    static fetchRepostingAccounts = (postId) => {
        return helpHttp().get(`${API_URL}/api/posts/${postId}/reposts`, defaultHeaders);
    }

    static toggleRepost = (postId, isReposted) => {
        let endpoint = `${API_URL}/api/posts/${postId}/reposts`;
        let options = {headers: {...getAuthHeader()}};
        if (!isReposted){
            return helpHttp().post(endpoint, options);
        } else {
            return helpHttp().del(endpoint, options);
        }
    }

    static deletePost = (postId) => {
        return helpHttp().del(`${API_URL}/api/posts/${postId}`, defaultHeaders);
    }

    static doPing = () => {
        return helpHttp().get(`${API_URL}/api/ping`, defaultHeaders);
    }
}

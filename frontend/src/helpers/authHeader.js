export const getAuthHeader = () => {
    let token = JSON.parse(localStorage.getItem('currentUser'))?.auth_token;
    if (!token) return {};
    return { 'Authorization': 'Bearer '+token } 
};
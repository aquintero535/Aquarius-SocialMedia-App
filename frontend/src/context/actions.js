import jwt from 'jsonwebtoken';

const API_URL = process.env.REACT_APP_API_URL;

export const login = (dispatch, loginPayload) => {
    dispatch({type: 'REQUEST_LOGIN'});
    return fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(loginPayload)
    }).then((res) => res.json())
    .then((json) => {
        if (json.data?.user && json.data?.auth_token){
            dispatch({type: 'LOGIN_SUCCESS', payload: json.data});
            localStorage.setItem('currentUser', JSON.stringify(json.data));
            return Promise.resolve(json.data);
        } else return Promise.reject(json);
    }).catch((error) => {
        let err = (error.error) ? error.error.message : error.message;
        dispatch({type: 'LOGIN_ERROR', error: err});
        return Promise.reject(err);
    });
};

export const signup = (form) => {
    return fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(form)
    }).then((res) => (res.ok) ? {} : res.json())
    .then((json) => {
        if (json.error) return Promise.reject(json); 
        else return Promise.resolve(json);
    }).catch((err) => {
        if (!err.error) return Promise.reject([{message: err.toString()}]);
        else return Promise.reject(err.errors);
    });
}

export const logout = (dispatch) => {
    dispatch({type: 'LOGOUT'});
    localStorage.removeItem('currentUser');
} 

export const isAuthenticated = (dispatch) => { //TODO: Verify token expiration.
    try {
        let token = JSON.parse(localStorage.getItem('currentUser')).auth_token;
        jwt.verify(token, process.env.REACT_APP_SECRET_KEY);
        return true;
    } catch (err) {
        console.error(err);
        logout(dispatch);
        return false;
    }
};
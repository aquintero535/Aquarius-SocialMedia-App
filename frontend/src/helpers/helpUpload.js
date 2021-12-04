import { getAuthHeader } from './authHeader';

export const helpUpload = (endpoint, form) => {
    let options = {};
    options.headers = getAuthHeader();
    options.method = 'PUT';
    options.body = form;
    /* TODO: Averiguar si el AbortController afecta la subida de archivos. */
    
    /* const controller = new AbortController();
    options.signal = controller.signal;
    setTimeout(() => controller.abort(), 6000); */
    return fetch(endpoint, options)
        .then((res) => {
            return res.text()
            .then((text) => {
                return text 
                    ? JSON.parse(text) 
                    : {error: {message: `${res.status} ${res.statusText}`}}
            }).then((json) => {
                if (!res.ok) {
                    if (res.status === 401) window.location.reload();
                    else return Promise.reject(json);
                }
                return json;
            })
        })
        .catch((err) => {
            console.error(err);
            if (err.error) {
                return Promise.reject(err.error.message);
            } else {
                return Promise.reject('Something failed.');
            }
        });
};
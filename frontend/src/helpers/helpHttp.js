export const helpHttp = () => {
    const customFetch = (endpoint, options) => {
        const defaultHeader = {
            accept: "application/json"
        };
        const controller = new AbortController();
        options.signal = controller.signal;
        options.headers = options.headers 
        ? {...defaultHeader, ...options.headers} 
        : defaultHeader;
        options.body = JSON.stringify(options.body) || false;
        if (!options.body) delete options.body;
        setTimeout(() => controller.abort(), 6000);
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
    const get = (url, options = {}) => {
        options.method = 'GET';
        return customFetch(url, options);
    }
    const post = (url, options = {}) => {
        options.method = 'POST';
        return customFetch(url, options);
    };
    const put = (url, options = {}) => {
        options.method = 'PUT';
        return customFetch(url, options);
    };
    const del = (url, options = {}) => {
        options.method = 'DELETE';
        return customFetch(url, options);
    };
    return {get, post, put, del};
};
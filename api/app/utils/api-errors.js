class ApiError extends Error {
    constructor(statusCode, message){
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }
}

class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized'){
        super(401, message);
    } 
}

class BadRequestError extends ApiError {
    constructor(message = 'Bad request'){
        super(400, message);
    } 
}

class NotFoundError extends ApiError {
    constructor(message = 'Not found'){
        super(404, message);
    } 
}

module.exports = {
    ApiError,
    UnauthorizedError,
    BadRequestError,
    NotFoundError
}
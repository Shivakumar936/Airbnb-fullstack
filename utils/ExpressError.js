class ExpressError extends Error {
    constructor(statusCode, message) {
        super(message); // Pass message to the Error constructor
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;

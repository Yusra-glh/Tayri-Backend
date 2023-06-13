class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            message:this.message
        };
    }
}

module.exports = HttpError;

const HttpError = require('../util/HttpError');
const {errorHandler} = require("../util/util");
const jwt = require("jsonwebtoken");


const verifyAccessToken = errorHandler(async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return new HttpError(401, 'Unauthorized').toJSON();
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = decodedToken.userId;
        next();
    } catch (e) {
        return new HttpError(401, 'Unauthorized').toJSON();
    }
});

module.exports = {
    verifyAccessToken
};
const jwt = require('jsonwebtoken');
require('dotenv').config()

const accessTime = 5 * 60;
const refreshTime = 7 * 24 * 60 * 60;
const refreshIfLessThan = 4 * 24 * 60 * 60;

const createTokens = (foundUser) => {
    const accessPayload = {userId: foundUser._id};
    const refreshPayload = {userId: foundUser._id, version: foundUser.tokenVersion};

    const accessToken = jwt.sign(accessPayload, process.env.ACCESS_SECRET, {expiresIn: accessTime});
    const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_SECRET, {expiresIn: refreshTime});

    return { accessToken, refreshToken };
}

const isProduction = process.env.NODE_ENV === 'production';

const setTokens = (res, access, refresh) => {
    res.cookie('access', access, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        domain: process.env.BASE_DOMAIN,
        path: '/',
        maxAge: accessTime * 1000,
    });

    if (refresh) res.cookie('refresh', refresh, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        domain: process.env.BASE_DOMAIN,
        path: '/',
        maxAge: refreshTime * 1000,
    });
}

const verifyRefreshToken = (token) => {
    // return jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
    //     if (err) {
    //         clearTokens(res);
    //         return res.status(403).json({message: "Invalid Token"})
    //     } else {
    //         return user
    //     }
    // });
    try {
        return jwt.verify(token, process.env.REFRESH_SECRET);
    } catch (err) {
        err.status = 403;
        throw err;
    }
}

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.ACCESS_SECRET);
}

const refreshTokens = (current, tokenVersion) => {
    if (tokenVersion !== current.version) return res.status(400).json({message: "Revoked Token"});

    const accessPayload = {userId: current.userId};
    const accessToken = jwt.sign(accessPayload, process.env.ACCESS_SECRET, {expiresIn: accessTime});

    let refreshPayload;
    const expiration = new Date(current.exp * 1000);
    const now = new Date();
    const secondsUntilExpiration = (expiration.getTime() - now.getTime()) / 1000;
    if (secondsUntilExpiration < refreshIfLessThan) {
        refreshPayload = {userId: current.userId, version: tokenVersion}
    }

    const refreshToken = refreshPayload && jwt.sign(refreshPayload, process.env.REFRESH_SECRET, {expiresIn: refreshTime});
    return { accessToken, refreshToken };
}

const clearTokens = (res) => {
    res.cookie('access', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        domain: process.env.BASE_DOMAIN,
        path: '/',
        maxAge: 0,
    });

    res.cookie('refresh', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        domain: process.env.BASE_DOMAIN,
        path: '/',
        maxAge: 0,
    });
}

module.exports = {createTokens, setTokens, verifyRefreshToken, verifyAccessToken, refreshTokens, clearTokens};
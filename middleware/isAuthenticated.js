const jwt = require('jsonwebtoken')
const {clearTokens} = require('../utils/tokens')

const isAuthenticated = (req, res, next) => {

    // console.log(req);
    const token = req.cookies['access'];
    if (!token || token === null) return res.status(401).json({message: "Not signed in"})

    jwt.verify(req.cookies['access'], process.env.ACCESS_SECRET, (err, user) => {
        if (err) {
            clearTokens(res)
            return res.status(403).json({message: "Invalid Token"})
        }

        req.user = user;
        next();
    });
}

module.exports = {isAuthenticated}
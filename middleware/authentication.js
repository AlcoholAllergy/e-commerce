const jwt = require('jsonwebtoken');
const customErrors = require('../errors');
const {isTokenValid} = require('../utils')


const authenticateUser = async (req, res, next) =>{
    const token = req.signedCookies.token

    if(!token){
        throw new customErrors.UnauthenticatedError('Authentication Invalid')
    };
    try {
        const payload = isTokenValid({token})
        const {userName, userId, userRole} = payload
        console.log(userName, userId, userRole)
        req.user = {userName, userId, userRole}
        next()
    } catch (error) {
        throw new customErrors.UnauthenticatedError('Authentication Invalid')
    }
}

const authorizePermission = (...roles)=> {
    return (req, res, next) => {
        if(!roles.includes(req.user.userRole)){
            throw new customErrors.UnauthorizedError('Unauthorized to access this route')
        }
        next() 
    }
}

module.exports = {authenticateUser, authorizePermission} 
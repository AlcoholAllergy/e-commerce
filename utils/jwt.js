const jwt = require('jsonwebtoken')


const createJWT = ({ payload }) => {
    //create the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
    return token;
};

const attachCookiesToResponse = ({res, payload}) => {
    //create the cookies attached to the response
    const token = createJWT({payload})
    const oneDay = 1000 * 60 * 60 * 24
    res.cookie('token',token,{
        httpOnly:true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',
        signed:true,
    })
}

const isTokenValid = ({ token }) => 
    //to verify the received token from front end
    jwt.verify(token, process.env.JWT_SECRET)


module.exports = { createJWT, isTokenValid, attachCookiesToResponse }
const User = require('../models/User');
const customErrors = require('../errors');
const { StatusCodes } = require('http-status-codes');
const jwt = require('../utils')


const getAllUsers = async (req, res) => {
    console.log(req.user);
    const users = await User.find({}).select('-password')
    res.status(StatusCodes.OK).json({ total: users.length, users })
};


const getSingleUser = async (req, res) => {
    jwt.checkPermissions(req.user, req.params.id);
    const user = await User.find({ _id: req.params.id }).select('-password')
    if (!user) {
        throw new customErrors.NotFoundError(`No use with id:${req.params.id}`)
    }
    res.status(StatusCodes.OK).json({ user })
};


const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user })
};


const updateUser = async (req, res) => {

    //checking if the new name and email are received
    const {newName, newEmail} = req.body
    if(!newName || !newEmail) {
        throw new customErrors.BadRequestError('Please provide new name and new email')
    }

    // method 1: by using the document functions
    // const user = await User.findOneAndUpdate(
    //     {_id:req.user.userId},
    //     {name:newName,email:newEmail},
    //     {new:true, runValidators:true},
    //     ) 

    // method 2: by using the instance pre save property to manually update each field.
    const user = await User.findOne({_id:req.user.userId})
    user.email = newEmail;
    user.name = newName;
    await user.save()


    //user info updated, new token needs to be signed and attacked into the cookie.
    const payload = jwt.createUserPayload(user)
    jwt.attachCookiesToResponse({res, payload})
    res.status(StatusCodes.OK).json({user:payload})
};


const updateUserPassword = async (req, res) => {
    const {oldPassword, newPassword } = req.body;
    if(!oldPassword || !newPassword ){
        throw new customErrors.BadRequestError('Please provide the old password and the new password')
    }
    const user = await User.findOne({_id:req.user.userId})
    const isPasswordOK = await user.comparePassword(oldPassword)
    if (!isPasswordOK){
        throw new customErrors.UnauthenticatedError('The old password entered is invalid')
    }
    user.password = newPassword

    await user.save()
    res.status(StatusCodes.OK).json({msg:'User password updated!'})
};


module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}
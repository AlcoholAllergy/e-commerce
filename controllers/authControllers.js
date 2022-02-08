const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const customErrors = require("../errors/index");
const utils = require("../utils/index");

const register = async (req, res) => {
    //For register new user
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        throw new customErrors.BadRequestError(
            "Please provide user name, email and password"
        );
    }

    //check if email occupied
    const emailDuplicated = await User.findOne({ email });
    if (emailDuplicated) {
        throw new customErrors.BadRequestError(
            "Duplicated email, please select another one "
        );
    }

    //check if creating the 1st user, if yes, set it as admin
    const firstUser = (await User.countDocuments({})) === 0;
    const role = firstUser ? "admin" : "user";

    //create user
    const user = await User.create({ name, email, password, role });

    //create user payload for sign a token
    const userPayload = utils.createUserPayload(user);

    //create a signed token
    // const token = utils.create.utils({payload:userPayload})

    //Method 1: send data to front end with the token, the token will be stored in the browser local storage
    // res.status(StatusCodes.CREATED)
    //     .json({ user: userPayload, token });

    //Method 2: send token within the cookie, the token will be stored in the cookie
    // const oneDay = 1000 * 60 * 60 * 24
    // res.cookie('token',token,{
    //     httpOnly:true,
    //     expires: new Date(Date.now() + oneDay)
    // })

    //instead of creating the cookie for each controller, we rather create a function to do it in the utils.
    utils.attachCookiesToResponse({ res, payload: userPayload });

    res.status(StatusCodes.CREATED).json({ user: userPayload });
};

const login = async (req, res) => {
    //the controller for login function

    //disctructe to obtain the email and password entered by user at front end and check the value received
    const { email, password } = req.body;
    if (!email || !password) {
        throw new customErrors.BadRequestError(
            "Please provide the email and password"
        );
    }

    //check if the user exist from DB
    const user = await User.findOne({ email });
    if (!user) {
        throw new customErrors.UnauthenticatedError("Invalid credential");
    }

    //check if the password is valid
    const isPassWordValid = await user.comparePassword(password);
    if (!isPassWordValid) {
        throw new customErrors.UnauthenticatedError(
            "Wrong password provided, please try again"
        );
    }

    //create user payload for sign a token
    const userPayload = utils.createUserPayload(user);
    utils.attachCookiesToResponse({ res, payload: userPayload });

    res.status(StatusCodes.OK).json({ user: userPayload });
};

const logout = async (req, res) => {
    //the controller for logout function
    res.cookie("token", "logout", {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    //no need to send back anything here, just for development purpose
    res.send("logout");
};

module.exports = {
    register,
    login,
    logout,
};

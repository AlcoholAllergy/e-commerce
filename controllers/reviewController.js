const Reviews = require("../models/Review");
const Products = require("../models/Products");
const { StatusCodes } = require("http-status-codes");
const customErrors = require("../errors/index");
const utils = require("../utils/index");

const createReview = async (req, res) => {
    //check if the product existing beforeing creating comments for it
    const { product: productId } = req.body;
    const isProdutExist = await Products.findOne({ _id: productId });
    if (!isProdutExist) {
        throw new customErrors.NotFoundError(`No product with ID: ${productId}`);
    }

    //check if the current user have commented this product alread?
    const alreadyCommented = await Reviews.findOne({
        product: productId,
        user: req.user.userId,
    });
    if (alreadyCommented) {
        throw new customErrors.BadRequestError(
            "You can only have one review for each product  "
        );
    }

    //create the review
    req.body.user = req.user.userId;
    const review = await Reviews.create(req.body);
    res.status(StatusCodes.CREATED).json({ review });
};

const getAllReview = async (req, res) => {
    const reviews = await Reviews.find({})
        .populate({
            path: "product",
            select: "name price company",
        })
        .populate({
            path: 'user',
            select: 'name'
        })
    res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

const getSingleReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const review = await Reviews.findOne({ _id: reviewId })
        .populate({
            path: "product",
            select: "name price company",
        })
    // .populate({
    //     path: "user",
    //     select: "name",
    // });
    if (!review) {
        throw new customErrors.NotFoundError(`No review with id:${reviewId}`);
    }

    res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const review = await Reviews.findOne({ _id: reviewId }).populate(
        "product",
        "name price company"
    );
    if (!review) {
        throw new customErrors.NotFoundError(`No review with id:${reviewId}`);
    }
    utils.checkPermissions(req.user, review.user);

    review.rating = rating;
    review.title = title;
    review.comment = comment;

    await review.save();
    res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const review = await Reviews.findOne({ _id: reviewId });
    if (!review) {
        throw new customErrors.NotFoundError(`No review with id:${reviewId}`);
    }
    utils.checkPermissions(req.user, review.user);
    await review.remove();
    res.status(StatusCodes.OK).json({ msg: "Removed!" });
};

const getSingleProductReviews = async (req, res) => {
    const { id: productId } = req.params
    const review = await Reviews.findOne({ product: productId })
    if (!review) {
        throw new customErrors.NotFoundError(`No product with id:${productId}`);
    }
    res.status(StatusCodes.OK).json({ review })
}

module.exports = {
    createReview,
    getAllReview,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews,
};

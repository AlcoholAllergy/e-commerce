const { number } = require("joi");
const mongoose = require("mongoose");

const Review = mongoose.Schema(
  {
    rating: {
      type: Number,
      default: 0,
      min: 1,
      max: 5,
      required: [true, "please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "please provide review title"],
      maxlength: 200,
    },
    comment: {
      type: String,
      required: [true, "please provide review comments3"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Products",
      required: true,
    },
  },
  { timestamps: true }
);

//setting each user can only have one comment for each product
Review.index({ product: 1, user: 1 }, { unique: true });

Review.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  console.log(result);

  try {
    await this.model('Products').findOneAndUpdate(
      { _id: productId }, 
      {
      averageRating: Math.ceil(result[0]?.averageRating || 0),
      numOfReviews: result[0]?.numOfReviews || 0,
      },
      )
  } catch (error) {
    console.log(error);
  }
}

//setting hook after save and remove
Review.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product)
})

Review.post('remove', async function () {
  await this.constructor.calculateAverageRating(this.product)
})

module.exports = mongoose.model("Reviews", Review);

const mongoose = require('mongoose')

const Products = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide the name'],
        trim: true,
        maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide the price'],
        default: 0,
    },
    description: {
        type: String,
        required: [true, 'Please provide the description'],
        maxlength: 5000,
    },
    image: {
        type: String,
        default: '/uploads/example.jpeg',
    },
    category: {
        type: String,
        required: [true, 'Please provide the product category'],
        enum: ['office', 'kitchen', 'bedroom'],
    },
    company: {
        type: String,
        required: [true, 'Please provide the product company'],
        enum: {
            values: ['Ikea', 'EQ3', 'B2B'],
            message: '{VALUE} is not supported'
        }
    },
    colors: {
        type: [String],
        required: true,

    },
    averageRating:{
        type: Number,
        default: 0,
    },
    numOfReviews:{
        type: Number,
        default: 0,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    freeShipping: {
        type: Boolean,
        default: false,
    },
    inventory: {
        type: Number,
        required: [true, 'Please provide the product inventory'],
        default: 0,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        required: [true, 'Please provide the product category'],
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

Products.virtual('reviews', {
    ref: 'Reviews',
    localField: '_id',
    foreignField: 'product',
    justOne: false
})

//Set a pre function to delete all associate reviews when remove a product
Products.pre('remove', async function () {
    await this.model('Reviews').deleteMany({ product: this._id })
})


module.exports = mongoose.model('Products', Products)
const { required } = require('joi')
const monoogse = require('mongoose')

const SingleOrderItems = monoogse.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    product:{
        type:monoogse.Types.ObjectId,
        ref:'Products',
        required: true
    }
})


const Orders = monoogse.Schema({
    tax: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    orderItems: [SingleOrderItems],
    status: {
        type: String,
        enum: ['pending', 'failed', 'paid', 'delevred', 'canceled'],
        default: 'pending'
    },
    user: {
        type: monoogse.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    clientSecret: {
        type: String,
        required: true
    },
    paymentIntentId: {
        type: String,
    },
}, { timestamps: true })


module.exports = monoogse.model('orders', Orders)
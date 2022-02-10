const Orders = require("../models/Order");
const Products = require('../models/Products')
const { StatusCodes } = require("http-status-codes");
const customErrors = require("../errors/index");
const utils = require("../utils/index");
const { func } = require("joi");
const { default: strictTransportSecurity } = require("helmet/dist/middlewares/strict-transport-security");
const Order = require("../models/Order");

const fakeStripeAPI = async ({ amount, currency }) => {
    const client_secret = 'someRandomValue'
    return { client_secret, amount }
}

const getAllOrders = async (req, res) => {
    const orders = await Orders.find({})

    res.status(StatusCodes.OK).json({count:orders.length, orders})
}


const getSingleOrder = async (req, res) => {
    const {id: orderId} = req.params
    const order = await Orders.findOne({_id:orderId})
    if(!order){
        throw new customErrors.NotFoundError(`No order with id:${orderId}`)
    }
    //check if the order belowns to the current user
    utils.checkPermissions(req.user, order.user)
    res.status(StatusCodes.OK).json({ order })
}


const getCurrentUserOrders = async (req, res) => {
    const orders = await Orders.find({user:req.user.userId})
    if(!orders){
        throw new customErrors.NotFoundError('Cannot find any existing orders')
    }
    res.status(StatusCodes.OK).json({count:orders.length, orders})
}


const createOrder = async (req, res) => {
    const { items: cartItems, tax, shippingFee } = req.body
    if (!cartItems) {
        throw new customErrors.BadRequestError('Please provide cart item')
    }
    if (!tax || !shippingFee) {
        throw new customErrors.BadRequestError('Please provide tax and shipping fee')
    }

    let orderItems = []
    let subtotal = 0
    for (const item of cartItems) {
        const dbProduct = await Products.findOne({ _id: item.product })
        if (!dbProduct) {
            throw new customErrors.NotFoundError(`No product with ID:${item.product}`)
        }
        const { name, price, image, _id } = dbProduct
        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product:_id
        }
        //add item to the order
        orderItems = [...orderItems, singleOrderItem]
        subtotal += price * item.amount
    }
    // console.log(orderItems);
    // console.log(subtotal);
    // calculate the total

    const total = tax + shippingFee + subtotal
    //set up a fake function for stripe payment
    const paymentIntent = await fakeStripeAPI({
        amount: total,
        currency: 'usd'
    })

    const order = await Orders.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymentIntent.client_secret,
        user: req.user.userId,
    })
    res.status(StatusCodes.CREATED).json({ order, clientSecret: order.clientSecret })
}


const updateOrder = async (req, res) => {
    const {id:orderId} = req.params
    const {paymentIntentId} = req.body

    const order = await Orders.findOne({_id: orderId})
    if(!order){
        throw new customErrors.NotFoundError(`No order with id:${orderId}`)
    }
    //check if the order belowns to the current user
    utils.checkPermissions(req.user, order.user)

    order.paymentIntentId = paymentIntentId
    order.status = 'paid'
    await order.save()

    res.status(StatusCodes.OK).json({ order })
}


module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder,
}
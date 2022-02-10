const router = require('express').Router();
const {authenticateUser, authorizePermission} = require('../middleware/authentication');

const {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder,
} = require('../controllers/orderControllers')

router.route('/').get([authenticateUser, authorizePermission('admin')],getAllOrders).post(authenticateUser, createOrder)

router.route('/showAllMyOrders').get(authenticateUser, getCurrentUserOrders)

router.route('/:id').get(authenticateUser, getSingleOrder).patch(authenticateUser, updateOrder)

module.exports = router 
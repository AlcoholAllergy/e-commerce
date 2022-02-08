const router = require('express').Router()
const {authenticateUser, authorizePermission} = require('../middleware/authentication')

const {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
} = require('../controllers/productControllers')

const {getSingleProductReviews} = require('../controllers/reviewController')

router
    .route('/')
    .post([authenticateUser, authorizePermission('admin')],createProduct)
    .get(getAllProducts);

//this route needs to be set before the /:id ones, cause the uploadImage could be read as id parameter
router
    .route('/uploadImage')
    .post([authenticateUser, authorizePermission('admin')],uploadImage)

router
    .route('/:id')
    .get(getSingleProduct)
    .patch([authenticateUser, authorizePermission('admin')],updateProduct)
    .delete([authenticateUser, authorizePermission('admin')],deleteProduct);


router
    .route('/:id/reviews').get(getSingleProductReviews)

module.exports = router;
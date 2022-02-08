const router = require("express").Router();

const {
  authenticateUser,
  authorizePermission,
} = require("../middleware/authentication");

const {
  createReview,
  getAllReview,
  getSingleReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

router.route("/").get(getAllReview).post(authenticateUser, createReview);

router
  .route("/:id")
  .get(getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview);

module.exports = router;

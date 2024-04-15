const express = require('express')
const router = express.Router()
const ReviewsController = require('../controller/reviewsController')

router.get('/', ReviewsController.getAllReviews)

router.get('/books/:id', ReviewsController.getAllReviewsBooks)

router.get('/users/books', ReviewsController.getAllReviewsBooksUsers)

router.post('/', ReviewsController.postReviews)

router.patch('/:id', ReviewsController.updateOneReviews)

router.delete('/:id', ReviewsController.deleteOneReviews)

module.exports = router

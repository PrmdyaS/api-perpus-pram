const express = require('express')
const router = express.Router()
const BorrowBooksController = require('../controller/borrowBooksController')

router.get('/', BorrowBooksController.getAllBorrowBooks)

router.post('/', BorrowBooksController.postAllBorrowBooks)

router.get('/:id', BorrowBooksController.getOneBorrowBooks)

router.patch('/:id', BorrowBooksController.updateOneBorrowBooks)

router.delete('/:id', BorrowBooksController.deleteOneBorrowBooks)

module.exports = router

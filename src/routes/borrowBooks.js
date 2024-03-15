const express = require('express')
const router = express.Router()
const BorrowBooksController = require('../controller/borrowBooksController')

router.get('/', BorrowBooksController.getAllBorrowBooks)

router.post('/', BorrowBooksController.postAllBorrowBooks)

router.patch('/:id', BorrowBooksController.updateOneSubCategories)

router.delete('/:id', BorrowBooksController.deleteOneSubCategories)

module.exports = router

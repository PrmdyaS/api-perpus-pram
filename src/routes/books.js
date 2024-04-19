const express = require('express')
const router = express.Router()
const booksController = require('../controller/booksController')
const multer = require('multer')
const upload = multer({storage: multer.memoryStorage()})

router.get('/', booksController.getAllBooks)

router.get('/rating-tertinggi', booksController.getBooksRatingTertinggi)

router.get('/menu-book', booksController.getBooksMenu)

router.get('/terbaru', booksController.getBooksTerbaru)

router.get('/search', booksController.searchBooks)

router.get('/search-data', booksController.searchDataBooks)

router.post('/', upload.single('sampul_buku'), booksController.postBooks)

router.get('/all/:id', booksController.getOneBooksAll)

router.get('/:id', booksController.getOneBooks)

router.patch('/:id', upload.single('sampul_buku'), booksController.updateOneBooks)

router.delete('/:id', booksController.deleteOneBooks)

module.exports = router

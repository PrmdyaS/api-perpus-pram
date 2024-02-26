const express = require('express')
const router = express.Router()
const booksController = require('../controller/booksController')
const multer = require('multer')
const upload = multer({storage: multer.memoryStorage()})

router.get('/', booksController.getAllBooks)

router.post('/', upload.single('sampul_buku'), booksController.postBooks)

router.get('/:id', booksController.getOneBooks)

router.patch('/:id', booksController.updateOneBooks)

router.delete('/:id', booksController.deleteOneBooks)

module.exports = router

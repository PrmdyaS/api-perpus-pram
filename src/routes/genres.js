const express = require('express')
const router = express.Router()
const GenresController = require('../controller/genresController')

router.get('/', GenresController.getAllGenres)

router.post('/', GenresController.postGenres)

router.patch('/:id', GenresController.updateOneGenres)

router.delete('/:id', GenresController.deleteOneGenres)

module.exports = router

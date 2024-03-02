const express = require('express')
const router = express.Router()
const FavoritesController = require('../controller/favoritesController')

router.get('/', FavoritesController.getAllFavorites)

router.post('/', FavoritesController.postFavorites)

router.get('/:id', FavoritesController.getUsersFavorites)

router.patch('/:id', FavoritesController.updateOneFavorites)

router.delete('/:id', FavoritesController.deleteOneFavorites)

module.exports = router

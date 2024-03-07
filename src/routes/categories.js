const express = require('express')
const router = express.Router()
const CategoriesController = require('../controller/categoriesController')

router.get('/', CategoriesController.getAllCategories)

router.post('/', CategoriesController.postCategories)

router.patch('/:id', CategoriesController.updateOneCategories)

router.delete('/:id', CategoriesController.deleteOneCategories)

module.exports = router

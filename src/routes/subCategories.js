const express = require('express')
const router = express.Router()
const SubCategoriesController = require('../controller/subCategoriesController')

router.get('/', SubCategoriesController.getAllSubCategories)

router.post('/', SubCategoriesController.postSubCategories)

router.patch('/:id', SubCategoriesController.updateOneSubCategories)

router.delete('/:id', SubCategoriesController.deleteOneSubCategories)

module.exports = router

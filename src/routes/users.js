const express = require('express')
const router = express.Router()
const UserController = require('../controller/UsersController')

router.get('/', UserController.getAllUsers)

router.post('/', UserController.postUsers)

router.get('/:id', UserController.getOneUsers)

router.patch('/:id', UserController.updateOneUsers)

router.delete('/:id', UserController.deleteOneUsers)

router.post('/login', UserController.loginUsers)

module.exports = router

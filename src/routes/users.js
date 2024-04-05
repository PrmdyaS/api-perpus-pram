const express = require('express')
const router = express.Router()
const UserController = require('../controller/UsersController')
const multer = require('multer')
const upload = multer({storage: multer.memoryStorage()})

router.get('/', UserController.getAllUsers)

router.post('/', UserController.postUsers)

router.get('/username', UserController.checkUsername)

router.get('/:id', UserController.getOneUsers)

router.patch('/:id', upload.single('profile_picture'), UserController.updateOneUsers)

router.delete('/:id', UserController.deleteOneUsers)

router.post('/login', UserController.loginUsers)

module.exports = router

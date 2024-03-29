const express = require('express')
const router = express.Router()
const RolesController = require('../controller/RolesController')

router.get('/', RolesController.getAllRoles)

router.post('/', RolesController.postRoles)

router.delete('/:id', RolesController.deleteOneRoles)

module.exports = router

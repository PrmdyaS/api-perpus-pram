const express = require('express')
const router = express.Router()
const DendaController = require('../controller/dendaController')
const multer = require('multer')
const upload = multer({storage: multer.memoryStorage()})

router.get('/', DendaController.getAllDenda)

router.post('/', upload.single('bukti_pembayaran'), DendaController.postDenda)

router.delete('/:id', DendaController.deleteOneDenda)

module.exports = router

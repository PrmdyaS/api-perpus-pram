const express = require('express')
const { connectToDb } = require('./src/db')
const usersRoutes = require('./src/routes/users')
const booksRoutes = require('./src/routes/books')


// const multer = require('multer')
// const path = require('path')

// const storage = multer.diskStorage({
//     destination: './upload/images',
//     filename: (req, file, cb) => {
//         return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
//     }
// })
// const upload = multer({
//     storage: storage
// })


const app = express()
app.use(express.json())

app.use('/users', usersRoutes)
app.use('/books', booksRoutes)

connectToDb((err) => {
    if (!err) {
        app.listen(3000, () => {
            console.log('Server On http://localhost:3000')
        })
    }
})

app.get('/', (req, res) => {
    res.json({ msg: 'selamat datang di api pram' })
})

// app.use('/profile', express.static('upload/images'))
// app.post('/jambu', upload.single('profile'), (req, res) => {
//     res.json({
//         success: 1,
//         profile_url: `http://localhost:3000/profile/${req.file.filename}`,
//         data: req.body,
//         image: req.file.filename
//     })
// })

// app.post('/jambu', upload.single('filename'), (req, res) => {
//     console.log(req.file)
// })
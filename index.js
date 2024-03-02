const express = require('express')
const { connectToDb } = require('./src/db')
const usersRoutes = require('./src/routes/users')
const booksRoutes = require('./src/routes/books')
const favoriteRoutes = require('./src/routes/favorites')

const app = express()
app.use(express.json())

app.use('/users', usersRoutes)
app.use('/books', booksRoutes)
app.use('/favorites', favoriteRoutes)

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

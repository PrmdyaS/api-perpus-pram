const express = require('express')
const { connectToDb } = require('./src/db')
const usersRoutes = require('./src/routes/users')
const rolesRoutes = require('./src/routes/roles')
const booksRoutes = require('./src/routes/books')
const favoritesRoutes = require('./src/routes/favorites')
const categoriesRoutes = require('./src/routes/categories')
const subCategoriesRoutes = require('./src/routes/subCategories')
const borrowBooksRoutes = require('./src/routes/borrowBooks')

const app = express()
app.use(express.json())

app.use('/users', usersRoutes)
app.use('/roles', rolesRoutes)
app.use('/books', booksRoutes)
app.use('/favorites', favoritesRoutes)
app.use('/categories', categoriesRoutes)
app.use('/sub-categories', subCategoriesRoutes) 
app.use('/borrow-books', borrowBooksRoutes)

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

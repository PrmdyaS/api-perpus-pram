const express = require('express')
const { connectToDb, getDb } = require('./src/db')
const usersRoutes = require('./src/routes/users')
const rolesRoutes = require('./src/routes/roles')
const booksRoutes = require('./src/routes/books')
const favoritesRoutes = require('./src/routes/favorites')
const categoriesRoutes = require('./src/routes/categories')
const subCategoriesRoutes = require('./src/routes/subCategories')
const borrowBooksRoutes = require('./src/routes/borrowBooks')
const genresRoutes = require('./src/routes/genres')
const reviewsRoutes = require('./src/routes/reviews')
const dendaRoutes = require('./src/routes/denda')
const moment = require('moment-timezone');
const { ObjectId } = require('mongodb')

let db

const app = express()
app.use(express.json())

app.use('/users', usersRoutes)
app.use('/roles', rolesRoutes)
app.use('/books', booksRoutes)
app.use('/favorites', favoritesRoutes)
app.use('/categories', categoriesRoutes)
app.use('/sub-categories', subCategoriesRoutes)
app.use('/borrow-books', borrowBooksRoutes)
app.use('/genres', genresRoutes)
app.use('/reviews', reviewsRoutes)
app.use('/denda', dendaRoutes)

connectToDb((err) => {
    if (!err) {
        db = getDb()
        initApp();
        app.listen(3000, () => {
            console.log('Server On http://localhost:3000')
        })
    }
})

app.get('/', (req, res) => {
    res.json({ msg: 'selamat datang di api pram' })
})

function checkOverdueLoans() {
    const currentDate = moment().tz('Asia/Jakarta');

    db.collection('borrow_books')
        .find({
            status: { $in: ["Dipinjam", "Denda"] }
        })
        .forEach(borrow_books => {
            const dueDate = moment(borrow_books.return_date, 'YYYY-MM-DD').tz('Asia/Jakarta');
            const daysLate = currentDate.diff(dueDate, 'days');
            const denda = daysLate > 0 ? daysLate * 1000 : 0;
            db.collection('borrow_books')
                .updateOne({ _id: new ObjectId(borrow_books._id) }, { $set: { denda: denda } })
                .then(result => {
                    if (denda > 0) {
                        db.collection('borrow_books')
                            .updateOne({ _id: new ObjectId(borrow_books._id) }, { $set: { status: 'Denda' } })
                            .then(result => {
                                console.log('Denda Berhasil diupdate');
                            })
                            .catch(err => {
                                res.status(500).json({ error: 'Could not update the document' })
                            })
                    }
                })
                .catch(err => {
                    res.status(500).json({ error: 'Could not update the document' })
                })
        })
        .catch(() => {
            res.status(500).json({ error: 'Error Memperbarui Status Denda' });
        });
}

function initApp() {
    checkOverdueLoans();
    setInterval(checkOverdueLoans, 24 * 60 * 60 * 1000);
}
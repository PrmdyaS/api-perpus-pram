const express = require('express')
const { connectToDb } = require('./db')
const usersRoutes = require('./routes/users')

const app = express()
app.use(express.json())

app.use('/users', usersRoutes)

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
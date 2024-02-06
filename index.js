const express = require('express')
const { ObjectId } = require('mongodb')
const { connectToDb, getDb } = require('./db')
const bcrypt = require('bcrypt');

const app = express()
app.use(express.json())


let db
connectToDb((err) => {
    if (!err) {
        app.listen(3000, () => {
            console.log('on port 3000')
        })
        db = getDb()
    }
})

app.get('/', (req, res) => {
    res.json({ msg: 'selamat datang di api pram' })
})

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        return res.status(404).json({ message: 'User not found' + username + password });

        // Cari pengguna berdasarkan username
        const user = await db.collection('user').findOne({ username });

        // Jika pengguna tidak ditemukan, kirim respons "user not found"
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Periksa apakah password cocok
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // Jika password tidak cocok, kirim respons "password did not match"
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Password did not match' });
        }

        // Jika login berhasil, kirim respons "Login Success" beserta data pengguna
        return res.status(200).json({ message: 'Login Success', user });
    } catch (error) {
        // Tangani kesalahan server
        console.error('Internal server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/user', (req, res) => {
    const page = req.query.p || 0
    const userPerPage = 10

    let user = []

    db.collection('user')
        .find()
        .sort({ email: 1 })
        .skip(page * userPerPage)
        .limit(userPerPage)
        .forEach(users => user.push(users))
        .then(() => {
            res.status(200).json(user)
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' })
        })
})

app.get('/user/:id', (req, res) => {

    if (ObjectId.isValid(req.params.id)) {
        db.collection('user')
            .findOne({ _id: new ObjectId(req.params.id) })
            .then(doc => {
                res.status(200).json(doc)
            })
            .catch(err => {
                res.status(500).json({ error: 'Could not fetch the document' })
            })
    } else {
        res.status(500).json({ error: 'Not a valid document id' })
    }
})

app.post('/user', async (req, res) => {
    const saltRounds = 10;
    const user = req.body;
    try {
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        user.password = hashedPassword;
        const result = await db.collection('user').insertOne(user);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: 'Could not create a new document' });
    }
})

app.delete('/user/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('user')
            .deleteOne({ _id: new ObjectId(req.params.id) })
            .then(result => {
                res.status(200).json(result)
            })
            .catch(err => {
                res.status(500).json({ error: 'Could not delete the document' })
            })
    } else {
        res.status(500).json({ error: 'Not a valid document id' })
    }
})

app.patch('/user/:id', (req, res) => {
    const updates = req.body
    if (ObjectId.isValid(req.params.id)) {
        db.collection('user')
            .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
            .then(result => {
                res.status(200).json(result)
            })
            .catch(err => {
                res.status(500).json({ error: 'Could not update the document' })
            })
    } else {
        res.status(500).json({ error: 'Not a valid document id' })
    }
})
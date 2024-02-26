const { connectToDb, getDb } = require('../db')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb')
const firebase = require('firebase/app')
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage')

let db
connectToDb((err) => {
    if (!err) {
        db = getDb()
    }
})

const firebaseConfig = {
    apiKey: "AIzaSyAs9mhKG_PzO9yzZIPafT1MCMOF1GgF0IY",
    authDomain: "perpus-pram.firebaseapp.com",
    projectId: "perpus-pram",
    storageBucket: "perpus-pram.appspot.com",
    messagingSenderId: "928477389217",
    appId: "1:928477389217:web:2e7d0f0bd2271814b06be0",
    measurementId: "G-QVK4YNSPFW"
};

firebase.initializeApp(firebaseConfig)
const storage = getStorage();

const getAllBooks = (req, res) => {
    let books = []
    db.collection('books')
        .find()
        .sort({ judul: 1 })
        .forEach(book => books.push(book))
        .then(() => {
            res.status(200).json(
                {
                    message: "success",
                    status: 200,
                    data: books
                }
            )
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' })
        })
}

const postBooks = async (req, res) => {
    const { judul, penulis, penerbit, tahun_terbit, deskripsi_buku } = req.body;
    const filename = Date.now().toString() + "." + req.file.originalname.split('.').pop();
    const storageRef = ref(storage, `cover-book/${filename}`);
    try {
        const metadata = {
            contentType: req.file.mimetype,
        }
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref)
        const newBook = {
            judul,
            penulis,
            penerbit,
            tahun_terbit,
            deskripsi_buku,
            sampul_buku: downloadURL,
        };
        const result = await db.collection('books').insertOne(newBook);
        res.json({
            message: "Tambah buku berhasil",
            status: 200,
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat melakukan tambah buku' });
    }
}
    
const getOneBooks = (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('books')
            .findOne({ _id: new ObjectId(req.params.id) })
            .then(doc => {
                res.status(200).json({
                    message: "success",
                    status: 200,
                    data: doc
                })
            })
            .catch(err => {
                res.status(500).json({ error: 'Could not fetch the document' })
            })
    } else {
        res.status(500).json({ error: 'Not a valid document id' })
    }
}

const updateOneBooks = (req, res) => {
    const updates = req.body
    if (ObjectId.isValid(req.params.id)) {
        db.collection('books')
            .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
            .then(result => {
                res.status(200).json({
                    message: "Update Success",
                    status: 200,
                    data: result
                })
            })
            .catch(err => {
                res.status(500).json({ error: 'Could not update the document' })
            })
    } else {
        res.status(500).json({ error: 'Not a valid document id' })
    }
}

const deleteOneBooks = (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('books')
            .deleteOne({ _id: new ObjectId(req.params.id) })
            .then(result => {
                res.status(200).json({
                    message: "Delete Success",
                    status: 200,
                    data: result
                })
            })
            .catch(err => {
                res.status(500).json({ error: 'Could not delete the document' })
            })
    } else {
        res.status(500).json({ error: 'Not a valid document id' })
    }
}

const loginUsers = async (req, res) => {
    const { email, password } = req.body;
    const user = await db.collection('user').findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Email tidak ditemukan' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return res.status(401).json({ message: 'Password tidak cocok' });
    }

    res.status(200).json(
        {
            message: "Login Success",
            status: 200,
            data: user
        }
    );
}

module.exports = {
    getAllBooks,
    postBooks,
    getOneBooks,
    updateOneBooks,
    deleteOneBooks,
    loginUsers,
}
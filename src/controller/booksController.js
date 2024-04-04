const { connectToDb, getDb } = require('../db')
const { ObjectId } = require('mongodb')
const firebase = require('firebase/app')
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage')
const moment = require('moment-timezone');

moment.tz.setDefault('Asia/Jakarta');

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const penerbit = req.query.penerbit;
    let query = {};
    if (penerbit) {
        query = { penerbit: penerbit };
    }

    let books = [];
    db.collection('books')
        .find(query)
        .sort({ judul: 1 })
        .skip(skip)
        .limit(limit)
        .forEach(book => {
            books.push({
                _id: book._id,
                judul: book.judul,
                penulis: book.penulis,
                penerbit: book.penerbit,
                sampul_buku: book.sampul_buku,
                rating: book.rating,
            });
        })
        .then(() => {
            res.status(200).json({
                message: "success",
                status: 200,
                data: books
            });
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' });
        });
}

const searchBooks = (req, res) => {
    const q = req.query.q;
    let query = {};
    if (q) {
        query = {
            $or: [
                { judul: { $regex: q, $options: 'i' } },
                { penerbit: { $regex: q, $options: 'i' } },
                { penulis: { $regex: q, $options: 'i' } }
            ]
        };
    }

    let books = [];
    db.collection('books')
        .find(query)
        .sort({ judul: 1 })
        .forEach(book => books.push(book.judul))
        .then(() => {
            res.status(200).json({
                message: "success",
                status: 200,
                data: books
            });
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' });
        });
}

const searchDataBooks = (req, res) => {
    const q = req.query.q;
    let query = {};
    if (q) {
        query = {
            $or: [
                { judul: { $regex: q, $options: 'i' } },
                { penerbit: { $regex: q, $options: 'i' } },
                { penulis: { $regex: q, $options: 'i' } }
            ]
        };
    }

    let books = [];
    db.collection('books')
        .find(query)
        .sort({ judul: 1 })
        .forEach(book => {
            books.push({
                _id: book._id,
                judul: book.judul,
                penulis: book.penulis,
                penerbit: book.penerbit,
                sampul_buku: book.sampul_buku,
                rating: book.rating,
            });
        })
        .then(() => {
            res.status(200).json({
                message: "success",
                status: 200,
                data: books
            });
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' });
        });
}

const getBooksRatingTertinggi = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let books = [];
    db.collection('books')
        .find()
        .sort({ rating: -1 })
        .skip(skip)
        .limit(limit)
        .forEach(book => {
            books.push({
                _id: book._id,
                judul: book.judul,
                penulis: book.penulis,
                penerbit: book.penerbit,
                sampul_buku: book.sampul_buku,
                rating: book.rating,
            });
        })
        .then(() => {
            res.status(200).json({
                message: "success",
                status: 200,
                data: books
            });
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' });
        });
};

const getBooksTerbaru = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let books = [];
    db.collection('books')
        .find()
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .forEach(book => {
            books.push({
                _id: book._id,
                judul: book.judul,
                penulis: book.penulis,
                penerbit: book.penerbit,
                sampul_buku: book.sampul_buku,
                rating: book.rating,
            });
        })
        .then(() => {
            res.status(200).json({
                message: "success",
                status: 200,
                data: books
            });
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' });
        });
};


const postBooks = async (req, res) => {
    const { judul, penulis, penerbit, tahun_terbit, deskripsi_buku, rating } = req.body;
    const filename = Date.now().toString() + "." + req.file.originalname.split('.').pop();
    const storageRef = ref(storage, `cover-book/${filename}`);
    const moments = moment().format();
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
            rating,
            created_at: moments,
            updated_at: moments,
        };
        const result = await db.collection('books').insertOne(newBook);
        res.json({
            message: "Tambah buku berhasil",
            status: 200,
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat melakukan tambah buku' + error });
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
    const moments = moment().format();
    updates.updated_at = moments;
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

module.exports = {
    getAllBooks,
    getBooksRatingTertinggi,
    getBooksTerbaru,
    postBooks,
    getOneBooks,
    updateOneBooks,
    deleteOneBooks,
    searchBooks,
    searchDataBooks,
}
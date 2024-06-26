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
    const subCategoriesId = req.query.sub_categories_id;
    const genres_id = req.query.genres_id;
    let query = {};
    if (penerbit) {
        query = { penerbit: penerbit };
    } else if (subCategoriesId) {
        query = { sub_categories_id: new ObjectId(subCategoriesId) };
    } else if (genres_id) {
        query = { genres_id: { $elemMatch: { $eq: new ObjectId(genres_id) } } }
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

const getBooksMenu = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
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
                sampul_buku: book.sampul_buku,
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
    const { judul, penulis, penerbit, tahun_terbit, deskripsi_buku, sub_categories_id, genres_id } = req.body;
    const filename = Date.now().toString() + "." + req.file.originalname.split('.').pop();
    const storageRef = ref(storage, `cover-book/${filename}`);
    const moments = moment().format();
    const ObjectIdGenres = [];
    try {
        const metadata = {
            contentType: 'image/jpeg',
        }
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref)
        if (genres_id && genres_id.length > 0 && !/^[a-z0-9]{24}$/.test(genres_id)) {
            genres_id.forEach(id => {
                ObjectIdGenres.push(new ObjectId(id));
            });
        } else if (/^[a-z0-9]{24}$/.test(genres_id)) {
            ObjectIdGenres.push(new ObjectId(genres_id));
        } else {
            return res.status(400).json({ error: 'genres_id harus terdiri dari 24 karakter alfanumerik' });
        }
        const newBook = {
            judul,
            penulis,
            penerbit,
            tahun_terbit,
            sub_categories_id: new ObjectId(sub_categories_id),
            genres_id: ObjectIdGenres,
            sampul_buku: downloadURL,
            deskripsi_buku,
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
        res.status(500).json({ error: 'Terjadi kesalahan saat melakukan tambah buku'});
    }
}

const getOneBooksAll = async (req, res) => {
    try {
        if (ObjectId.isValid(req.params.id)) {
            const cursor = db.collection('books').aggregate([
                {
                    $match: { _id: new ObjectId(req.params.id) }
                },
                {
                    $lookup: {
                        from: 'sub_categories',
                        as: 'sub_categories',
                        let: { subCategoriesId: "$sub_categories_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$subCategoriesId"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    categories_id: 0,
                                    index: 0,
                                }
                            },
                        ]
                    }
                },
                {
                    $set: {
                        sub_categories: { $arrayElemAt: ["$sub_categories", 0] }
                    }
                },
                {
                    $lookup: {
                        from: 'genres',
                        localField: "genres_id",
                        foreignField: "_id",
                        as: "genres"
                    }
                },
                {
                    $project: {
                        created_at: 0,
                        updated_at: 0,
                        sub_categories_id: 0,
                        genres_id: 0,
                    }
                },
            ]);
            const books = await cursor.next();
            if (books) {
                res.status(200).json({
                    message: "success",
                    status: 200,
                    data: books
                });
            }
        } else {
            res.status(500).json({ error: 'Not a valid document id' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not find the document' });
    }
}

const getOneBooks = async (req, res) => {
    try {
        if (ObjectId.isValid(req.params.id)) {
            const cursor = db.collection('books').aggregate([
                {
                    $match: { _id: new ObjectId(req.params.id) }
                },
                {
                    $lookup: {
                        from: 'genres',
                        localField: "genres_id",
                        foreignField: "_id",
                        as: "genres"
                    }
                },
                {
                    $project: {
                        created_at: 0,
                        updated_at: 0,
                        sub_categories_id: 0,
                        genres_id: 0,
                    }
                },
            ]);
            const books = await cursor.next();
            if (books) {
                res.status(200).json({
                    message: "success",
                    status: 200,
                    data: books
                });
            }
        } else {
            res.status(500).json({ error: 'Not a valid document id' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not find the document' });
    }
}

const updateOneBooks = async (req, res) => {
    const { judul, penulis, penerbit, tahun_terbit, sub_categories_id, genres_id, deskripsi_buku } = req.body
    const ObjectIdGenres = [];
    if (genres_id && genres_id.length > 0 && !/^[a-z0-9]{24}$/.test(genres_id)) {
        genres_id.forEach(id => {
            ObjectIdGenres.push(new ObjectId(id));
        });
    } else if (/^[a-z0-9]{24}$/.test(genres_id)) {
        ObjectIdGenres.push(new ObjectId(genres_id));
    } else {
        return res.status(400).json({ error: 'genres_id harus terdiri dari 24 karakter alfanumerik' });
    }
    const moments = moment().format();
    try {
        if (req.file != null) {
            const filename = Date.now().toString() + "." + req.file.originalname.split('.').pop();
            const storageRef = ref(storage, `cover-book/${filename}`);
            const metadata = {
                contentType: 'image/jpeg',
            }
            const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
            const downloadURL = await getDownloadURL(snapshot.ref)
            const updates = {
                judul,
                penulis,
                penerbit,
                tahun_terbit,
                deskripsi_buku,
                sampul_buku: downloadURL,
                sub_categories_id: new ObjectId(sub_categories_id),
                genres_id: ObjectIdGenres,
                updated_at: moments
            }
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
        } else {
            const updates = {
                judul,
                penulis,
                penerbit,
                tahun_terbit,
                deskripsi_buku,
                sub_categories_id: new ObjectId(sub_categories_id),
                genres_id: ObjectIdGenres,
                updated_at: moments
            }
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
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat melakukan update buku ' + error });
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
    getBooksMenu,
    getBooksTerbaru,
    postBooks,
    getOneBooksAll,
    getOneBooks,
    updateOneBooks,
    deleteOneBooks,
    searchBooks,
    searchDataBooks,
}
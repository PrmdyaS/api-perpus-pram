const { connectToDb, getDb } = require('../db')
const { ObjectId } = require('mongodb')
const moment = require('moment-timezone');

moment.tz.setDefault('Asia/Jakarta');


let db
connectToDb((err) => {
    if (!err) {
        db = getDb()
    }
})

// const getAllFavorites = (req, res) => {
// const page = parseInt(req.query.page) || 1;
// const limit = parseInt(req.query.limit) || 10;
// const skip = (page - 1) * limit;

//     let favorites = [];
//     db.collection('favorites')
//         .find()
//         .sort({ _id: 1 })
//         .skip(skip)
//         .limit(limit)
//         .forEach(favorite => favorites.push(favorite))
//         .then(() => {
//             res.status(200).json({
//                 message: "success",
//                 status: 200,
//                 data: favorites
//             });
//         })
//         .catch(() => {
//             res.status(500).json({ error: 'Could not fetch the documents' });
//         });

// }

// const getAllFavorites = (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     try {
//         db.collection('favorites').aggregate([
//             { $skip: skip },
//             { $limit: limit },
//             {
//                 $lookup: {
//                     from: 'books', // Nama koleksi yang akan Anda join
//                     localField: 'books_id', // Field di koleksi favorites
//                     foreignField: '_id', // Field di koleksi books
//                     as: 'bookData' // Nama field untuk menyimpan hasil join
//                 }
//             }
//         ]).toArray((err, favorites) => {
//             if (err) {
//                 res.status(500).json({ error: 'Could not fetch the documents' });
//             } else {
//                 res.status(200).json({
//                     message: "success",
//                     status: 200,
//                     data: favorites
//                 });
//             }
//         });
//     } catch (error) {
//         res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan favorit' });
//     }
// }

const getAllFavorites = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const cursor = db.collection('favorites').aggregate([
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'books',
                    as: 'books',
                    let: { booksId: "$books_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$booksId"] }
                                    ]
                                }
                            }
                        }
                    ]
                }
            }
        ]);
        const favorites = await cursor.toArray();

        if (favorites) {
            res.status(200).json({
                message: "success",
                status: 200,
                data: favorites
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data favorit' });
    }
}

const postFavorites = async (req, res) => {
    const { books_id, users_id } = req.body
    const moments = moment().format();
    const favorite = {
        books_id: new ObjectId(books_id),
        users_id: new ObjectId(users_id),
        created_atz: moments,
        updated_at: moments
    }
    try {
        const result = await db.collection('favorites').insertOne(favorite);
        res.json({
            message: "Tambah favorit berhasil",
            status: 200,
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat menambahkan favorit' });
    }
}

const getUsersFavorites = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        if (ObjectId.isValid(req.params.id)) {
            const cursor = db.collection('favorites').aggregate([
                { $match: { users_id: new ObjectId(req.params.id) } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'books',
                        as: 'books',
                        let: { booksId: "$books_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$booksId"] }
                                        ]
                                    }
                                }
                            }
                        ]
                    }
                }
            ]);
            const favorites = await cursor.toArray();

            if (favorites) {
                res.status(200).json({
                    message: "success",
                    status: 200,
                    data: favorites
                });
            }
        } else {
            res.status(500).json({ error: 'Not a valid document id' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data favorit' });
    }
}


const updateOneFavorites = (req, res) => {
    const updates = req.body
    const moments = moment().format();
    updates.updated_at = moments;
    if (ObjectId.isValid(req.params.id)) {
        db.collection('favorites')
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

const deleteOneFavorites = (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('favorites')
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
    getAllFavorites,
    postFavorites,
    getUsersFavorites,
    updateOneFavorites,
    deleteOneFavorites,
}
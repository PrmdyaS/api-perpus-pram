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

const getAllBorrowBooks = async (req, res) => {
    try {
        const cursor = db.collection('borrow_books').aggregate([
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
                        },
                        {
                            $project: {
                                _id: 1,
                                judul: 1,
                                penulis: 1,
                                penerbit: 1,
                                sampul_buku: 1,
                                rating: 1,
                            }
                        }
                    ]
                }
            },
            {
                $set: {
                    books: { $arrayElemAt: ["$books", 0] }
                }
            },
        ]);
        const borrowBooks = await cursor.toArray();

        if (borrowBooks) {
            res.status(200).json({
                message: "success",
                status: 200,
                data: borrowBooks
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not find the document' });
    }
}

const getBorrowBooksLaporan = async (req, res) => {
    try {
        const cursor = db.collection('borrow_books').aggregate([
            {
                $match: {
                    status: { $in: ["Dipinjam", "Tepat Waktu", "Denda", "Denda Lunas"] }
                }
            },
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
                        },
                        {
                            $project: {
                                judul: 1,
                            }
                        }
                    ]
                }
            },
            {
                $set: {
                    books: { $arrayElemAt: ["$books", 0] }
                }
            },
            {
                $lookup: {
                    from: 'user',
                    as: 'users',
                    let: { usersId: "$users_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$usersId"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                username: 1,
                            }
                        }
                    ]
                }
            },
            {
                $set: {
                    users: { $arrayElemAt: ["$users", 0] }
                }
            },
            {
                $project: {
                    users_id: 0,
                    books_id: 0,
                    created_at: 0,
                    updated_at: 0,
                    review: 0,
                    denda: 0,
                }
            },
            {
                $sort: { borrowing_date: 1 }
            }
        ]);
        const borrowBooks = await cursor.toArray();

        if (borrowBooks) {
            res.status(200).json({
                message: "success",
                status: 200,
                data: borrowBooks
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not find the document' });
    }
}

const getBorrowBooksLaporanDenda = async (req, res) => {
    try {
        const cursor = db.collection('borrow_books').aggregate([
            {
                $match: {
                    status: { $in: ["Denda Lunas"] }
                }
            },
            {
                $lookup: {
                    from: 'user',
                    as: 'users',
                    let: { usersId: "$users_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$usersId"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                username: 1,
                            }
                        }
                    ]
                }
            },
            {
                $set: {
                    users: { $arrayElemAt: ["$users", 0] }
                }
            },
            {
                $lookup: {
                    from: 'denda',
                    as: 'dendas',
                    let: { dendaId: "$denda_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$dendaId"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                payment_method: 1,
                                payment_date: 1,
                                user_id_officer: 1,
                                bukti_pembayaran: 1,
                            }
                        },
                        {
                            $lookup: {
                                from: 'user',
                                as: 'officer',
                                let: { userIdOfficer: "$user_id_officer" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$_id", "$$userIdOfficer"] }
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            username: 1,
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $set: {
                                officer: { $arrayElemAt: ["$officer", 0] }
                            }
                        },
                    ]
                }
            },
            {
                $set: {
                    dendas: { $arrayElemAt: ["$dendas", 0] }
                }
            },
            {
                $project: {
                    users_id: 0,
                    books_id: 0,
                    created_at: 0,
                    updated_at: 0,
                    review: 0,
                    denda_id: 0,
                }
            },
            {
                $sort: { borrowing_date: 1 }
            }
        ]);
        const borrowBooks = await cursor.toArray();

        if (borrowBooks) {
            res.status(200).json({
                message: "success",
                status: 200,
                data: borrowBooks
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not find the document' });
    }
}

const getBorrowBooksUsers = async (req, res) => {
    try {
        if (ObjectId.isValid(req.params.id)) {
            const cursor = db.collection('borrow_books').aggregate([
                {
                    $match: { users_id: new ObjectId(req.params.id), status: { $in: ["Dipinjam", "Denda", "Menunggu Verifikasi"] } }
                },
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
                            },
                            {
                                $project: {
                                    judul: 1,
                                    penulis: 1,
                                    sampul_buku: 1,
                                }
                            }
                        ]
                    }
                },
                {
                    $set: {
                        books: { $arrayElemAt: ["$books", 0] }
                    }
                },
                {
                    $project: {
                        users_id: 0,
                        books_id: 0
                    }
                },
                {
                    $sort: { created_at: -1 }
                },
            ]);
            const borrowBooks = await cursor.toArray();
            if (borrowBooks) {
                res.status(200).json({
                    message: "success",
                    status: 200,
                    data: borrowBooks
                });
            }
        } else {
            res.status(500).json({ error: 'Not a valid document id' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not find the document' });
    }
}

const getHistoryBorrowBooksUsers = async (req, res) => {
    try {
        if (ObjectId.isValid(req.params.id)) {
            const cursor = db.collection('borrow_books').aggregate([
                {
                    $match: { users_id: new ObjectId(req.params.id), status: { $in: ["Tepat Waktu", "Denda Lunas", "Dibatalkan"] } }
                },
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
                            },
                            {
                                $project: {
                                    judul: 1,
                                    penulis: 1,
                                    sampul_buku: 1,
                                }
                            }
                        ]
                    }
                },
                {
                    $set: {
                        books: { $arrayElemAt: ["$books", 0] }
                    }
                },
                {
                    $project: {
                        users_id: 0,
                        books_id: 0
                    }
                },
                {
                    $sort: { created_at: -1 }
                },
            ]);
            const borrowBooks = await cursor.toArray();
            if (borrowBooks) {
                res.status(200).json({
                    message: "success",
                    status: 200,
                    data: borrowBooks
                });
            }
        } else {
            res.status(500).json({ error: 'Not a valid document id' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not find the document' });
    }
}

const getOneBorrowBooks = async (req, res) => {
    try {
        if (ObjectId.isValid(req.params.id)) {
            const cursor = db.collection('borrow_books').aggregate([
                {
                    $match: { _id: new ObjectId(req.params.id) }
                },
                {
                    $lookup: {
                        from: 'user',
                        as: 'users',
                        let: { usersId: "$users_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$usersId"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    username: 1,
                                }
                            }
                        ]
                    }
                },
                {
                    $set: {
                        users: { $arrayElemAt: ["$users", 0] }
                    }
                },
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
                            },
                            {
                                $project: {
                                    judul: 1,
                                    sampul_buku: 1,
                                }
                            }
                        ]
                    }
                },
                {
                    $set: {
                        books: { $arrayElemAt: ["$books", 0] }
                    }
                },
                {
                    $project: {
                        users_id: 0,
                        books_id: 0
                    }
                },
            ]);
            const borrowBooks = await cursor.next();
            if (borrowBooks) {
                res.status(200).json({
                    message: "success",
                    status: 200,
                    data: borrowBooks
                });
            } else {
                res.status(400).json({
                    message: "Data tidak ditemukan",
                    status: 400
                });
            }
        } else {
            res.status(500).json({ error: 'Not a valid document id' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not find the document' });
    }
}

const postAllBorrowBooks = async (req, res) => {
    const { users_id, books_id, borrowing_date, return_date } = req.body
    const moments = moment().format();
    const borrow_books = {
        users_id: new ObjectId(users_id),
        books_id: new ObjectId(books_id),
        borrowing_date,
        return_date,
        status: 'Menunggu Verifikasi',
        created_at: moments,
        updated_at: moments,
    }
    try {
        const result = await db.collection('borrow_books').insertOne(borrow_books);
        res.json({
            message: "Create Success",
            status: 200,
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not create the document' });
    }
}

const updateOneBorrowBooks = (req, res) => {
    const { denda_id } = req.body
    const updates = req.body
    if (denda_id) {
        delete updates.denda_id;
        updates.denda_id = new ObjectId(denda_id);
    }
    if (ObjectId.isValid(req.params.id)) {
        db.collection('borrow_books')
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

const deleteOneBorrowBooks = (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('borrow_books')
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
    getAllBorrowBooks,
    getBorrowBooksLaporan,
    getBorrowBooksLaporanDenda,
    postAllBorrowBooks,
    getBorrowBooksUsers,
    getHistoryBorrowBooksUsers,
    getOneBorrowBooks,
    updateOneBorrowBooks,
    deleteOneBorrowBooks,
}
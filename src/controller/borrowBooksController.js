const { connectToDb, getDb } = require('../db')
const { ObjectId } = require('mongodb')

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

const postAllBorrowBooks = async (req, res) => {
    const { users_id, books_id, borrowing_date, return_date } = req.body
    const borrow_books = {
        users_id: new ObjectId(users_id),
        books_id: new ObjectId(books_id),
        borrowing_date,
        return_date,
        status: 'Dipinjam',
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
    const updates = req.body
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
    postAllBorrowBooks,
    updateOneBorrowBooks,
    deleteOneBorrowBooks,
}
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

const getAllReviews = async (req, res) => {
    try {
        const cursor = db.collection('reviews').aggregate([
            {
                $lookup: {
                    from: 'borrow_books',
                    localField: 'borrow_books_id',
                    foreignField: '_id',
                    as: 'borrow_books',
                    pipeline: [
                        {
                            $project: {
                                users_id: 1,
                                books_id: 1,
                            }
                        },
                        {
                            $lookup: {
                                from: 'user',
                                localField: 'users_id',
                                foreignField: '_id',
                                as: 'users',
                                pipeline: [
                                    {
                                        $project: {
                                            username: 1,
                                            profile_picture: 1,
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
                    ]
                }
            },
            {
                $set: {
                    borrow_books: { $arrayElemAt: ["$borrow_books", 0] }
                }
            },
            {
                $project: {
                    updated_at: 0
                }
            },
        ]);
        const reviews = await cursor.toArray();

        if (reviews) {
            res.status(200).json({
                message: "success",
                status: 200,
                data: reviews
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not find the document' });
    }
}

const getAllReviewsBooks = async (req, res) => {
    try {
        if (ObjectId.isValid(req.params.id)) {
            const cursor = db.collection('reviews').aggregate([
                {
                    $lookup: {
                        from: 'borrow_books',
                        localField: 'borrow_books_id',
                        foreignField: '_id',
                        as: 'borrow_books',
                        pipeline: [
                            {
                                $project: {
                                    users_id: 1,
                                    books_id: 1,
                                }
                            },
                            {
                                $lookup: {
                                    from: 'user',
                                    localField: 'users_id',
                                    foreignField: '_id',
                                    as: 'users',
                                    pipeline: [
                                        {
                                            $project: {
                                                username: 1,
                                                profile_picture: 1,
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
                        ]
                    }
                },
                {
                    $set: {
                        borrow_books: { $arrayElemAt: ["$borrow_books", 0] }
                    }
                },
                {
                    $match: {
                        "borrow_books.books_id": new ObjectId(req.params.id)
                    }
                },
                {
                    $project: {
                        updated_at: 0
                    }
                },
            ]);
            const reviews = await cursor.toArray();
    
            if (reviews) {
                res.status(200).json({
                    message: "success",
                    status: 200,
                    data: reviews
                });
            }
        } else {
            res.status(500).json({ error: 'Not a valid document id' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not find the document' });
    }
}

const getAllReviewsBooksUsers = async (req, res) => {
    const users_id = req.query.users_id;
    const books_id = req.query.books_id;
    try {
        const cursor = db.collection('reviews').aggregate([
            {
                $lookup: {
                    from: 'borrow_books',
                    localField: 'borrow_books_id',
                    foreignField: '_id',
                    as: 'borrow_books',
                    pipeline: [
                        {
                            $project: {
                                users_id: 1,
                                books_id: 1,
                            }
                        },
                        {
                            $lookup: {
                                from: 'user',
                                localField: 'users_id',
                                foreignField: '_id',
                                as: 'users',
                                pipeline: [
                                    {
                                        $project: {
                                            username: 1,
                                            profile_picture: 1,
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
                    ]
                }
            },
            {
                $set: {
                    borrow_books: { $arrayElemAt: ["$borrow_books", 0] }
                }
            },
            {
                $match: {
                    "borrow_books.books_id": new ObjectId(books_id),
                    "borrow_books.users_id": new ObjectId(users_id)
                }
            },
            {
                $project: {
                    updated_at: 0
                }
            },
        ]);
        const reviews = await cursor.toArray();

        if (reviews) {
            res.status(200).json({
                message: "success",
                status: 200,
                data: reviews
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not find the document' });
    }
}

const postReviews = async (req, res) => {
    const { borrow_books_id, rating, review_text } = req.body
    const moments = moment().format();
    const reviews = {
        borrow_books_id: new ObjectId(borrow_books_id),
        rating: parseInt(rating),
        review_text,
        created_at: moments,
        updated_at: moments,
    }
    try {
        const result = await db.collection('reviews').insertOne(reviews);
        const cursor = db.collection('reviews').aggregate([
            {
                $match: { _id: new ObjectId(result.insertedId) }
            },
            {
                $lookup: {
                    from: 'borrow_books',
                    localField: 'borrow_books_id',
                    foreignField: '_id',
                    as: 'borrow_books',
                    pipeline: [
                        {
                            $project: {
                                books_id: 1,
                            }
                        },
                    ]
                }
            },
            {
                $set: {
                    borrow_books: { $arrayElemAt: ["$borrow_books", 0] }
                }
            },
            {
                $project: {
                    rating: 0,
                    review_text: 0,
                    created_at: 0,
                    updated_at: 0
                }
            },
        ]);
        const reviewList = await cursor.toArray();
        const booksId = reviewList.map(review => review.borrow_books.books_id.toString());
        const cursor1 = db.collection('reviews').aggregate([
            {
                $lookup: {
                    from: 'borrow_books',
                    localField: 'borrow_books_id',
                    foreignField: '_id',
                    as: 'borrow_books',
                    pipeline: [
                        {
                            $project: {
                                books_id: 1,
                            }
                        },
                    ]
                }
            },
            {
                $set: {
                    borrow_books: { $arrayElemAt: ["$borrow_books", 0] }
                }
            },
            {
                $match: {
                    "borrow_books.books_id": new ObjectId(booksId[0])
                }
            },
            {
                $project: {
                    review_text: 0,
                    created_at: 0,
                    updated_at: 0
                }
            },
        ]);
        const ratingList = await cursor1.toArray();
        const totalRating = ratingList.reduce((total, item) => total + item.rating, 0);
        const averageRating = totalRating / ratingList.length;
        const updatesBooks = {
            rating: averageRating.toFixed(1),
            updated_at: moments
        }
        const updatesBorrowBooks = {
            review: 1
        }
        db.collection('books').updateOne({ _id: new ObjectId(booksId[0]) }, { $set: updatesBooks })
        db.collection('borrow_books').updateOne({ _id: new ObjectId(borrow_books_id) }, { $set: updatesBorrowBooks })
        res.json({
            message: "Create Success",
            status: averageRating.toFixed(1),
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not create the document' });
    }
}

const updateOneReviews = async (req, res) => {
    const { rating, review_text } = req.body
    const moments = moment().format();
    const updates = {
        rating: parseInt(rating),
        review_text,
        updated_at: moments,
    }
    if (ObjectId.isValid(req.params.id)) {
        db.collection('reviews')
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
        const cursor = db.collection('reviews').aggregate([
            {
                $match: { _id: new ObjectId(req.params.id) }
            },
            {
                $lookup: {
                    from: 'borrow_books',
                    localField: 'borrow_books_id',
                    foreignField: '_id',
                    as: 'borrow_books',
                    pipeline: [
                        {
                            $project: {
                                books_id: 1,
                            }
                        },
                    ]
                }
            },
            {
                $set: {
                    borrow_books: { $arrayElemAt: ["$borrow_books", 0] }
                }
            },
            {
                $project: {
                    rating: 0,
                    review_text: 0,
                    created_at: 0,
                    updated_at: 0
                }
            },
        ]);
        const reviewList = await cursor.toArray();
        const booksId = reviewList.map(review => review.borrow_books.books_id.toString());
        const cursor1 = db.collection('reviews').aggregate([
            {
                $lookup: {
                    from: 'borrow_books',
                    localField: 'borrow_books_id',
                    foreignField: '_id',
                    as: 'borrow_books',
                    pipeline: [
                        {
                            $project: {
                                books_id: 1,
                            }
                        },
                    ]
                }
            },
            {
                $set: {
                    borrow_books: { $arrayElemAt: ["$borrow_books", 0] }
                }
            },
            {
                $match: {
                    "borrow_books.books_id": new ObjectId(booksId[0])
                }
            },
            {
                $project: {
                    review_text: 0,
                    created_at: 0,
                    updated_at: 0
                }
            },
        ]);
        const ratingList = await cursor1.toArray();
        const totalRating = ratingList.reduce((total, item) => total + item.rating, 0);
        const averageRating = totalRating / ratingList.length;
        const updatesBooks = {
            rating: averageRating.toFixed(1),
            updated_at: moments
        }
        db.collection('books').updateOne({ _id: new ObjectId(booksId[0]) }, { $set: updatesBooks })
    } else {
        res.status(500).json({ error: 'Not a valid document id' })
    }
}

const deleteOneReviews = (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('reviews')
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
    getAllReviews,
    getAllReviewsBooks,
    getAllReviewsBooksUsers,
    postReviews,
    updateOneReviews,
    deleteOneReviews,
}
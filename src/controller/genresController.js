const { connectToDb, getDb } = require('../db')
const { ObjectId } = require('mongodb')

let db
connectToDb((err) => {
    if (!err) {
        db = getDb()
    }
})

const getAllGenres = async (req, res) => {
    let genres = [];
    db.collection('genres')
        .find()
        .forEach(genre => genres.push(genre))
        .then(() => {
            res.status(200).json({
                message: "success",
                status: 200,
                data: genres
            });
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' });
        });
}

const postGenres = async (req, res) => {
    const genres = req.body
    try {
        const result = await db.collection('genres').insertOne(genres);
        res.json({
            message: "Create Success",
            status: 200,
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not create the document' });
    }
}

const updateOneGenres = (req, res) => {
    const updates = req.body
    if (ObjectId.isValid(req.params.id)) {
        db.collection('genres')
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

const deleteOneGenres = (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('genres')
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
    getAllGenres,
    postGenres,
    updateOneGenres,
    deleteOneGenres,
}
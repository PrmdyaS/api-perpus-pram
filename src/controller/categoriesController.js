const { connectToDb, getDb } = require('../db')
const { ObjectId } = require('mongodb')

let db
connectToDb((err) => {
    if (!err) {
        db = getDb()
    }
})

const getAllCategories = async (req, res) => {
    let categories = [];
    db.collection('categories')
        .find()
        .forEach(category => categories.push(category))
        .then(() => {
            res.status(200).json({
                message: "success",
                status: 200,
                data: categories
            });
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' });
        });
}

const postCategories = async (req, res) => {
    const categories = req.body
    try {
        const result = await db.collection('categories').insertOne(categories);
        res.json({
            message: "Create Success",
            status: 200,
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not create the document' });
    }
}

const updateOneCategories = (req, res) => {
    const updates = req.body
    if (ObjectId.isValid(req.params.id)) {
        db.collection('categories')
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

const deleteOneCategories = (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('categories')
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
    getAllCategories,
    postCategories,
    updateOneCategories,
    deleteOneCategories,
}
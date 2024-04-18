const { connectToDb, getDb } = require('../db')
const { ObjectId } = require('mongodb')

let db
connectToDb((err) => {
    if (!err) {
        db = getDb()
    }
})

const getAllSubCategories = async (req, res) => {
    try {
        const cursor = db.collection('sub_categories').aggregate([
            {
                $lookup: {
                    from: 'categories',
                    as: 'categories',
                    let: { categoriesId: "$categories_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$categoriesId"] }
                                    ]
                                }
                            }
                        }
                    ]
                }
            },
            { $sort: { index: -1 } }
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

const getSubCategoriesList = async (req, res) => {
    let sub_categories = [];
    db.collection('sub_categories')
        .find()
        .sort({ sub_categories_name: -1 })
        .forEach(sub_categori => {
            sub_categories.push({
                _id: sub_categori._id,
                sub_categories_name: sub_categori.sub_categories_name,
            });
        })
        .then(() => {
            res.status(200).json({
                message: "success",
                status: 200,
                data: sub_categories
            });
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' });
        });
}

const postSubCategories = async (req, res) => {
    const { categories_id, sub_categories_name } = req.body
    const sub_categories = {
        categories_id: new ObjectId(categories_id),
        sub_categories_name
    }
    try {
        const result = await db.collection('sub_categories').insertOne(sub_categories);
        res.json({
            message: "Create Success",
            status: 200,
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not create the document' });
    }
}

const updateOneSubCategories = (req, res) => {
    const updates = req.body
    if (ObjectId.isValid(req.params.id)) {
        db.collection('sub_categories')
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

const deleteOneSubCategories = (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('sub_categories')
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
    getAllSubCategories,
    getSubCategoriesList,
    postSubCategories,
    updateOneSubCategories,
    deleteOneSubCategories,
}
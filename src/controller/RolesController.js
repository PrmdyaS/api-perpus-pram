const { connectToDb, getDb } = require('../db')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb')

let db
connectToDb((err) => {
    if (!err) {
        db = getDb()
    }
})

const getAllRoles = (req, res) => {
    let role = []
    db.collection('roles')
        .find()
        .sort({ index_level: 1 })
        .forEach(roles => role.push(roles))
        .then(() => {
            res.status(200).json(
                {
                    message: "success",
                    status: 200,
                    data: role
                }
            )
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' })
        })
}

const postRoles = async (req, res) => {
    const { index_level, role_name } = req.body;
    try {
        const existingRoles = await db.collection('roles').findOne({ index_level });
        if (existingRoles) {
            return res.status(401).json({
                message: "Index Roles sudah ada",
                status: 401
            });
        }
        const roles = {
            index_level,
            role_name,
        };
        const result = await db.collection('roles').insertOne(roles);
        res.json({
            message: "success",
            status: 200,
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not create the document' });
    }
}

const deleteOneRoles = (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('roles')
            .deleteOne({ _id: new ObjectId(req.params.id) })
            .then(result => {
                res.status(200).json({
                    message: "success",
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
    getAllRoles,
    postRoles,
    deleteOneRoles,
}
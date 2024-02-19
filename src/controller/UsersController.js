const { connectToDb, getDb } = require('../db')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb')

let db
connectToDb((err) => {
    if (!err) {
        db = getDb()
    }
})

const getAllUsers = (req, res) => {
    let user = []
    db.collection('user')
        .find()
        .sort({ email: 1 })
        .forEach(users => user.push(users))
        .then(() => {
            res.status(200).json(
                {
                    message: "success",
                    status: 200,
                    data: user
                }
            )
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' })
        })
}

const postUsers = async (req, res) => {
    const { email, password, username, nama_lengkap, alamat, no_hp } = req.body;

    try {
        const existingEmail = await db.collection('user').findOne({ email });
        if (existingEmail) {
            return res.status(401).json({
                message: "Email sudah terdaftar",
                status: 401
            });
        }

        if (username == '') {
            res.status(201).json(
                {
                    message: "Username kosong",
                    status: 201,
                }
            );
        } else {
            const existingUsername = await db.collection('user').findOne({ username });
            if (existingUsername) {
                return res.status(401).json({
                    message: "Username sudah terdaftar",
                    status: 401
                });
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const newUser = {
                email,
                password: hashedPassword,
                username,
                nama_lengkap,
                alamat,
                no_hp,
            };
            const result = await db.collection('user').insertOne(newUser);
            const dataUser = await db.collection('user').findOne({ _id: new ObjectId(result.insertedId) });
            res.status(200).json({
                message: "Registrasi berhasil",
                status: 200,
                data: dataUser
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat melakukan registrasi' });
    }
}

const getOneUsers = (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('user')
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

const updateOneUsers = (req, res) => {
    const updates = req.body
    if (ObjectId.isValid(req.params.id)) {
        db.collection('user')
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

const deleteOneUsers = (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('user')
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

const loginUsers = async (req, res) => {
    const { email, password } = req.body;
    const user = await db.collection('user').findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Email tidak ditemukan' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return res.status(401).json({ message: 'Password tidak cocok' });
    }

    res.status(200).json(
        {
            message: "Login Success",
            status: 200,
            data: user
        }
    );
}

module.exports = {
    getAllUsers,
    postUsers,
    getOneUsers,
    updateOneUsers,
    deleteOneUsers,
    loginUsers,
}
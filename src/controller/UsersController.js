const { connectToDb, getDb } = require('../db')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb')

let db
connectToDb((err) => {
    if (!err) {
        db = getDb()
    }
})

const getAllUsers = async (req, res) => {
    try {
        const cursor = db.collection('user').aggregate([
            {
                $lookup: {
                    from: 'roles',
                    as: 'roles',
                    let: { indexLevelRoles: "$index_level_roles" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$index_level", "$$indexLevelRoles"] }
                                    ]
                                }
                            }
                        },
                    ]
                }
            },
            {
                $set: {
                    roles: { $arrayElemAt: ["$roles", 0] }
                }
            },
            {
                $project: {
                    password: 0
                }
            }
        ]);
        const users = await cursor.toArray();

        if (users) {
            res.status(200).json({
                message: "success",
                status: 200,
                data: users
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not find the document' });
    }
}

const postUsers = async (req, res) => {
    const { email, password, username, nama_lengkap, alamat, no_hp, index_level_roles, profile_picture } = req.body;

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
                index_level_roles,
                profile_picture,
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

const getOneUsers = async (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
            try {
                const cursor = db.collection('user').aggregate([
                    {
                        $match: { _id: new ObjectId(req.params.id) }
                    },
                    {
                        $lookup: {
                            from: 'roles',
                            as: 'roles',
                            let: { indexLevelRoles: "$index_level_roles" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$index_level", "$$indexLevelRoles"] }
                                            ]
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        index_level: 0
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $set: {
                            roles: { $arrayElemAt: ["$roles", 0] }
                        }
                    },
                    {
                        $project: {
                            email: 0,
                            password: 0,
                            index_level_roles: 0
                        }
                    }
                ]);
                const users = await cursor.next();
        
                if (users) {
                    res.status(200).json({
                        message: "success",
                        status: 200,
                        data: users
                    });
                }
            } catch (error) {
                res.status(500).json({ error: 'Could not find the document' });
            }
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

    delete user.password;

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
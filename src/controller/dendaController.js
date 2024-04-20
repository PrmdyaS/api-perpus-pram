const { connectToDb, getDb } = require('../db')
const { ObjectId } = require('mongodb')
const firebase = require('firebase/app')
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage')
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta');

let db
connectToDb((err) => {
    if (!err) {
        db = getDb()
    }
})

const firebaseConfig = {
    apiKey: "AIzaSyAs9mhKG_PzO9yzZIPafT1MCMOF1GgF0IY",
    authDomain: "perpus-pram.firebaseapp.com",
    projectId: "perpus-pram",
    storageBucket: "perpus-pram.appspot.com",
    messagingSenderId: "928477389217",
    appId: "1:928477389217:web:2e7d0f0bd2271814b06be0",
    measurementId: "G-QVK4YNSPFW"
};

firebase.initializeApp(firebaseConfig)
const storage = getStorage();

const getAllDenda = async (req, res) => {
    let denda = [];
    db.collection('denda')
        .find()
        .forEach(category => denda.push(category))
        .then(() => {
            res.status(200).json({
                message: "success",
                status: 200,
                data: denda
            });
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' });
        });
}

const postDenda = async (req, res) => {
    const { payment_method, user_id_officer } = req.body;
    const filename = Date.now().toString() + "." + req.file.originalname.split('.').pop();
    const storageRef = ref(storage, `bukti-pembayaran/${filename}`);
    const moments = moment().format();
    try {
        const metadata = {
            contentType: 'image/jpeg',
        }
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref)
        const newDenda = {
            payment_method,
            user_id_officer,
            payment_date: moments,
            bukti_pembayaran: downloadURL,
        };
        const result = await db.collection('denda').insertOne(newDenda);
        res.json({
            message: "Create Success",
            status: 200,
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not create the document' });
    }
}

const deleteOneDenda = (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection('denda')
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
    getAllDenda,
    postDenda,
    deleteOneDenda,
}
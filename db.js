const { MongoClient } = require('mongodb')
let dbConnection
let uri = 'mongodb+srv://peram24:sebenereikitesapi123@cluster0.fice8cu.mongodb.net/?retryWrites=true&w=majority'

module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect(uri)
        .then((client) => {
            dbConnection = client.db()
            return cb()
        })
        .catch(err => {
            console.log(err)
            return cb(err)
        })
    },
    getDb: () => dbConnection
}
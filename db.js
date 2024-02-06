const { MongoClient } = require('mongodb')
let dbConnection
let uri = 'mongodb+srv://peram:peramgtg123@perpuspram.abbm2pe.mongodb.net/?retryWrites=true&w=majority'

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
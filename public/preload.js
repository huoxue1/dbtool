
const {MongoClient } = require('mongodb');


function createMongoDB(connectionString) {
    return new MongoClient(connectionString);
}

window.preload = {
    createMongoDB
}

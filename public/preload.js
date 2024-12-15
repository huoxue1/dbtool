
const {MongoClient } = require('mongodb');

const fs = require('fs');


function createMongoDB(connectionString) {
    return new MongoClient(connectionString);
}

function readFileAsync(filePath, encoding) {  
    return new Promise((resolve, reject) => {  
      fs.readFile(filePath, encoding, (error, data) => {  
        if (error) {  
          reject(error);  
        } else {  
          resolve(data);  
        }  
      });  
    });  
  }  


  function writeFileAsync(filePath, data, encoding) {  
    return new Promise((resolve, reject) => {  
      fs.writeFile(filePath, data, encoding, (error) => {  
        if (error) {  
          reject(error);  
        } else {  
          resolve();  
        }  
      });  
    });  
  }  

  function writeFileStream(filePath,  flag = 'a',encoding = 'utf-8',autoClose = true) {
    return fs.createWriteStream(filePath, {flags: flag,encoding: encoding,autoClose: autoClose});
  }


window.preload = {
    createMongoDB,
    readFileAsync,
    writeFileAsync,
    writeFileStream
}

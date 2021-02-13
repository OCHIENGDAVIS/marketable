const mongoose = require('mongoose');
const config = require('config')

const db_connect = async () => {
  try {
    await mongoose.connect(
      config.get('mongoURI'),
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
      }
    );
    console.log(' database Connected succesfully!');
  } catch (error) {
    console.log(`EROR!: ${error}`);
  }
};
module.exports = db_connect;

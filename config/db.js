const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURIDev');

const connect_db = async () => {
  try {
    await mongoose.connect(db, {
      useUnifiedTopology: true,
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    });
    console.log('mong Db connectec.... ');
  } catch (error) {
    console.log(`ERROR: ${error}`);
    process.exit(1); // exting the process with failure
  }
};

module.exports = connect_db;

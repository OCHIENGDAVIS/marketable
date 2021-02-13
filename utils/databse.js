const mongoose = require('mongoose');

const db_connect = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://taskmanagerapp:platenium_1994@cluster0.wb2v0.mongodb.net/marketable?retryWrites=true&w=majority',
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

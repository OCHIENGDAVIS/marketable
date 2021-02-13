const express = require('express');

const connect_db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// connect to the database
connect_db();

// init middlewares
app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
  res.send('API is running');
});

// define routes
app.use('/api/users', require('./routes/api/user'));
app.use('/api/posts', require('./routes/api/post'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));

app.listen(PORT, () => console.log(`Server stated at port ${PORT}`));

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express')
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const swaggerFile = require('./swagger_output.json');
const authRoutes = require('./routes/auth');
const rolesRoutes = require('./routes/roles');
// const usersRoutes = require('./routes/users');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.u9j79.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();
const port = 8080;

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'images') },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
});

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' } //=> to append new logs to the file without delete old logs
);

app.use(helmet()); //=> add important headers to response (for production)
app.use(compression()); //=> to minimize assets files (for production)
app.use(morgan('combined', { stream: accessLogStream })); //=> for logging

app.use(bodyParser.json()); // application/json
app.use(multer({ storage: fileStorage }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(authRoutes);
app.use(rolesRoutes);
// app.use(usersRoutes);

app.use((error, req, res, next) => {
    console.error(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const errors = error.data;
    res.status(status).json({ message: message, errors: errors });
});

app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerFile)); // => https://medium.com/swlh/automatic-api-documentation-in-node-js-using-swagger-dd1ab3c78284

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        app.listen(process.env.PORT || port, () => console.log(`app listening on http://localhost:${port}`));
    })
    .catch(err => console.error(err));
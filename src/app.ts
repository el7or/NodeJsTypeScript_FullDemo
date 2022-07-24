import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import authRoutes from './routes/auth';
import rolesRoutes from './routes/roles';
//import usersRoutes from './routes/users';
const swaggerFile = require('./swagger_output.json');

const MONGODB_URI = `mongodb+srv://node_test:node_test@cluster0.u9j79.mongodb.net/test-node?retryWrites=true&w=majority`;

const app = express();
const port = 8080;

const fileStorage = multer.diskStorage({
    destination: (req: any, file: any, cb: (arg0: null, arg1: string) => void) => { cb(null, 'images') },
    filename: (req: any, file: { originalname: string; }, cb: (arg0: null, arg1: string) => void) => {
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

app.use((error: any, req: any, res: any, next: any) => {
    console.error(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const errors = error.data;
    res.status(status).json({ message: message, errors: errors });
});

app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerFile)); // => https://medium.com/swlh/automatic-api-documentation-in-node-js-using-swagger-dd1ab3c78284

mongoose
    .connect(MONGODB_URI)
    .then((result: any) => {
        app.listen(process.env.PORT || port, () => console.log(`app listening on http://localhost:${port}`));
    })
    .catch((err: any) => console.error(err));
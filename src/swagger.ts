const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
const endpointsFiles = ['./routes/auth.js', './routes/roles.js'];
const doc = {
    info: {
        title: 'Rest API',
        description: '',
    },
    host: process.env.NODE_ENV === 'production' ? 'node-mongoose-restapi.herokuapp.com' : 'localhost:8080',
    schemes: [process.env.NODE_ENV === 'production' ? 'https' : 'http']
};

swaggerAutogen(outputFile, endpointsFiles, doc)
    .then(() => {
        if (process.env.NODE_ENV === 'production') require('./app.js');
    })
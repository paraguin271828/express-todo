require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
//const pool = require('./env/psql');
const { Pool } = require('pg');

const port = 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true } ));

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

app.get('/', (req, res) => {
    pool.connect((err, client) => {
        if (err) return console.error('Database connection error.');

        client.query('SELECT * FROM todolist', (err, result) => {
            if (err) return console.error('Query error.');

            res.send(result.rows);
        });
    });
});

app.listen(port, () => {
    console.log(`Server listening on ${port}`)
});

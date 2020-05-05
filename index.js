const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./env/database');

const port = 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true } ));

const successResult = {request: 'successful'};

// GET all Todo items
app.get('/', (req, res) => {
    pool.connect((err, client, release) => {
        if (err) return console.error('Database connection error.');

        client.query('SELECT * FROM todolist', (err, result) => {
            release();
            if (err) return console.error('Query error: ' + err);
            else res.json(successResult);
        });
    });
});

// GET only one Todo item by its ID
app.get('/:id', (req, res) => {
    const id = req.params.id;

    pool.connect((err, client, release) => {
        if (err) return console.error('Database connection error.');

        client.query('SELECT * FROM todolist WHERE id = $1', [id], (err, result) => {
            release();
            if (err) return console.error('Query error:' + err);
            else res.send(successResult);
        });
    });
});

// INSERT new Todo item to the list
app.post('/', (req, res) => {
    const title = req.body.title;
    const desc = req.body.description;

    // since it's only one query, use the shorthand connection
    // to run a query on the first available idle client
    // lines above with the connect methods are just to try out different approaches

    pool.query('INSERT INTO todolist (title, description, created, done) VALUES ($1, $2, current_timestamp, false)', [title, desc], (err, result) => {
      if (err) console.error('Could not create new Todo item. ' + err);
      else {
          res.send(successResult);
          console.log('Todo item created successfully.');
        };
    });
});

// UPDATE existing Todo item with new values
app.put('/:id', (req, res) => {
    const id = req.params.id;

    pool.query('UPDATE todolist SET done = true WHERE id = $1', [id], (err, result) => {
        if (err) return console.error('Query error: ' + err);
        else {
            console.log(`Todo item ${id} successfully marked as done.`);
            res.send(successResult);
        }
    });
});


// DELETE Todo item by its ID
app.delete('/:id', (req, res) => {
    const id = req.params.id;

    pool.query('DELETE FROM todolist WHERE id = $1', [id], (err, result) => {
        if (err) return console.error('Could not delete item. ' + err);
        else {
            console.log(`Deleted Todo item ${id}.`);
            res.send(successResult);
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening on ${port}`)
});

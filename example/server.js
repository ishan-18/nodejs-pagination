const express = require('express');
const mongoose = require('mongoose');
const { paginateWithOffset, paginateWithCursor } = require('../index');

const app = express();
const port = 3000;

const Schema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    name: String,
    age: Number,
});

const Model = mongoose.model('Person', Schema);

const insertDummyData = async () => {
    try {
        await Model.create([
            { name: 'Alice', age: 30 },
            { name: 'Bob', age: 25 },
            { name: 'Charlie', age: 35 },
            { name: 'David', age: 28 },
        ]);
        console.log('Dummy data inserted successfully');
    } catch (error) {
        console.error('Error inserting dummy data:', error);
    }
};

app.get('/offset-paginate', async (req, res) => {
    try {
        const { page = 1, perPage = 2, sortField = 'age', sortDirection = 1 } = req.query;

        const parsedPage = parseInt(page) || 1;
        const parsedPerPage = parseInt(perPage) || 2;
        const parsedSortDirection = parseInt(sortDirection) || 1;

        const paginationOptions = {
            page: parsedPage,
            perPage: parsedPerPage,
            sortField,
            sortDirection: parsedSortDirection,
        };

        const result = await paginateWithOffset(Model, {}, paginationOptions);

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/cursor-paginate', async (req, res) => {
    try {
        const { cursor, limit } = req.query;
        const pageSize = parseInt(limit) || 5;

        const query = {};
        const result = await paginateWithCursor(Model, query, cursor, pageSize);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

mongoose.connect('mongodb://localhost:27017/mydb')
    .then(() => {
        console.log('Connected to MongoDB');

        insertDummyData();

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(err => {
        console.error(err);
    });

/**
 * Offset pagination - cURL
 * http://localhost:3000/offset-paginate?page=1&perPage=10&sortField=age&sortDirection=1
 * 
 * Cursor pagination - cURL
 * http://localhost:3000/paginate?cursor=65195af07b3e2a58d254e96f
**/

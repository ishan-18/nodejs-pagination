# nodejs-pagination

This repository contains two pagination functions for Mongoose models: `paginateWithOffset` and `paginateWithCursor`. These functions allow you to easily implement offset-based and cursor-based pagination in your Node.js and Mongoose projects.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Caching](#caching)
- [Contributing](#contributing)


## Installation

To use these pagination functions, you can install the `nodejs-pagination` package as a dependency. Additionally, make sure you have `mongoose` and `npm-cache-it` installed if you haven't already:

- [mongoose](https://www.npmjs.com/package/mongoose): An Object Data Modeling (ODM) library for MongoDB.
- [npm-cache-it](https://www.npmjs.com/package/npm-cache-it): A caching utility for caching data in Node.js applications.

```bash
npm install nodejs-pagination mongoose npm-cache-it
```

## Usage
### Offset Pagination (`paginateWithOffset`)
Offset pagination is a common pagination method where you specify the page number and the number of results per page. This function provides options to sort the results by a specific field and in a specific direction.
```javascript
const { paginateWithOffset } = require('nodejs-pagination');
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

/**
 * Offset pagination - cURL
 * http://localhost:3000/offset-paginate?page=1&perPage=10&sortField=age&sortDirection=1
**/
```

### Cursor Pagination (`paginateWithCursor`)
Cursor pagination is a more efficient method for large datasets. It uses a cursor (usually the ID of the last item from the previous page) to fetch the next set of results.
```javascript
const { paginateWithCursor } = require('nodejs-pagination');
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

/**
 * Cursor pagination - cURL
 * http://localhost:3000/paginate?cursor=`${next}` // replace next with value of the next in response
**/
```

## Caching
Both pagination functions support caching of the total number of records to improve performance. The cache has a default time-to-live (TTL) of 60 seconds, which you can adjust according to your needs.

## Contributing
Contributions to `nodejs-pagination` are welcome! If you'd like to contribute to this project, please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name.`
3. Commit your changes: `git commit -m "Add your feature or fix".`
4. Push your branch to your fork: `git push origin feature/your-feature-name.`
5. Create a pull request on the original repository.

Please follow the Code of Conduct and Contributing Guidelines when contributing.



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
/**
 * Offset pagination function for Mongoose models.
 * @param {mongoose.Model} Model - The Mongoose model to paginate.
 * @param {Object} [filter] - Optional filter conditions.
 * @param {Object} [options] - Pagination options.
 * @param {number} [options.page=1] - The current page number (default is 1).
 * @param {number} [options.perPage=10] - Number of results per page (default is 10).
 * @param {string} [options.sortField] - The field to sort results by.
 * @param {number} [options.sortDirection=1] - Sort direction (1 for ascending, -1 for descending).
 * @returns {Promise<Object>} - An object containing paginated results and metadata.
 */
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
/**
 * Cursor-based pagination function for Mongoose models.
 * @param {mongoose.Model} model - The Mongoose model to paginate.
 * @param {Object} query - Optional query conditions.
 * @param {string} cursor - The cursor representing the last record in the previous page.
 * @param {number} pageSize - Number of results per page.
 * @returns {Promise<Object>} - An object containing paginated results and metadata.
 */
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
The caching feature is optional and can be controlled using the `allowCache` flag. Here's how it works with the allowCache flag:
1. When you call these pagination functions, you can pass the `allowCache` parameter with a value of `true` (which is the default) or `false` to indicate whether you want to enable or disable caching, respectively.
2. If `allowCache` is set to `true`, the functions will attempt to use caching to improve performance as described in the previous explanations.
3. If `allowCache` is set to `false`, the functions will skip the caching mechanism entirely, and each pagination request will query the database for fresh data without caching any results or counts.

This flexibility allows you to choose whether or not to use caching based on your specific performance and caching requirements.

## Contributing
Contributions to `nodejs-pagination` are welcome! If you'd like to contribute to this project, please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name.`
3. Commit your changes: `git commit -m "Add your feature or fix".`
4. Push your branch to your fork: `git push origin feature/your-feature-name.`
5. Create a pull request on the original repository.

Please follow the Code of Conduct and Contributing Guidelines when contributing.



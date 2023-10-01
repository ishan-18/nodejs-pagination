const mongoose = require('mongoose');
const { getCompoundKey, getCachedData, putDataInCacheWithTTL } = require('npm-cache-it');

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

async function paginateWithOffset(Model, filter = {}, options = {}) {
    const { page = 1, perPage = 10, sortField, sortDirection = 1 } = options;
    const skip = (page - 1) * perPage;
    const ttl = 60
    const cacheKey = getCompoundKey(Model.modelName, JSON.stringify(filter));

    let total = getCachedData('total', cacheKey);

    if (total === undefined) {
        total = await Model.countDocuments(filter);
        putDataInCacheWithTTL('total', cacheKey, total, ttl);
        console.log("Cache Miss");
    }

    const query = Model.find(filter);

    if (sortField) {
        const sortOrder = sortDirection === 1 ? 'asc' : 'desc';
        query.sort({ [sortField]: sortOrder });
    }

    const results = await query.skip(skip).limit(perPage).exec();
    const totalPages = Math.ceil(total / perPage);

    const pagination = {
        next: {
            page: page + 1 <= totalPages ? page + 1 : null,
            size: perPage,
        },
        prev: {
            page: page === 1 ? null : page - 1,
            size: perPage,
        },
    };

    if (page === 1) {
        delete pagination.prev;
    }

    return {
        results,
        pagination,
        page,
        perPage,
        total,
        totalPages,
    };
}

/**
 * Cursor-based pagination function for Mongoose models.
 * @param {mongoose.Model} model - The Mongoose model to paginate.
 * @param {Object} query - Optional query conditions.
 * @param {string} cursor - The cursor representing the last record in the previous page.
 * @param {number} pageSize - Number of results per page.
 * @returns {Promise<Object>} - An object containing paginated results and metadata.
 */
async function paginateWithCursor(Model, query, cursor, pageSize = defaultPageSize) {
    try {
        const cachePrefix = 'pagination'; 
        const cacheKey = getCompoundKey(cachePrefix, JSON.stringify({ query, cursor, pageSize }));
        const ttl = 60

        const cachedResults = getCachedData(cachePrefix, cacheKey);

        if (cachedResults) {
            return cachedResults;
        }

        const conditions = cursor ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } } : {};
        const results = await Model.find({ ...conditions, ...query })
            .sort({ _id: -1 })
            .limit(pageSize + 1);

        const hasNext = results.length > pageSize;
        if (hasNext) {
            results.pop();
        }

        const nextPageCursor = hasNext ? results[results.length - 1]._id : null;
        const previousPageCursor = cursor || null;

        putDataInCacheWithTTL(cachePrefix, cacheKey, {
            results,
            next: nextPageCursor ? nextPageCursor.toString() : null,
            previous: previousPageCursor ? previousPageCursor.toString() : null,
            hasNext,
        }, ttl); 

        return {
            results,
            next: nextPageCursor ? nextPageCursor.toString() : null,
            previous: previousPageCursor ? previousPageCursor.toString() : null,
            hasNext,
        };
    } catch (error) {
        throw error;
    }
}


module.exports = { paginateWithOffset, paginateWithCursor };


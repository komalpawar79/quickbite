/**
 * Pagination Utility
 * Handles pagination logic for database queries
 */

export const getPaginationParams = (query) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 10;

  // Validation
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100; // Max limit

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildPaginationQuery = (skip, limit) => {
  return {
    skip,
    limit
  };
};

/**
 * Sorting Utility
 */
export const getSortOptions = (sortBy = '-createdAt') => {
  const sortMap = {};
  const fields = sortBy.split(',');

  fields.forEach(field => {
    if (field.startsWith('-')) {
      sortMap[field.substring(1)] = -1;
    } else {
      sortMap[field] = 1;
    }
  });

  return sortMap;
};

/**
 * Filter Utility
 */
export const buildFilterQuery = (filters) => {
  const query = {};

  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      if (key === 'search') {
        query.$text = { $search: filters[key] };
      } else if (key === 'dateFrom' || key === 'dateTo') {
        if (!query.createdAt) query.createdAt = {};
        if (key === 'dateFrom') {
          query.createdAt.$gte = new Date(filters[key]);
        } else {
          query.createdAt.$lte = new Date(filters[key]);
        }
      } else {
        query[key] = filters[key];
      }
    }
  });

  return query;
};

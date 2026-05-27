const getPaginationParams = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const formatPaginatedResponse = (data, total, page, limit, key = 'items') => {
  const totalPages = Math.ceil(total / limit);
  return {
    [key]: data,
    items: data,
    total,
    page,
    totalPages,
    limit,
    meta: {
      totalItems: total,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  getPaginationParams,
  formatPaginatedResponse,
};

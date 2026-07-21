class ApiFilters {
    
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.removedFields = ['sort', 'page', 'limit', 'fields', 'q'];
    this.defaultSort = '-createdAt';
  }
    
  filter() {
    const queryCopy = { ...this.queryString };
    // Remove fields from query
    this.removedFields.forEach(field => delete queryCopy[field]);

    // Filters lt, lte, gt, gte
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(this.defaultSort);
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  searchByQuery() {
    if (this.queryString.q) {
      const searchTerm = this.queryString.q.split('-').join(' ');
      this.query = this.query.find({ $text: { $search: searchTerm } });
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 25;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFilters;
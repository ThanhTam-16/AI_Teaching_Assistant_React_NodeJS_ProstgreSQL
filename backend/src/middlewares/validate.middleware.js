const validate = (validateFn) => {
  return (req, res, next) => {
    try {
      validateFn(req.body, req.query, req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validate,
};

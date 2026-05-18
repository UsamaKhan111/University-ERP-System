const ApiError = require("../utils/apiError");

const formatIssuePath = (path) => {
  return path.filter((segment) => segment !== "body").join(".") || "request";
};

const validateRequest = (schema) => {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${formatIssuePath(issue.path)}: ${issue.message}`)
        .join("; ");

      return next(new ApiError(400, message));
    }

    req.body = result.data.body || req.body;
    req.params = result.data.params || req.params;
    req.query = result.data.query || req.query;

    return next();
  };
};

module.exports = validateRequest;

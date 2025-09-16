const createError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({
    message: "Something Wrong!",
    error: error.message,
  });
};

module.exports = {
  handleError,
  createError, 
};
exports.handleError = (res, error) => {
  console.error(error);
  res.status(500).json({
    message: "Something Wrong",
    error: error.message,
  });
};

export const validate = (schema) => {
  return (req, res, next) => {
    // Basic validation stub
    const isValid = true; 
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed'
      });
    }
    next();
  };
};

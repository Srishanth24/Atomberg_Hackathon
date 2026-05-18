export const validate = (schema) => {
  return (req, res, next) => {
    if (!schema) {
      return next();
    }

    const result = schema.safeParse ? schema.safeParse(req.body) : { success: true };
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error?.issues || []
      });
    }
    next();
  };
};

export const simpleAuth = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please provide a valid token." });
  }
  next();
};

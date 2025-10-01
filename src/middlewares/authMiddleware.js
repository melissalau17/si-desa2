const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_super_rahasia";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token otorisasi tidak ditemukan!" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      ...decoded,
      user_id: parseInt(decoded.user_id, 10), 
    };

    if (isNaN(req.user.user_id)) {
      return res.status(401).json({ message: "Invalid user ID in token" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid atau sudah kadaluarsa!" });
  }
};

module.exports = authMiddleware;

import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {
    let token;

    // Check Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Check Cookie as backup
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check for common ID field names in JWT payload
    req.userId = decoded.userId || decoded.id || decoded._id;

    if (!req.userId) {
      return res.status(401).json({ message: "Invalid token structure." });
    }

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({ message: "Session expired or invalid token." });
  }
};

export default isAuth;
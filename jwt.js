const jwt = require('jsonwebtoken');
require("dotenv").config();

const jwtAuthMiddleware = (req, res, next) => {
    // Check if the request header has authorization
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ error: "Token not found. Authorization header missing." });
    }

    // Extract the JWT token from the Authorization header
    const token = authorization.split(' ')[1]; // Split by space to get 'Bearer <token>'
    if (!token) {
        return res.status(401).json({ error: "Unauthorized. Token is missing in the header." });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Corrected `JWT_SECRET`
        
        // Attach user information to the request object
        req.user = decoded;
        next(); // Pass control to the next middleware or route handler

    } catch (err) {
        console.error("JWT Error:", err.message);
        return res.status(403).json({ 
            error: "Unauthorized. Invalid, expired, or malformed token."
        });
    }
};

// function to generate JWT Token
const generateToken = (userData) => {
    // console.log("Generating JWT Token");
    // Generate a new JWT Token using user data
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '24h' }); // Use `expiresIn` and format duration correctly
};

module.exports = { jwtAuthMiddleware, generateToken }
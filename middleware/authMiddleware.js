const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // format: Bearer <token>

    if (!token) {
        return res.status(401).json({ message: "Access denied, token missing!" });
    }

    try {
        const secret = process.env.JWT_SECRET || "secretkey";
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // bisa dipakai di controller
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid token!" });
    }
};

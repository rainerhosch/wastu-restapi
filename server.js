const express = require("express");
const dotenv = require("dotenv");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const authMiddleware = require("./middleware/authMiddleware");

dotenv.config();
const app = express();
app.use(express.json());

// Swagger setup
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SISKEU REST API",
            version: "1.0.0",
            description: "Dokumentasi Siskeu API",
        },
        servers: [
            { url: `https://kueapi.wastukancana.ac.id` },
            { url: `http://180.178.111.253:${process.env.PORT}` },
        ],
    },
    apis: ["./routes/*.js"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes); // ✅ semua /users harus login
app.use("/api/transactions", transactionRoutes);

app.listen(process.env.PORT, () =>
    console.log(`Server running on http://180.178.111.253:${process.env.PORT}`)
);

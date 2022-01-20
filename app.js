const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

// frontend hits to backend
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

// Connect to DB
connectDB();

// MiddleWare Init
app.use(express.json({ extended: false }));

// Logging 
app.use(morgan("dev"));

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("WELCOME TO CII FORUM HOME !");
});

<<<<<<< HEAD
//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/category', require('./routes/api/category'));
=======
// Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/auth", require("./routes/api/auth"));
>>>>>>> a3ced2f62666634268fab9d0335d2d3f5d8deca3

// Server Listen
app.listen(port, () =>
  console.log(`[Info] Server started successfully! Listening at ${port}`)
);

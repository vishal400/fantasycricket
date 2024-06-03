require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT||3000;

// Database Details
const DB_USER = process.env["DB_USER"];
const DB_PWD = process.env["DB_PWD"];
const DB_URL = process.env["DB_URL"];
const DB_NAME = "task-jeff";

const uri =
    "mongodb+srv://" +
    DB_USER +
    ":" +
    DB_PWD +
    "@" +
    DB_URL +
    "/?retryWrites=true&w=majority";
console.log(uri);

mongoose
    .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: DB_NAME,
    })
    .then(() => {
        console.log("You successfully connected to MongoDB!");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB: ", err);
    });

const db = mongoose.connection; // db store the connection

// cheacking the connection
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("DATABASE connection is Established");
});

app.use(express.json());

// Endpoints
app.use("/", require("./routers"));
//

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

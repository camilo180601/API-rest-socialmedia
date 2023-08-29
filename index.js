const connection = require('./database/connection');
const express = require('express');
const cors = require('cors');

connection();

const app  = express();
const port = 3800;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const user_routes        = require('./routes/user');
const like_routes        = require('./routes/like');               
const follow_routes      = require('./routes/follow');
const publication_routes = require('./routes/publication');

app.get('/', (req, res) => {
    return res.status(200).send("<h1>Execute API Rest Social Media</h1>");
});

app.use("/api/user", user_routes);
app.use("/api/like", like_routes);
app.use("/api/follow", follow_routes);
app.use("/api/publication", publication_routes);

app.listen(port, () => {
    console.log("Server started on port:", port);
});
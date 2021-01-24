const express = require('express');
const parser = require('body-parser');
const routes = require('./routes/routes');

const app = express();
require('./mongoose');
app.use(parser.urlencoded({extended: false}))
app.use(parser.json())
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.listen(process.env.PORT || 8080);

app.get('/', function (req, res) {
    res.render('pages/index');
});

app.use('/', routes);

module.exports = app;



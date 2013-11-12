var express = require('express'),
 	path = require('path'),
    http = require('http'),
    users = require('./routes/contact');
 
var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(express.bodyParser()),
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/contacts/:id', users.findById);
app.get('/contacts/info/:id', users.findById);
app.get('/contacts', users.findAll);
app.post('/contacts', users.addUser);
app.put('/contacts/:id', users.updateUser);
app.delete('/contacts/:id', users.deleteUser);



http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
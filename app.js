//Based on https://github.com/kdelemme/nodejs-token-auth
var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser'); //bodyparser + json + urlencoder

var PORT = 3001;
var auth = require('./config/auth');

const uuid = require('uuid/v4');


//Configuration
app.listen(PORT);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser());

app.all('*', function(req, res, next) {
	res.set('Access-Control-Allow-Origin', '*'); //TODO: Modify to appropiate origin
	res.set('Access-Control-Allow-Credentials', true);
	res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, HEAD, OPTIONS');
	res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type','Authorization');
	if ('OPTIONS' == req.method) return res.send(200);
	next();
});

// Session Service

app.post('/sessions', function(req, res) {
	if (!req.body.username || !req.body.password) {
    		return res.status(400).send({error: 'Username and password are ' +
                                'required parameters'});
  	}

	//Todo: Validate user and password

	//Get user data to store with the token
	var userData = {id:1, username: 'Oscar', lastname: 'Perez'};

	auth.createAndStoreToken(userData, 60*60, function(err, token) {
		if (err) {
			return res.send(400);
		} 

		//Send back token
		return res.send(200, token);
	});
});

app.get('/sessions', auth.verify, function(req, res){
	if (req._user) return res.send(200, req._user);
});

app.delete('/sessions', function(req, res) {
	auth.expireToken(req.headers, function(err, success) {
		if (err) return res.send(401);

		if (success) res.send(200);
		else res.send(401);
	});
});


// Contacts service

var data = {};

app.get('/contact', auth.verify, function(req, res) {
	if (req._user) return res.send(200, data);
});

app.get('/contact/:contactId', auth.verify, function(req, res) {
	var contactId = req.params.contactId;
	if(!(contactId in data)) return res.send(401);
	return res.send(200, data[contactId]);
});

app.post('/contact', auth.verify, function(req, res) {
	//TODO: validateUserInput(req.body);
	var contactId = uuid();
	req.body['contactId'] = contactId;
	data[contactId] = req.body;
	return res.send(200, data[contactId]);
});

app.post('/contact/:contactId', auth.verify, function(req, res) {
        var contactId = req.params.contactId;
        //TODO: validateUserInput(req.body);
	if(!(contactId in data)) return res.send(401);
	data[contactId] = req.body;
        return res.send(200, data[contactId]);
});

app.delete('/contact/:contactId', auth.verify, function(req, res) {
        var contactId = req.params.contactId;
	removed = data[contactId];
	delete data[contactId];
        return res.send(200, data[contactId]);
});


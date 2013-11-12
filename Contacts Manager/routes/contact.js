var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('contacts_db', server, {safe: true});    

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'contacts_db' database");
        db.collection('contacts', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'contacts' collection doesn't exist.");
                populateDB();
            }
        });
    }
});

exports.addUser = function(req, res){
	var user = req.body;
	console.log("Adding user: " + JSON.stringify(user));
	db.collection('contacts', function(err, collection){
		collection.insert(user, {safe: true}, function(err, result){
			if(err) {
				res.send({'error' : 'An error has occurred!'})
			}
			else{
				console.log("Success: " + JSON.stringify(result[0]));
				res.send(result[0]);
			}
		});
	});
}

exports.findAll = function(req, res) {
	var name = req.query["name"];
	db.collection('contacts', function(err, collection) {
		if(name){
			collection.find({"fullName": new ReqExp(name, "i")}).toArray(function(err, items) {
				res.send(items);
			});
		} 
		else{
			collection.find().toArray(function(err, items) {
				res.send(items);
			});
		}
	});
}

exports.findById = function(req, res) {
	var id = req.params.id;
	console.log('findById: ' + id);
	db.collection('contacts', function(err, collection) {
		collection.findOne({'_id': new BSON.ObjectID(id)}, function(err, item){
			res.send(item);
		});
	});
}

exports.deleteUser = function(req, res){
	var id = req.params.id;
	console.log("Delete user with id: " + id);
	db.collection('contacts', function(err, collection){
		collection.remove({'_id': new BSON.ObjectID(id)}, {safe:true}, function(err, result){
			if(err){
				res.send({'error': 'An error has occured - ' + err});
			}
			else{
				console.log("Deleted");
				res.send(req.body);
			}
		});
	});
}

exports.updateUser = function(req, res){
	var id = req.params.id;
	var user = req.body;
	delete user._id;
	console.log("Update user with id: " + id);
	//console.log(JSON.stringify(user));
	db.collection('contacts', function(err, collection){
		collection.update({'_id': new BSON.ObjectID(id)}, user, {safe:true}, function(err, result){
			if(err){
				console.log("Error when was updating user" + err);
				res.send({'error': 'An error has occured'});
			}
			else{
				console.log('' + result + ' user was updated');
				res.send(user);
			}
		});
	});
}

var populateDB = function () {
	console.log("Populating contacts database");
	var contacts = [
	{"firstName": "Artem", "lastName": "Volkov", "picture": "a_volkov.png", "age": 24},
	{"firstName": "John", "lastName": "Caningem", "picture": "j_caningem.png", "age": 32},
	{"firstName": "Ivan", "lastName": "Cotelevsky", "picture": "i_cotelevsky.png", "age": 26},
	{"firstName": "Julia", "lastName": "Savina", "picture": "j_savina.png", "age": 25},
	{"firstName": "Helen", "lastName": "Demidenko", "picture": "h_dimidenko.png", "age": 24},
	{"firstName": "Stive", "lastName": "Smith", "picture": "s_smith.png", "age": 45},
	{"firstName": "Viktor", "lastName": "Kuchin", "picture": "v_kuchin.png", "age": 30},
	{"firstName": "Lina", "lastName": "Jeferson", "picture": "l_jeferson.png", "age": 34}
	];

	db.collection('contacts', function(err, collection) {
		collection.insert(contacts, {safe: true}, function(err, result) {});
	});
}
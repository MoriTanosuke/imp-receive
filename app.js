var express = require('express')
  , mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mydb'; 

var app = express();

app.configure(function() {
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(app.router);
});

app.get('/', function(req, res) {
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection('imp', function(er, collection) {
      collection.find().toArray(function(er,rs) {
         res.header('Content-Type', 'application/json');
         res.send(rs);
      });
    });
  });
});
app.post('/', function(req, res) {
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection('imp', function(er, collection) {
      collection.insert({'time': new Date().getTime(), 'payload': req.body}, {safe: true}, function(er,rs) {
         res.header('Content-Type', 'application/json');
         res.send({'accepted': true, 'body': req.body});
      });
    });
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log('Listening on ' + port);
});


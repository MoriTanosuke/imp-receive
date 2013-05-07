
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mydb';

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection('imp', function(er, collection) {
      collection.find().toArray(function(er,rs) {
         res.header('Content-Type', 'application/json');
         if(req.param('cb')) {
           res.send(req.param('cb') + '(' + JSON.stringify(rs) + ')');
         } else {
           res.send(rs);
         }
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
app.get('/graph', function(req, res) {
mongo.Db.connect(mongoUri, function (err, db) {
    db.collection('imp', function(er, collection) {
      collection.find().toArray(function(er,rs) {
         var timeseries = new Array();
         for(i in rs) {
           timeseries.push([rs[i].time, rs[i].payload.value]);
         }
         res.header('Content-Type', 'text/html');
         res.render('graph', {title: 'Graph', data: JSON.stringify(timeseries)});
      });
    });
  });
  });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

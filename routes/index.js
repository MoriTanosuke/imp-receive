var mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mydb';

/*
 * GET home page.
 */
exports.raw = function(req, res) {
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
}

exports.save = function(req, res) {
  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection('imp', function(er, collection) {
      collection.insert({'time': new Date().getTime(), 'payload': req.body}, {safe: true}, function(er,rs) {
         res.header('Content-Type', 'application/json');
         res.send({'accepted': true, 'body': req.body});
      });
    });
  });
};

exports.graph = function(req, res) {
mongo.Db.connect(mongoUri, function (err, db) {
    db.collection('imp', function(er, collection) {
      collection.find().toArray(function(er,rs) {
         var timeseries = new Array();
         for(i in rs) {
           var offset = 0;
           for(j in rs[i].payload.value) {
             offset += rs[i].payload.value[j][0];
             timeseries.push([rs[i].time + offset, rs[i].payload.value[j][1]]);
           }
         }
         res.header('Content-Type', 'text/html');
         res.render('graph', {title: 'Graph', data: JSON.stringify(timeseries)});
      });
    });
  });
};


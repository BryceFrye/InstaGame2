
/**
 * Module dependencies.
 */

var express = require('express');
var url = require('url');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.logger());
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

url.parse(query), function(req, res){ 
  var query = query;
}

var token = "access_token=5987534.6b6ef97.89144b96c6334c50881b945881b84611";

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Instagame',
    token: token
    query: query
  });
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
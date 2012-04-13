
/**
 * Module dependencies.
 */

var express = require('express');
var querystring = require('qs');
var http = require('http');
var https = require('https');

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

//var url_parts = url.parse(req.query, true);
//console.log(url_parts);
//console.log(querystring.parse("/?code=sdfisduhfgdiughd"));

var token = "access_token=5987534.6b6ef97.89144b96c6334c50881b945881b84611";

// Routes

app.get('/', function(req, res){
  var url_parts = querystring.parse(req.query, true);
  /*console.log(url_parts.code);

  var options = {
    host: "https://api.instagram.com/oauth/access_token",
    client_id: "7ef880e896434566ba789a50d73ae204",
    client_secret: "f82712c0f4e848ae935b103947351321",
    grant_type: "authorization_code",
    redirect_uri: "http://severe-stone-4936.herokuapp.com/",
    code: url_parts.code
  };*/
  
  res.render('index', {
    title: 'Instagame',
    token: token
  });
  console.log(url_parts.code);
  
  if ( url_parts.code != null ) {
    console.log("code present");
    var post_data = querystring.stringify({
      client_id: "7ef880e896434566ba789a50d73ae204",
      client_secret: "f82712c0f4e848ae935b103947351321",
      grant_type: "authorization_code",
      redirect_uri: "http://severe-stone-4936.herokuapp.com/",
      code: url_parts.code
    });
    var post_options = {
      host: "https://api.instagram.com/oauth/access_token",
      method: 'POST',
      headers: {  
        'Content-Type': 'application/x-www-form-urlencoded',  
        'Content-Length': post_data.length  
      }
    };
    var post_req = https.request(post_options, function(res) {
      console.log("send");
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('Response: ' + chunk);
      });
    });
    post_req.write(post_data);
    post_req.end();
  }
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
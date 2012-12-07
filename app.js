require('./environment')();
var express = require('express');
var app = express();
var querystring = require('qs');
var https = require('https');
var host = MY_HOST;

app.configure(function(){
  app.set('views', __dirname + '/public/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.logger());
	app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.get('/', function(req, res){
  var url_parts = querystring.parse(req.query, true);
  
  var token;
  
  if ( url_parts.code != null ) {
		var post_data = querystring.stringify({
      client_id: MY_CLIENT_ID,
      client_secret: MY_CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: MY_REDIRECT_URI,
      code: url_parts.code
    });
    var post_options = {
      host: "api.instagram.com",
      path: "https://api.instagram.com/oauth/access_token",
      method: 'POST'
    };
    var post_req = https.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        var parsedJSON = eval("(function(){return " + chunk + ";})()");
        var token = parsedJSON.access_token;
        sendToken(token);
      });
    });
    post_req.write(post_data);
    post_req.end();
  }
  
  if ( url_parts.code == null ) {
    res.render('index', {
      token: token,
			login_redirect: MY_LOGIN_REDIRECT
    });
  }
  
  function sendToken(token){
    res.render('index', {
      token: token,
			login_redirect: MY_LOGIN_REDIRECT
    });
  }
});

var port = process.env.PORT || 3030;
app.listen(port, function() {
  console.log("Express server is running...");
});
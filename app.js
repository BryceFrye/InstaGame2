var express = require('express');
var querystring = require('qs');
var https = require('https');

var app = module.exports = express.createServer();

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

app.get('/', function(req, res){
  var url_parts = querystring.parse(req.query, true);
  
  var token;
  
  if ( url_parts.code != null ) {
    var post_data = querystring.stringify({
      client_id: "7ef880e896434566ba789a50d73ae204",
      client_secret: "f82712c0f4e848ae935b103947351321",
      grant_type: "authorization_code",
      redirect_uri: "http://instagame.herokuapp.com/",
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
        console.log("TOKEN: "+ token);
        sendToken(token);
      });
    });
    post_req.write(post_data);
    post_req.end();
  }
  
  if ( url_parts.code == null ) {
    res.render('index', {
      token: token
    });
  }
  
  function sendToken(token){
    res.render('index', {
      token: token
    });
  }

});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
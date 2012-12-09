module.exports = function(){

//   TEST   //
	MY_HOST = "localhost";
	MY_CLIENT_ID = "3a87507d4e284471be0b3fe831c80a18";
	MY_CLIENT_SECRET = "0e99cc12871146a49b7f161730fd3a0b";
	MY_REDIRECT_URI = "http://www.localhost.com:3030";
	
//   PRODUCTION   //
	// MY_HOST = "http://instagame.jit.su/";
	// MY_CLIENT_ID = "7ef880e896434566ba789a50d73ae204";
	// MY_CLIENT_SECRET = "f82712c0f4e848ae935b103947351321";
	// MY_REDIRECT_URI = "http://instagame.jit.su/";
	
	
	MY_LOGIN_REDIRECT = "https://instagram.com/oauth/authorize/?client_id="+MY_CLIENT_ID+"&redirect_uri="+MY_REDIRECT_URI+"&scope=relationships&response_type=code";
}
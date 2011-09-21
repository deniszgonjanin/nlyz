var http = require('http');

var GEO_SERVICE = "api.hostip.info"

exports.gelocateByIp = function(IP, callback){
	var options = {
		host: GEO_SERVICE,
		port: 80,
		path: '/get_html.php?ip=' + IP + '&position=true'
	}
	
	http.get(options, function(res){
		console(res);
		callback(res);
	}).on('error', function(e){
		console.log("Got error when requestion geolocation: " + e.message);
	});
};
//Redis stuff

var redisNode = require('redis'),
		redis = redisNode.createClient();
		
redis.on('error', function(err){
	console.log('Error on data layer ' + err);
});

//Data model
//[key]											[value]
//----------------------------------
//<link>											the unshortened link
//<link>_


exports.someFunction = function(callback){
	
};
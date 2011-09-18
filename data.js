//Redis stuff

var redisNode = require('redis'),
		redis = redisNode.createClient();
		
redis.on('error', function(err){
	console.log('Error on data layer ' + err);
});

//Data model
//[key]											[value]
//----------------------------------
//counter										the number of links (highest index)
//<link_index>							{short_link, original_link, time_created}
//<link_index>_analyze			{IP, browser, OS, time, referer}


exports.someFunction = function(callback){
	
};
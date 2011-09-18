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
//<link_index>_analyze			LIST OF: {IP, browser, OS, time, referer}

exports.getAndIncrementCounter = function(callback){
	redis.incr('counter', function(err, reply){
		if (err) return callback(err);
		
		var counter = parseInt(reply.toString());
		callback(null, counter);
	});
};

exports.saveLink = function(linkIndex, linkObject){
	redis.set(linkIndex, linkObject);
};

exports.saveLinkHit = function(linkIndex, linkHitObject, callback){
	var analyzeKey = linkIndex + "_analyze";
	redis.lpush(analyzeKey, linkHitObject);
};

exports.getLink = function(linkIndex, callback){
	redis.get(linkIndex, function(err, reply){
		if (err) return callback(err);
		
		var linkObject = JSON.parse(reply.toString());
		callback(null, linkObject);
	});
};

exports.getLinkAnalytics = function(linkIndex, callback){
	var analyzeKey = linkIndex + '_analyze';
	redis.llen(analyzeKey, function(err, reply){
		var length = parseInt(reply.toString());
		
		redis.lrange(analyzeKey, 0, length, function(err, reply){
			var list = reply;
		});
	});
};
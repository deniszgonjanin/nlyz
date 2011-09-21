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
	redis.set(linkIndex, JSON.stringify(linkObject));
};

exports.saveLinkHit = function(linkIndex, linkHitObject, callback){
	var analyzeKey = linkIndex + "_analyze";
	redis.lpush(analyzeKey, JSON.stringify(linkHitObject));
};

exports.getLink = function(linkIndex, callback){
	redis.get(linkIndex, function(err, reply){
		if (err) return callback(err);
		
		//console.log("here is the object: " + reply);
		var linkObject = JSON.parse(reply);
		callback(null, linkObject);
	});
};

exports.getLinkAnalytics = function(linkIndex, callback){
	var analyzeKey = linkIndex + '_analyze';
	redis.llen(analyzeKey, function(err, reply){
		
		var length = parseInt(reply.toString());
		redis.lrange(analyzeKey, 0, length, function(err, reply){
			//console.log(require('util').inspect(reply, true, 2));
			var list = [];
			for (hit in reply){
				list[hit] = JSON.parse(reply[hit]);
			}
			
			callback(null, list);
		});
	});
};
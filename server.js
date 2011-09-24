
/**
 * Module dependencies.
 */

var SERVER_ADDRESS = "http://nlyz.no.de/";

var express = require('express')
var ejs = require('ejs');
var data = require(__dirname + '/data');
var shortener = require(__dirname + '/shortener');
var geolocate = require(__dirname + '/geolocate');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
	app.register('.html', require('ejs'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public')),
	app.use('/', express.errorHandler({ dump: true, stack: true }));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.listen(80);
var nowjs = require('now');
var everyone = nowjs.initialize(app);

// Routes

app.get('/', function(req, res){
  res.render('index');
});

//This is the real time analytics dashboard
app.get('/:link_id/analyze', function(req,res){
	
	var id = shortener.expand(req.params.link_id);
	
	data.getLink(id, function(err, link_object){
		if (err){
			console.log('There was an ERROR retrieving the link from redis');
		} else{
			//Get the analytics data for this link
			data.getLinkAnalytics(id, function(err, link_analytics){
				if (err){
					console.log('ERROR getting bulk analytics');
					res.redirect('404');
				} else{
					res.render('dashboard',{
						hits: link_analytics,
						linkObject: link_object,
						server_address: SERVER_ADDRESS
					});
				}
			});
		}
	});
	
});

//When we get a post, take the form data and shorted the link, then return the shortened link
app.post('/shorten', function(req,res){
	console.log(req.body.url_field);
  var code = shortener.shorten(1)

	var counter = data.getAndIncrementCounter(function(err, value){
		if (err){
			console.log('there was an error when incrementing the counter');
		} else{
			var code = shortener.shorten(value);
			var link_object = {
				short_link: code, 
				original_link: req.body.url_field,
				time_created: new Date()
			};
			
			data.saveLink(value, link_object);
			
			res.render('shorten',{
				linkObject: link_object, 
        header: JSON.stringify(req.headers),
        remote_address: req.connection.remoteAddress,
				server_address: SERVER_ADDRESS
			});
		}
	});
	
});

app.get('/shorten', function(req, res){
  console.log(req.headers)
  res.redirect('/');
});

//When somebody goes to a link, log the analytics data and redirect them to the resolved link
app.get('/:link_id', function(req, res){
	if (req.params.link_id == "favicon.ico"){
		res.render('index');
		return;
	}
	
	console.log(JSON.stringify(req.headers));
	
	console.log("Getting link: " + req.params.link_id);
	var id = shortener.expand(req.params.link_id);
	
	data.getLink(id, function(err, value){
		if (err){
			console.log('there was an error getting the link from redis')
		} else{
			//Redirect the user to the original 'unshortened' link. 
			//Do it first, so the user doesn't have to wait
			res.redirect(value.original_link);
			
			//Build the analytics object for this hit
			var linkHitObject = {
				IP: req.headers.host,
				browser: req.headers["user-agent"],
				OS: req.headers["user-agent"], //Need to parse out browser\OS from user-agent
				time: new Date(),
				referer: req.headers.referer,
			};
			
			//Store the hit object into redis, to keep track of hits and analytics
			data.saveLinkHit(id, linkHitObject);
			//Push the hit to every Dashboard page that's currently open on this particular link
			distributeUpdate(value.short_link, linkHitObject);
		}
	});
	
}); 

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

/** Bellow is real time dashboard stuff **/

//Logging function for the websockets real-time clients
everyone.now.logStuff = function(msg){
	console.log(msg);
};

everyone.now.registerForUpdates = function(link, updateCallback){
	this.now.room = link;
	nowjs.getGroup(this.now.room).addUser(this.user.clientId);
	console.log('Registered Dashboard client for: ' + this.now.room);
	
	updateCallback(link);
};

distributeUpdate = function(linkId, update){
	console.log('Sending update to dashboards for: ' + linkId);
	nowjs.getGroup(linkId).now.receiveUpdate(update);
};

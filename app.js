
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

//This is the real time analytics dashboard
app.get('/analyze/:link?', function(req,res){
	if (req.params.link){
		
	} else{
		res.redirect('/');
	}
});

//When we get a post, take the form data and shorted the link, then return the shortened link
app.post('/shorten', function(req,res){
	
});

//When somebody goes to a link, log the analytics data and redirect them to the resolved link
app.get('/:link', function(req, res){
	
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

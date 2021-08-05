'use strict';
// Module Dependencies
// -------------------
var express     = require('express');
var bodyParser  = require('body-parser');
var errorhandler = require('errorhandler');
var http        = require('http');
var path        = require('path');
var request     = require('request');
var routes      = require('./routes');
var activity    = require('./routes/activity');
const { Client } = require('pg');

var app = express();

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json({type: 'application/json'})); 
//app.use(bodyParser.urlencoded({ extended: true }));

//app.use(express.methodOverride());
//app.use(express.favicon());

app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

// HubExchange Routes
app.get('/', routes.index );
app.get('/contact',(req,res)=>{
  console.log('i am here',res);
  const client = new Client({
    connectionString: 'postgres://cqgiyhnuzzbhif:be049574f95dae2045a41aa2dc954c737f134c1a43cac010b6ef36d137fa2b6c@ec2-34-197-105-186.compute-1.amazonaws.com:5432/dglaqh0qvojll',
    ssl: true
  });
  
  client.connect();
  console.log('i am here');
  client.query('SELECT * FROM salesforce.contact', (err, res) => {
    if (err) console.log(err);
    console.log(res);
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
  if( !req.session.token ) {
    res.render( 'index', {
        title: 'Unauthenticated',
        errorMessage: 'This app may only be loaded via Salesforce Marketing Cloud',
    });
} else {
    res.render( 'index', {
        title: 'Journey Builder Activity',
        results: activity.logExecuteData,
    });
  }
});
app.post('/login', routes.login );
app.post('/logout', routes.logout );

// Custom Hello World Activity Routes
app.post('/journeybuilder/save/', activity.save );
app.post('/journeybuilder/validate/', activity.validate );
app.post('/journeybuilder/publish/', activity.publish );
app.post('/journeybuilder/execute/', activity.execute );

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
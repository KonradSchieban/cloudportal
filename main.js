var express     = require('express'),
    nunjucks    = require('nunjucks'),
    mongoClient = require('mongodb').MongoClient,
    objectId    = require('mongodb').ObjectId,
    bodyParser  = require('body-parser'),
    config      = require('./config.json');

var app         = express();

// Run mongod service using >mongod.exe --dbpath \src\mongodbs\
var mongo_url = config.mongo_url;
var db;
var offerings;

mongoClient.connect(mongo_url, (err, dbase) => {
    if (err) return cb(err);
    console.log("Connnected correctly to the database server.");
    db = dbase;

    db.collection("offerings", (err, res) => {
        if(err){
            console.log(err);
            return;
        }
        offerings = res;
    });

    require('./admin')(app, offerings);
    require('./portal')(app, offerings);
});

// Configure Nunjucks
var _templates = process.env.NODE_PATH ? process.env.NODE_PATH + '/views' : 'views' ;
nunjucks.configure(_templates, {
    autoescape: true,
    cache: false,
    express: app
});

// Set Nunjucks as rendering engine for pages with .html suffix
app.engine( 'html', nunjucks.render ) ;
app.set( 'view engine', 'html' ) ;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/views'));

app.listen(8080);
console.log('Starting server on port 8080...');
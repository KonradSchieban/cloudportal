var express     = require( 'express' ),
    nunjucks    = require( 'nunjucks' ),
    mongoClient = require('mongodb').MongoClient;
var app         = express();

// Run mongod service using >mongod.exe --dbpath \src\mongodbs\
var mongo_url = 'mongodb://localhost:27017/portal';
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

});



// Configure Nunjucks
var _templates = process.env.NODE_PATH ? process.env.NODE_PATH + '/views' : 'views' ;
nunjucks.configure(_templates, {
    autoescape: true,
    cache: false,
    express: app
} ) ;

// Set Nunjucks as rendering engine for pages with .html suffix
app.engine( 'html', nunjucks.render ) ;
app.set( 'view engine', 'html' ) ;

app.get('/portal', function(req,res){
    res.render("portal.njk",{"var1": "asdf"}) ;
});

app.get('/portal/catalog', function(req,get_res){

    var found; 
    offerings.find({}, (err,offerings_cursor) => {
        if(err){
            console.log("problem");
            return;
        }
                
        offerings_cursor.toArray((err, offerings_array) => {
            console.log(offerings_array);

            get_res.render("portal_catalog.njk",
                        {
                            "title": "Cloud Portal",
                            "offerings_array": offerings_array
                        }) ;
        });
        

    });

});

app.listen(8080);
console.log('Starting server on port 8080...');
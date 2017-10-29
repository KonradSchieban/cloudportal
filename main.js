var express     = require( 'express' ),
    nunjucks    = require( 'nunjucks' ),
    mongoClient = require('mongodb').MongoClient,
    objectId    = require('mongodb').ObjectId,
    bodyParser  = require('body-parser');
var app         = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/views'));

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

app.get('/portal/catalog/:offering_id', function(req,get_res){
   
    var offering_id = req.params.offering_id;
    
    offerings.find(objectId(offering_id), (err,offering) => {
        if(err){
            console.log("Failed to query offerings collection!");
            return;
        }
                
        offering.toArray((err,offering_res) => {
            if(err){
                console.log("Failed to convert offering to array!");
                return;
            }

            var offering_item = offering_res[0];
            get_res.render("offering.njk",
            {
                "title": "Cloud Portal",
                "offering_name": offering_item.name,
                "offering_description": offering_item.description 
            });

        });

    });
        
});


app.get('/admin/create_offering', function(req,get_res){
    get_res.render("admin_create_offering.njk");
});


app.post('/admin/create_offering', function(req,post_res){
    
    var item = {
        'name': req.body.name,
        'display_name': req.body.display_name,
        'description': req.body.description,
        'image': req.body.image
    };

    offerings.insertOne(item, (err, res) => {
        if(err){
            console.log("Failed to insert new offering.");
            return;
        }

        post_res.redirect("/admin/create_offering");
        post_res.end();
    });
});

app.get('/admin/catalog', function(req,get_res){

    offerings.find({}, (err,offerings_cursor) => {
        if(err){
            console.log("problem");
            return;
        }
                
        offerings_cursor.toArray((err, offerings_array) => {
            console.log(offerings_array);

            get_res.render("admin_list_offerings.njk",
                {
                    "title": "Cloud Portal (Admin)",
                    "offerings_array": offerings_array
                }) ;
        });
    });

});

app.get('/admin/catalog/:offering_id/delete', function(req,get_res){
    var offering_id = req.params.offering_id;
    console.log("Deleting offering with id: " + offering_id);

    offerings.deleteOne({'_id': objectId(offering_id)},(err,res) => {
        if(err){
            console.log("Failed to delete offering with id" + offering_id);
            return;
        }

        get_res.redirect("/admin/catalog");
        get_res.end();
    });
});

app.get('/admin/catalog/:offering_id/modify', function(req,get_res){
    var offering_id = req.params.offering_id;
    offerings.find(objectId(offering_id), (err,offering) => {
        if(err){
            console.log("Failed to query offerings collection!");
            return;
        }
                
        offering.toArray((err,offering_res) => {
            if(err){
                console.log("Failed to convert offering to array!");
                return;
            }

            var offering_item = offering_res[0];
            get_res.render("admin_modify_offering.njk",
            {
                "title": "Cloud Portal",
                "offering_name": offering_item.name,
                "offering_description": offering_item.description,
                "offering_display_name": offering_item.display_name,
                "offering_image": offering_item.image
            });

        });
    });
});

app.post('/admin/catalog/:offering_id/modify', function(req,post_res){
    
    var offering_id = req.params.offering_id;
    console.log("Offering ID:" + offering_id)

    var item = {
        'name': req.body.name,
        'display_name': req.body.display_name,
        'description': req.body.description,
        'image': req.body.image
    };

    offerings.updateOne({'_id': objectId(offering_id)},item, (err, res) => {
        if(err){
            console.log("Failed to update offering.");
            return;
        }

        post_res.redirect("/admin/catalog");
        post_res.end();
    });
});

app.listen(8080);
console.log('Starting server on port 8080...');
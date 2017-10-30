var objectId    = require('mongodb').ObjectId,
bodyParser  = require('body-parser');

module.exports = function(app, offerings){

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
};
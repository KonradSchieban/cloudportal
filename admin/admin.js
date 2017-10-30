var objectId    = require('mongodb').ObjectId,
    bodyParser  = require('body-parser');

module.exports = function(app, offerings){

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

};

const portModel = require("../models/portModel");

module.exports = function (app) {
    // Get PORTs
    app.get('/ports' , async (req, res) => {
        var data = null
        
        if(result =  await portModel.list({select:'*, bin_to_uuid(id) as id', filters: {'published':  1}})){
            data = result
        }
        res.status(200).send({'data': data})
    })

}   
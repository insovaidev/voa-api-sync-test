const checkAuth = require("../middleware/checkAuth");
const visaTypeModel = require("../models/visaTypeModel");
const generalLib = require("../libraries/generalLib")

module.exports = function (app) {

    // Check middleware
    app.use("/visa_types", checkAuth);

    app.post('/visa_types', async (req, res) => {
        const data = req.body
        if(req.body != undefined){
            data.id = generalLib.generateUUID()
            await visaTypeModel.add(data)
            return res.status(200).send({'message': 'success.'})
        }
        res.status(422).send({'message': 'Bad request.'})
    })


    // Get Visas Type
    app.get('/visa_types' , async (req, res) => {
        const visa_types =  await visaTypeModel.gets({select:'bin_to_uuid(id) as id,price,ordering,popular,published,sort_reports,entries,type,duration,duration_type,label', filters: {'published': 1}})
        res.status(200).send({'data': visa_types })
    })

    app.patch('/visa_types/:id', async (req, res) => {
        const id = req.params.id
        const data = req.body

        if(req.body != undefined && req.params.id != undefined){
            if(result = await visaTypeModel.getOne({filters: {'id': req.params.id}})){
                await visaTypeModel.update(req.params.id, data, 'id')
                return res.status(200).send({'message': 'update success.'})
            }
            return res.status(403).send({'message': 'Not Found.'})
        } 
        res.status(422).send({'message': 'Bad request.'})
    })
}
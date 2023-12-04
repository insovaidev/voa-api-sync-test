const generalLib = require("../libraries/generalLib");
const checkAuth = require("../middleware/checkAuth");
const portModel = require("../models/portModel");

module.exports = function (app) {

    // Check middleware
    app.use("/ports_sync", checkAuth);

    app.get('/ports_sync' , async (req, res) => {
        const data =  await portModel.list({select:'*, bin_to_uuid(id) as id'})
        res.status(200).send({'data': data})
    })

    app.patch('/ports_sync/:id' , async (req, res) => {
        const id = req.params.id
        const data = req.body
        if(req.body !=undefined){
            if(await portModel.getOne({filters: {'id': id}})){
            
                const result = await portModel.update(id, data, 'id')
             
                return res.status(200).send({'message': 'update success.'})                
            }
            return res.status(403).send({'message': 'Not Found.'})
        }
        return res.status(422).send({'message': 'Bad request.'})
    })

    app.post('/ports_sync' , async (req, res) => {
        const data = req.body
        if(req.body !=undefined){
            if(port = await portModel.getOne({filters: {'code': data.code}})){
                return res.status(401).send({'message': 'Port code already exist.'})           
            }
            data.id = generalLib.generateUUID()
            const result = await portModel.add(data)
            return res.send({'message': 'success.'})
        }
        return res.status(422).send({'message': 'Bad request.'})
    })

}
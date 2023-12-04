module.exports = function(app) {
    
    // load controllers
    require('../controllers/index')(app)
    require('../controllers/auth')(app)
    require('../controllers/me')(app)
    require('../controllers/reports')(app)
    require('../controllers/countries')(app)
    require('../controllers/visa_types')(app)
    require('../controllers/settings')(app)
    require('../controllers/upload')(app)
    require('../controllers/upload_sync')(app)
    require('../controllers/devices')(app)
    require('../controllers/pdfs')(app)
    require('../controllers/reads')(app)
    require('../controllers/prints')(app)
    require('../controllers/excel')(app)
    require('../controllers/syncs')(app)
    require('../controllers/ports')(app)
    require('../controllers/port_sync')(app)
    require('../controllers/blacklist')(app)
    require('../controllers/visas')(app)
    require('../controllers/users')(app)


    // default route
    app.use(function (req, res, next) {
        res.status(404).send({"message":"Page No Found"})
    })

}
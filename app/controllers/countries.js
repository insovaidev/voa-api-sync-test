const checkAuth = require("../middleware/checkAuth");
const countryModel = require("../models/countryModel");


module.exports = function (app) {
    // Check middleware
    app.use("/countries", checkAuth);

    // Report By Visas Type
    app.get('/countries', async (req, res) => {
        const coutries =  await countryModel.gets()
        res.status(200).send({'data': coutries })
    })
}

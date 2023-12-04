const fs = require('fs')
module.exports = function (app) {
   
    app.get('/reads', async (req, res) => {
        const filters = req.query
        if(fs.existsSync(filters.path)){
            const page = fs.readFileSync(`${filters.path}`, { encoding: 'utf8', flag: 'r' });   
            return res.send(page)
        }
        return res.send({'message': 'Not Found'})
    })
}
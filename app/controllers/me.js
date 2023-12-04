const checkAuth = require('../middleware/checkAuth')
const userModel = require('../models/userModel')

module.exports = function(app) {

    // Apply authentication
    app.use('/me', checkAuth)

    app.get('/me', async (req, res) => {
        const me = req.me
        const data=await userModel.get({select: 'bin_to_uuid(uid) as uid, sex, name, username, role, port, phone, email, permissions', filters: { uid: me.id }})
        res.send({'data':data})
    })
}
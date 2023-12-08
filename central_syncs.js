// Set Default Timezone
process.env.TZ = 'Asia/Phnom_Penh'
const express = require('express')
const central_syncs = express()
const cors = require('cors')
require('dotenv').config()
const PORT = 3001

// Allow close domain
central_syncs.use(cors())

// Accept Form Submition
const bodyParser = require('body-parser')
central_syncs.use(bodyParser.json()) // for parsing application/json
central_syncs.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


// Enable public resource
central_syncs.use(express.static('public'))

// Public Folder
central_syncs.use('/tmp', express.static('tmp'))
central_syncs.use('/pdf', express.static('pdf'))
central_syncs.use('/xlsx', express.static('xlsx'))
central_syncs.use('/uploads', express.static('uploads'))


const config = require('./app/config/config')
const userModel = require('./app/models/userModel')



// Return user data to local
central_syncs.post('/central_syncs/users', async (req, res) => {
    var data = []
    if(req.body.sid != undefined && req.body.ports != undefined) {
        const sid = req.body.sid
        const ports = req.body.ports 
        data = await userModel.sync({select: 'u.*, bin_to_uuid(u.uid) as uid, s.sid', filters: {'sid': sid, 'ports': ports}})
    }
    res.send({'data': data && data.length ? data : null})
})

  
central_syncs.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})

central_syncs.use(function(req, res, next) {
  console.log(req.get('User-Agent'))
  res.locals.ua = req.get('User-Agent');
  next();
})


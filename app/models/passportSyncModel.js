const db = require('../services/dbService')
const table = "passports_sync"

module.exports = {
    delete: async function({filters}={}){
        const q = db(table)    
        q.del()
        await q
    },
}



const db = require('../services/dbService')
const table = "deleted_visas_sync"

module.exports = {
    delete: async function({filters}={}){
        const q = db(table)    
        q.del()
        await q
    },
}



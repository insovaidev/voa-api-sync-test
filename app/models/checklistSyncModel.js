const db = require('../services/dbService')
const table = "checklists_sync"

module.exports = {
    delete: async function({filters}={}){
        const q = db(table)    
        q.del()
        await q
    },
}



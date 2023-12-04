const db = require('../services/dbService')

const table = "activity_logs_sync"

module.exports = {
    delete: async function({filters}={}){
        const q = db(table)    
        q.del()
        await q
    },
}



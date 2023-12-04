const db = require('../services/dbService')

const table = "visas"

module.exports = {

    list: async function({select=null,  filters}={}) {
        const q = db(table) 

        // Select Fields
        q.select()
        if(select) q.select(db.raw(select))

        // Where Condition
        this.filters(q, filters)

        // Pagination
        q.limit(filters && filters.limit != undefined ? filters.limit : 30)
        q.offset(filters && filters.offset != undefined ? filters.offset : 0)
        
        // Sort
        if(filters && filters.sort){
            if(filters.sort === 'full_name'){
                q.orderBy('p.full_name', filters.sort_value ? filters.sort_value : 'asc')
            } else {
                q.orderBy(filters.sort && filters.sort != undefined ? 'v.'+filters.sort : 'v.created_at', filters.sort_value && filters.sort_value != undefined ? filters.sort_value : 'desc' )
            }
        }
        
        // Search
        if(filters.search_type && filters.search_value != undefined) q.where(filters.search_type, 'like' ,`%${filters.search_value}%`)

        // Return Result
        const result = await q
        return result && result.length ? result : null
    },

    reportList: async function({select=null, groupBy=null, filters}={}) {

        const q = db(table+ ' as v')

        // Select Fields
        if(select || groupBy) q.select(db.raw(select ?? groupBy))
        
        // Jion Table Passports
        q.join(db.raw('passports'+' as p on v.passport_id=p.passport_id'))

        // Where Condition
        this.filters(q, filters)
        
        // Pagination
        q.limit(filters && filters.limit != undefined ? filters.limit: 30)
        q.offset(filters && filters.offset != undefined ? filters.offset : 0)

        // Group By Record
        if(groupBy) q.groupBy(db.raw(groupBy))
        
        if(filters && filters.sort){
            if(filters.sort === 'full_name'){
                q.orderBy('p.full_name', filters.sort_value ? filters.sort_value : 'asc')
            } else {
                q.orderBy(filters.sort && filters.sort != undefined ? 'v.'+filters.sort : 'v.created_at', filters.sort_value && filters.sort_value != undefined ? filters.sort_value : 'desc' )
            }
        }

        // Return Result
        const result = await q
        return result && result.length ? result : null
    },


    excelList: async function({select=null, groupBy=null, filters}={}) {
        const q = db(table+ ' as v')

        // Select Fields
        if(select || groupBy) q.select(db.raw(select ?? groupBy))
        
        // Jion Table Passports
        q.join(db.raw('passports'+' as p on v.passport_id=p.passport_id'))

        // Where Condition
        this.filters(q, filters)
    
        // Group By Record
        if(groupBy) q.groupBy(db.raw(groupBy))
        
        if(filters && filters.sort){
            if(filters.sort === 'full_name'){
                q.orderBy('p.full_name', filters.sort_value ? filters.sort_value : 'asc')
            } else {
                q.orderBy(filters.sort && filters.sort != undefined ? 'v.'+filters.sort : 'v.created_at', filters.sort_value && filters.sort_value != undefined ? filters.sort_value : 'desc' )
            }
        }

        // Return Result
        const result = await q
        return result && result.length ? result : null
    },

    total: async function({select=null, groupBy=null, filters}={}) {

        const q = db(table+ ' as v')

        // Select Fields
        if(select || groupBy) q.select(db.raw(select ?? groupBy))
        
        q.count('* as total')

        // Jion Table Passports
        q.join(db.raw('passports'+' as p on v.passport_id=p.passport_id'))

        // Where Condition
        this.filters(q, filters)
        
        // Group By Record
        if(groupBy) q.groupBy(db.raw(groupBy))

        // Return Result
        const result = await q
        return result && result.length ? result : null
    },

    deleted: async function(filters={}) {
        let addRawQuery1 = ``
        let addRawQuery2 = ``
        
        // Custom Query
        if(filters){
            if(filters.port){
                addRawQuery1+=` and port = '${filters.port}'`
                addRawQuery2+=` and port = '${filters.port}'`
            }
            if(filters.sex) addRawQuery1+=` and sex = '${filters.sex}'`
            if(filters.visa_type) addRawQuery1+=` and visa_type = '${filters.visa_type}'`
            if(filters.nationality) addRawQuery1+=` and nationality ='${filters.nationality}'`
            if(filters.start_date) addRawQuery1 += ` and created_at >= '${filters.start_date}'`
            if(filters.end_date) addRawQuery1 += ` and created_at <= '${filters.end_date}'`
        }

        let rawQuery = `SELECT COUNT(*) as total FROM (SELECT passport_id FROM visas WHERE deleted = 1 ${addRawQuery1 ? addRawQuery1 :''} GROUP BY passport_id) as v1 JOIN (SELECT passport_id FROM visas WHERE deleted = 1 ${addRawQuery2 ? addRawQuery2 :''} GROUP BY passport_id ) as v2 on v1.passport_id=v2.passport_id;`

        const q = db.raw(rawQuery)

        const result = await q
        return result[0][0].total ? result[0][0].total :  result.total = 0
    },

    recreated: async function(filters={}) {
        let addRawQuery1 = ``
        let addRawQuery2 = ``
        
        // Custom Query
        if(filters){
            if(filters.port){
                addRawQuery1+=` and port = '${filters.port}'`
                addRawQuery2+=` and port = '${filters.port}'`
            }
            if(filters.visa_type) addRawQuery1+=` and visa_type = '${filters.visa_type}'`
            if(filters.sex) addRawQuery1+=` and sex = '${filters.sex}'`
            if(filters.nationality) addRawQuery1+=` and nationality = '${filters.nationality}'`
            if(filters.start_date) addRawQuery1 += ` and created_at >= '${filters.start_date}'`
            if(filters.end_date) addRawQuery1 += ` and created_at <= '${filters.end_date}'`
        }

        let rawQuery = `SELECT COUNT(*) as total FROM (SELECT passport_id FROM visas WHERE deleted = 0 ${addRawQuery1 ? addRawQuery1 :''} GROUP BY passport_id) as v1 JOIN (SELECT passport_id FROM visas WHERE deleted = 1 ${addRawQuery2 ? addRawQuery2 :''} GROUP BY passport_id ) as v2 on v1.passport_id=v2.passport_id;`

        const q = db.raw(rawQuery)

        const result = await q
        return result[0][0].total ? result[0][0].total :  result.total = 0
    },

    filters: function(q, filters=null) {
        if(filters) {
            if(filters.start_date) q.where('v.created_at', '>=', filters.start_date)
            if(filters.end_date) q.where('v.created_at', '<=', filters.end_date)
            if(filters.port) q.where('v.port', filters.port)
            if(filters.deleted) q.where('v.deleted', filters.deleted)
            if(filters.nationality) q.where('v.nationality', filters.nationality.toUpperCase())
            if(filters.visa_type) q.where('v.visa_type', filters.visa_type.toUpperCase())
            if(filters.sex) q.where('v.sex', filters.sex.toUpperCase())
        }
    },
}

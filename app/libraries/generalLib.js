const date = require('date-and-time');
const uuid = require('uuid')


module.exports = {  
    // Generate Form Erros Messages
    formErrors: function(errors) {
      let data = {};
      let message = []
      errors.forEach(val => {
        const msg = "The "+val.path+" "+(val.msg.search('the ') >= 0 ? val.msg.substring(4) : val.msg)+"."
        if(!message.includes(msg)) {
            message.push(msg)
            if(data[val.path] == undefined) {
                data[val.path] = {'message': val.msg+"."}
            } else {
                // data[val.path].message = data[val.path].message+" "+val.msg+"."
            }            
        }        
      })
      return {'code':'invalid_request', 'type':'validation_error', 'message': message.join(' '), 'errors': data}
    },

    // Generate login infomation
    loginInfo: function(user) {
        return {
            'id': user.uid,
            'name': user.name,
            'username': user.username,
            'role': user.role,
            'port': user.port,
            'permssions': user.permssions
        }
    },

    // Date YYYY-MM-DD
    date: function({setDate=null, addYear=null, addDay=null, minusDay=null, minusYear=null, format='YYYY-MM-DD'}={}) {
        const now = setDate ? new Date(setDate) : new Date()
        if(addYear) now.setFullYear(now.getFullYear() + addYear)
        if(minusYear) now.setFullYear(now.getFullYear() - minusYear)
        if(addDay) now.setDate(now.getDate() + addDay)
        if(minusDay) now.setDate(now.getDate() - minusDay)
        const pattern = date.compile(format);
        return date.format(now, pattern)
        return [now.getFullYear(), ('0' + (now.getMonth() + 1)).slice(-2), ('0' + now.getDate()).slice(-2)].join('-')
    },

    // Datetime YYYY-MM-DD HH:ii:ss
    dateTime: function({setDate=null, addYear=null, addDay=null, minusDay=null, minusYear=null, addHour=null, minusHour=null, isEndDate=false}={}) {
        var subfix = ''
        if(setDate) {
            setDate = setDate.trim()
            if(setDate.match(/[0-9]{4}/g)) subfix = isEndDate ? '-12-31 23:59:59' : '-01-01 00:00:00'
            if(setDate.match(/[0-9]{4}\-[0-9]{1,2}/g)) {
                if(isEndDate) {
                    const dates = setDate.split('-')
                    const t = new Date(dates[0], dates[1], 0)
                    subfix = '-'+t.getDate()+' 23:59:59'
                } else {
                    subfix = '-01 00:00:00'
                }
            }
            
        if(setDate.match(/[0-9]{4}\-[0-9]{1,2}-[0-9]{1,2}\ [0-9]{1,2}\:[0-9]{1,2}/g)) { subfix = !isEndDate ? ':00' : ':59' }
            else if(setDate.match(/[0-9]{4}\-[0-9]{1,2}-[0-9]{1,2}\ [0-9]{1,2}/g)) { subfix = isEndDate ? ':59:59' : ':00:00' }
            else if(setDate.match(/[0-9]{4}\-[0-9]{1,2}-[0-9]{1,2}/g)) { subfix = isEndDate ? ' 23:59:59' : ' 00:00:00' }
        }

        const date = setDate ? new Date(setDate+subfix) : new Date()
        
        if(!isNaN(date.valueOf())) {
            
            if(addYear) date.setFullYear(date.getFullYear() + parseInt(addYear))
            if(minusYear) date.setFullYear(date.getFullYear() - parseInt(minusYear))
            if(addDay) date.setDate(date.getDate() + parseInt(addDay))
            if(minusDay) date.setDate(date.getDate() - parseInt(minusDay))
            if(addHour) date.setHours(date.getHours() + parseInt(addHour))
            if(minusHour) date.setHours(date.getHours() - parseInt(minusHour))
            return [date.getFullYear(), ('0' + (date.getMonth() + 1)).slice(-2), ('0' + date.getDate()).slice(-2)].join('-')+' '+[('0'+date.getHours()).slice(-2), ('0'+date.getMinutes()).slice(-2), ('0'+date.getSeconds()).slice(-2)].join(':')
        }
        return null
    },
    
    // Get ip from request
    getIp: function(req) {
        return req.ip.replace('::ffff:','')
    },

    // Return visa expired-date
    visaExpiredDate: function(visa_type){
        const today = new Date();
        const visa_expired_date = visa_type.duration_type === 'day' ? new Date(today.setDate(today.getDate() + visa_type.duration)) : visa_type.duration_type === 'month' ? new Date(today.setMonth(today.getMonth() + visa_type.duration)) :  visa_type.duration_type === 'year' ? new Date(today.setFullYear(today.getFullYear() + visa_type.duration)) : ""
        return [visa_expired_date.getFullYear(), ('0' + (visa_expired_date.getMonth() + 1)).slice(-2), ('0' + visa_expired_date.getDate()).slice(-2)].join('-')
    },

    // For omit data 
    omit: function (obj, ...props) {
        const result = { ...obj };
        props.forEach(function(prop) {
          delete result[prop];
        });
        return result;
    },

    // DateTime: DD-MM-YYYY HH:mn:ss
    formatDateTime: function (inputDate) {
        if(!inputDate) return null
        const date = new Date(inputDate);
        return [date.getFullYear(), ('0' + (date.getMonth() + 1)).slice(-2), ('0' + date.getDate()).slice(-2)].join('-')+' '+[('0'+date.getHours()).slice(-2), ('0'+date.getMinutes()).slice(-2), ('0'+date.getSeconds()).slice(-2)].join(':')
    },

    // Date: DD-MM-YYYY
    formatDate: function (inputDate) {
        if(!inputDate) return null
        const date = new Date(inputDate);
        return [date.getFullYear(), ('0' + (date.getMonth() + 1)).slice(-2), ('0' + date.getDate()).slice(-2)].join('-')
    },

    // Generate record id
    generateUUID: function generateUUID(port=null) {
        return uuid.v5((port??'NONE')+'-'+Date.now(), uuid.v4())
    },

    // Generate record id for passport
    strToUUID: function (str) {
        return uuid.v5(str, uuid.v5.URL)
    },

    // Validate uuid
    uuidValidate: function(str){
        return uuid.validate(str)
    },

    // Format milli to minute:second mm:ss
    millisToMinutesAndSeconds: function (millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

  }
  
   
module.exports = {
    permission: function({user=null, p=null}={}) {
        let perms=[]
        if(!user.permissions) {
            return ({'status': 403 ,'message':'Dont have permission to request data.'})       
        }
        perms.push(...user.permissions.split(','));
        if(!perms.includes(p)) return ({'status': 403, 'message':'Dont have permission to request data.'})
    },  
  }
  

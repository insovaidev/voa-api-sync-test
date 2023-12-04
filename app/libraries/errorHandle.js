module.exports = {

    sqlError: function(error) {
        return {
                "code": error.code,
                "type": "validation_error",
                "message":  error.sqlMessage.includes('truncated')? `missing values for [${error.sqlMessage.match(/\'(.*?)\'/)[1]}] field` : `${error.sqlMessage}`
        }
    },  
  }
  

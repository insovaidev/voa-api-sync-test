
const authLib = require('../libraries/authLib')
const checkAuth = async (req, res, next) => {
  const result = await authLib.check(req)
  if(result.status == 200) {
    req.me = result.user
    return next();
  }
  res.status(result.status).send({'message':result.message});
}
module.exports = checkAuth
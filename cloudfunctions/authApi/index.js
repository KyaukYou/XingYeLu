const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

const handlers = {
  "login": async (event, context) => {
    console.log(event)
      console.log(context)
    
      // 可执行其他自定义逻辑
      // console.log 的内容可以在云开发云函数调用日志查看
    
      // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
      const wxContext = cloud.getWXContext()
    
      return {
        event,
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
        env: wxContext.ENV,
      }
  }
}

exports.main = async (event = {}, context) => {
  const action = event.action || event.name || event.functionName

  if (action && handlers[action]) {
    return handlers[action](event, context)
  }

  return {
    status: 'err',
    message: 'Unknown cloud action',
    action
  }
}

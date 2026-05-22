// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // let page = Math.max(event.page * 1,1) - 1;
  return  await db.collection('versions').where({
    _id: '8d4183e26a0fb0d50016b2240227c294'
  })
  .field({
    _id: false,
    version: true
  })
  .get()
  
}
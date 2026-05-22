// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection('admin').where({
    _id: '5290ec146a0faef3001585d25d2205fe'
  })
  .field({
    _id: false,
    controlChat: true,
  })
  .get()

}
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const VERSION_ID = '8d4183e26a0fb0d50016b2240227c294'
const ADMIN_OPENID = 'oRp3y0MvsGx3TW5zPRYg4iUcTTpI'

async function queryVersion(field) {
  let res = await db.collection('versions').where({
    _id: VERSION_ID
  })
  .field(field)
  .get()

  if (res.data.length > 0) {
    return res
  }

  res = await db.collection('versions').where({
    openid: ADMIN_OPENID
  })
  .field(field)
  .get()

  if (res.data.length > 0) {
    return res
  }

  return await db.collection('versions')
  .field(field)
  .limit(1)
  .get()
}

async function getVersionDocId(openid) {
  let res = await db.collection('versions').where({
    openid: openid
  })
  .field({
    _id: true
  })
  .limit(1)
  .get()

  if (res.data.length > 0) {
    return res.data[0]._id
  }

  res = await db.collection('versions').where({
    _id: VERSION_ID
  })
  .field({
    _id: true
  })
  .limit(1)
  .get()

  if (res.data.length > 0) {
    return res.data[0]._id
  }

  res = await db.collection('versions')
  .field({
    _id: true
  })
  .limit(1)
  .get()

  return res.data.length > 0 ? res.data[0]._id : ''
}

const handlers = {
  "getAdmin": async (event, context) => {
    return await db.collection('admin').where({
        openid: event.openid
      }).get()
  },

  "getAdminX": async (event, context) => {
    return await db.collection('admin').where({
        _id: '5290ec146a0faef3001585d25d2205fe'
      })
      .field({
        _id: false,
        controlDiary: true,
      })
      .get()
  },

  "getCommentBol": async (event, context) => {
    return await db.collection('admin').where({
        _id: '5290ec146a0faef3001585d25d2205fe'
      })
      .field({
        _id: false,
        controlChat: true,
      })
      .get()
  },

  "controlChat": async (event, context) => {
    try {
        // if (event.openid !== 'oRp3y0MvsGx3TW5zPRYg4iUcTTpI') {
        //   return false;
        // }
        console.log(event)
        return await db.collection('admin').where({
            openid: event.openid
          })
          .update({
            data: {
              controlChat: event.bol
            }
          })
    
      } catch (e) {
        console.error(e)
      }
  },

  "controlDiary": async (event, context) => {
    try {
        // if (event.openid !== 'oRp3y0MvsGx3TW5zPRYg4iUcTTpI') {
        //   return false;
        // }
        console.log(event)
        return await db.collection('admin').where({
            openid: event.openid
          })
          .update({
            data: {
              controlDiary: event.bol
            }
          })
    
      } catch (e) {
        console.error(e)
      }
  },

  "getVersion": async (event, context) => {
    // let page = Math.max(event.page * 1,1) - 1;
      return await queryVersion({
        _id: false,
        arr: true,
        version: true,
        updatedTime: true
      })
  },

  "getVersionOne": async (event, context) => {
    // let page = Math.max(event.page * 1,1) - 1;
      return await queryVersion({
        _id: false,
        version: true
      })
  },

  "updateVersion": async (event, context) => {
    try {
        if (event.openid !== ADMIN_OPENID) {
          return false;
        }
        console.log(event)
        const versionId = await getVersionDocId(event.openid)
        if (!versionId) {
          return await db.collection('versions').add({
            data: {
              openid: event.openid,
              arr: event.arr,
              version: event.version,
              updatedTime: event.updatedTime
            }
          })
        }
        return await db.collection('versions').doc(versionId).update({
          data: {
            openid: event.openid,
            arr: event.arr,
            version: event.version,
            updatedTime: event.updatedTime
          }
        })
    
      } catch (e) {
        console.error(e)
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

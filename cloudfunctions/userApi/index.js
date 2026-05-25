const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

const handlers = {
  "createUser": async (event, context) => {
    try {
        return await db.collection('users').add({
          data: event.user
        })
      } 
      catch(e) {
        console.error(e)
      }
  },

  "ifUser": async (event, context) => {
    const user = await db.collection('users').where({
        openid: event.openid
      })
      .field({
        background_bol: true,
        background_url: true,
        blur: true,
        collection_num: true,
        color: true,
        diary_num: true,
        fans:true,
        following_num: true,
        hue: true,
        like_num: true,
        openid: true,
        roles: true,
        userInfo: true,
        secret: true,
        answer: true,
        message: true
      })
      .get()
    
      if(user.data.length > 0) {
    
        db.collection('users').where({
          openid: event.openid
        }).update({
          data: {
            updated_time: event.time
          }
        })
    
        return {
          status: 'ok',
          data: user.data[0]
        }
      }
      else {
        return {
          status: 'err'
        }
      }
  },

  "getUserInfo": async (event, context) => {
    let res = await db.collection('users').where({
        openid: event.openid
      })
      .field({
        userDetail:true,
        userInfo: true,
        background_bol: true,
        background_url: true,
        blur: true,
        collection_num: true,
        color: true,
        diary_num: true,
        fans: true,
        following_num: true,
        secret: true
      })
      .get()
    
      if(res.data[0].secret === true) {
        let result = res.data[0]
        let obj = {
          userInfo: result.userInfo,
          background_bol: result.background_bol,
          background_url: result.background_url,
          blur: result.blur,
          color: result.color,
          secret: result.secret
        }
        return obj;
      }
      else {
        let obj = res.data[0]
        return obj;
      }
  },

  "getUserDetail": async (event, context) => {
    return  await db.collection('users').where({
        openid: event.openid
      })
      .field({
        userDetail:true
      })
      .get()
  },

  "getUserArr": async (event, context) => {
    // let page = Math.max(event.page * 1,1) - 1;
      return  await db.collection('users').where({
        openid: event.openid
      })
      .field({
        like: true,
        collection: true
      })
      .get()
  },

  "getAnswerBol": async (event, context) => {
    // let page = Math.max(event.page * 1,1) - 1;
      return  await db.collection('users').where({
        openid: event.openid
      })
      .field({
        _id: false,
        answer: true
      })
      .get()
  },

  "updateCustom": async (event, context) => {
    try {
        // return event
        return await db.collection('users').where({
          openid: event.openid
        })
        .update({
          data: event.update
        })
      } catch(e) {
        console.error(e)
      }
  },

  "updateUserDetail": async (event, context) => {
    try {
        // return event
        return await db.collection('users').where({
          openid: event.openid
        })
        .update({
          data: {
            userDetail: event.userDetail
          }
        })
      } catch(e) {
        console.error(e)
      }
  },

  "updateUserSecret": async (event, context) => {
    try {
        // return event
        return await db.collection('users').where({
          openid: event.openid
        })
        .update({
          data: {
            secret: event.secret
          }
        })
      } catch(e) {
        console.error(e)
      }
  },

  "setUserAnswer": async (event, context) => {
    try {
        return await db.collection('users').where({
          openid: event.openid
        })
        .update({
          data: {
            answer: false
          }
        })
      } 
      catch(e) {
        console.error(e)
      }
  },

  "setUserDiaryNum": async (event, context) => {
    try {
        return await db.collection('users').where({
            openid: event.openid
          })
          .update({
            data: {
              diary_num: _.inc(1)
            }
          })
    
      } catch (e) {
        console.error(e)
      }
  },

  "setUserCollectionNum": async (event, context) => {
    try {
        return await db.collection('users').where({
            openid: event.openid
          })
          .update({
            data: {
              collection_num: _.inc(event.num),
              collection: event.collection
            }
          })
    
      } catch (e) {
        console.error(e)
      }
  },

  "setUserLikeNum": async (event, context) => {
    try {
        return await db.collection('users').where({
            openid: event.openid
          })
          .update({
            data: {
              like_num: _.inc(event.num),
              like: event.like
            }
          })
    
      } catch (e) {
        console.error(e)
      }
  },

  "watchUser": async (event, context) => {
    try {
    
        if(event.openid === '') {
          return false;
        }
    
        await db.collection('users').where({
          openid: event.openid
        })
        .update({
          data: {
            following: _.push(event.userOpenid),
            following_num: _.inc(1)
          }
        })
    
        let res = await db.collection('users').where({
          openid: event.userOpenid
        })
        .update({
          data: {
            fans: _.inc(1)
          }
        })
        return res
    
      } 
      catch(e) {
        console.error(e)
      }
  },

  "unwatchFans": async (event, context) => {
    try {
    
        if(event.openid === '') {
          return false;
        }
    
        let fArr = await db.collection('users').where({
          openid: event.openid
        })
        .field({
          following: true
        }).get();
    
    
        await db.collection('users').where({
          openid: event.openid
        })
        .update({
          data: {
            following: _.pull(event.userOpenid),
            following_num: _.inc(-1)
          }
        })
    
        let res = await db.collection('users').where({
          openid: event.userOpenid
        })
        .update({
          data: {
            fans: _.inc(-1)
          }
        })
        return res
    
      } 
      catch(e) {
        console.error(e)
      }
  },

  "ifWatch": async (event, context) => {
    try {
        return await db.collection('users').where({
            openid: event.openid,
            following: event.userOpenid
          })
          .get()
    
      } catch (e) {
        console.error(e)
      }
  },

  "setUserFans": async (event, context) => {
    const wxContext = cloud.getWXContext()
    
      return {
        event,
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
      }
  },

  "almightyApi": async (event, context) => {
    if (event.type === 'getFollow') {
    
        let res = await db.collection('users').where({
            openid: event.openid
          })
          .field({
            following: true
          })
          .get()
        if (res.data.length > 0) {
          let arr = JSON.parse(JSON.stringify(res.data[0].following))
          let resArr = [];
          for (let i = 0; i < arr.length; i++) {
            let user = await db.collection('users').where({
              openid: arr[i]
            }).field({
              'userInfo.nickName': true,
              'userInfo.avatarUrl': true,
              'userInfo.gender': true,
              openid: true
            }).get();
    
            let obj = {
              userInfo: user.data[0].userInfo,
              openid: user.data[0].openid
            }
            resArr.push(obj)
          }
          return resArr;
        } else {
          return [];
        }
    
      } else if (event.type === 'getMyFollow') {
        let res = await db.collection('users').where({
            openid: event.openid
          })
          .field({
            following: true
          })
          .get()
        if (res.data.length > 0) {
          let arr = JSON.parse(JSON.stringify(res.data[0].following))
          let resArr = [];
          for (let i = 0; i < arr.length; i++) {
            let user = await db.collection('users').where({
              openid: arr[i]
            }).field({
              'userInfo.nickName': true,
              'userInfo.avatarUrl': true,
              'userInfo.gender': true,
              openid: true
            }).get();
    
            let obj = {
              userInfo: user.data[0].userInfo,
              openid: user.data[0].openid
            }
            resArr.push(obj)
          }
          return resArr;
        } else {
          return [];
        }
      } else if (event.type === 'getFans') {
        let res = await db.collection('users').where({
            following: event.openid
          })
          .field({
            'userInfo.nickName': true,
            'userInfo.avatarUrl': true,
            'userInfo.gender': true,
            openid: true
          })
          .get()
    
        return res.data;
    
      } else if (event.type === 'getDiaryNo') {
        // 第几页
        let page = Math.max(event.page * 1, 1) - 1;
    
        // 每页几项
        let perPage = Math.max(event.per_page * 1, 1);
    
        //排序方式
        let sortName = '';
        let sortValue = 'desc'
        if (event.sort === 'updatedTimeA') {
          sortName = 'updatedTime';
        } else if (event.sort === 'updatedTimeB') {
          sortName = 'updatedTime';
          sortValue = 'asc'
        } else if (event.sort === 'like') {
          sortName = 'like';
        } else if (event.sort === 'see') {
          sortName = 'see';
        }
    
    
        let res = await db.collection('diarys')
          .orderBy(sortName, sortValue)
          .field({
            updatedTime: true,
            title: true,
            title_image: true,
            see: true,
            location: true,
            lock: true,
            like: true,
            dayNum: true,
            collection: true,
            openid: true
          })
          .limit(perPage)
          .skip(page * perPage)
          .get()
    
        for (let i = 0; i < res.data.length; i++) {
          let user = await db.collection('users').where({
            openid: res.data[i].openid
          }).field({
            'userInfo.nickName': true,
            'userInfo.avatarUrl': true,
            openid: true
          }).get();
          if(user.data.length > 0) {
            res.data[i].userInfo = user.data[0].userInfo
            res.data[i].userInfo.openid = user.data[0].openid
          }
          
        }
    
        return res;
      } else if (event.type === 'getDiary') {
        // 第几页
        let page = Math.max(event.page * 1, 1) - 1;
    
        // 每页几项
        let perPage = Math.max(event.per_page * 1, 1);
    
        //排序方式
        let sortName = '';
        let sortValue = 'desc'
        if (event.sort === 'updatedTimeA') {
          sortName = 'updatedTime';
        } else if (event.sort === 'updatedTimeB') {
          sortName = 'updatedTime';
          sortValue = 'asc'
        } else if (event.sort === 'like') {
          sortName = 'like';
        } else if (event.sort === 'see') {
          sortName = 'see';
        }
    
    
        let res = await db.collection('diarys').where(_.or(
              [{
                  title: db.RegExp({
                    regexp: event.value,
                    option: 'i'
                  })
                },
                {
                  location: db.RegExp({
                    regexp: event.value,
                    option: 'i'
                  })
                }
              ]
            )
            .and([{
              show: true,
              ifDelete: false,
              openid: event.openid
            }])
          )
          .orderBy(sortName, sortValue)
          .field({
            updatedTime: true,
            title: true,
            title_image: true,
            see: true,
            location: true,
            lock: true,
            like: true,
            dayNum: true,
            collection: true,
            openid: true
          })
          .limit(perPage)
          .skip(page * perPage)
          .get()
    
        for (let i = 0; i < res.data.length; i++) {
          let user = await db.collection('users').where({
            openid: res.data[i].openid
          }).field({
            'userInfo.nickName': true,
            'userInfo.avatarUrl': true,
            openid: true
          }).get();
          if(user.data.length > 0) {
            res.data[i].userInfo = user.data[0].userInfo
            res.data[i].userInfo.openid = user.data[0].openid
          }
        }
    
        return res;
      } else if (event.type === 'getMyDiary') {
        return await db.collection('diarys').where({
            _id: event.id,
          })
          .get()
      } else if (event.type === 'getUsers') {
        // 第几页
        let page = Math.max(event.page * 1, 1) - 1;
    
        // 每页几项
        let perPage = Math.max(event.per_page * 1, 1);
    
        if(event.keyWords != "") {
          let res = await db.collection('users').where(_.or(
            [
              {
                "userInfo.nickName": db.RegExp({
                  regexp:event.keyWords,
                  option:'i'
                })
              },
            ]
          )
          )
            .orderBy(event.sort == 'tab_one' ? 'updated_time' : 'created_time', 'desc')
            .field({
              'userInfo.nickName': true,
              'userInfo.avatarUrl': true,
              'userInfo.gender': true,
              openid: true,
              created_time: true,
              updated_time: true,
            })
            .limit(perPage)
            .skip(page * perPage)
            .get()
      
          return res;
        }
        else {
          let res = await db.collection('users')
            .orderBy(event.sort == 'tab_one' ? 'updated_time' : 'created_time', 'desc')
            .field({
              'userInfo.nickName': true,
              'userInfo.avatarUrl': true,
              'userInfo.gender': true,
              openid: true,
              created_time: true,
              updated_time: true,
            })
            .limit(perPage)
            .skip(page * perPage)
            .get()
      
          return res;
        }
      }
      else if(event.type === 'adminGetUserInfo') {
        let res = await db.collection('users').where({
          openid: event.openid
        })
        .field({
          userDetail:true,
          userInfo: true,
          background_bol: true,
          background_url: true,
          blur: true,
          collection_num: true,
          color: true,
          diary_num: true,
          fans: true,
          following_num: true,
          secret: true
        })
        .get()
      
        // if(res.data[0].secret === true) {
          // let result = res.data[0]
          // let obj = {
          //   userInfo: result.userInfo,
          //   background_bol: result.background_bol,
          //   background_url: result.background_url,
          //   blur: result.blur,
          //   color: result.color,
          //   secret: result.secret
          // }
          // return obj;
        // }
        // else {
          if(res.data.length > 0) {
            let obj = res.data[0]
            return obj;
          }
          
        // }
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

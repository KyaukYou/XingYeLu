const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

const handlers = {
  "createDiary": async (event, context) => {
    try {
        return await db.collection('diarys').add({
          data: event.diary
        })
      } 
      catch(e) {
        console.error(e)
      }
  },

  "updateDiary": async (event, context) => {
    try {
        return await db.collection('diarys').where({
          _id: event.id,
          openid: event.openid
        })
        .update({
          data: event.diary
        })
      } 
      catch(e) {
        console.error(e)
      }
  },

  "getDiaryDetail": async (event, context) => {
    let res = await db.collection('diarys').where({
          _id: event.id
        })
        .get()
    
      let user = await db.collection('users').where({
        openid: res.data[0].openid
      }).field({
        'userInfo.nickName': true,
        'userInfo.avatarUrl': true,
        openid: true
      }).get();
      res.data[0].userInfo = user.data[0].userInfo
      res.data[0].userInfo.openid = user.data[0].openid
    
      return res;
  },

  "getDiary_noValue": async (event, context) => {
    // 第几页
      let page = Math.max(event.page * 1,1) - 1;
    
      // 每页几项
      let perPage = Math.max(event.per_page * 1,1);
    
      //排序方式
      let sortName = '';
      let sortValue = 'desc'
      if(event.sort === 'updatedTimeA') {
        sortName = 'updatedTime';
      }
      else if(event.sort === 'updatedTimeB') {
        sortName = 'updatedTime';
        sortValue = 'asc'
      }
      else if(event.sort === 'like') {
        sortName = 'like';
      }
      else if(event.sort === 'see') {
        sortName = 'see';
      }
    
    
      let res = await db.collection('diarys').where(
        {
          show: true,
          ifDelete: false
        }
      )
      .orderBy(sortName,sortValue)
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
    
      for(let i=0; i<res.data.length; i++) {
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
  },

  "getDiary_value": async (event, context) => {
    // 第几页
      let page = Math.max(event.page * 1,1) - 1;
    
      // 每页几项
      let perPage = Math.max(event.per_page * 1,1);
    
      //排序方式
      let sortName = '';
      let sortValue = 'desc'
      if(event.sort === 'updatedTimeA') {
        sortName = 'updatedTime';
      }
      else if(event.sort === 'updatedTimeB') {
        sortName = 'updatedTime';
        sortValue = 'asc'
      }
      else if(event.sort === 'like') {
        sortName = 'like';
      }
      else if(event.sort === 'see') {
        sortName = 'see';
      }
    
    
      let res = await db.collection('diarys').where(_.or(
        [
          {
            title: db.RegExp({
              regexp:event.value,
              option:'i'
            })
          },
          {
            location: db.RegExp({
              regexp:event.value,
              option:'i'
            })
          }
        ]
      )
      .and([
        {
          show: true,
          ifDelete: false
        }
      ])
      )
      .orderBy(sortName,sortValue)
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
    
      for(let i=0; i<res.data.length; i++) {
        let user = await db.collection('users').where({
          openid: res.data[i].openid
        }).field({
          'userInfo.nickName': true,
          'userInfo.avatarUrl': true,
          openid: true
        }).get();
        res.data[i].userInfo = user.data[0].userInfo
        res.data[i].userInfo.openid = user.data[0].openid
      }
    
      return res;
  },

  "getMyDiary": async (event, context) => {
    return  await db.collection('diarys').where({
        _id: event.id
      })
      .get()
  },

  "getMyDiary_noValue": async (event, context) => {
    // 第几页
      let page = Math.max(event.page * 1,1) - 1;
    
      // 每页几项
      let perPage = Math.max(event.per_page * 1,1);
    
      //排序方式
      let sortName = '';
      let sortValue = 'desc'
      if(event.sort === 'updatedTimeA') {
        sortName = 'updatedTime';
      }
      else if(event.sort === 'updatedTimeB') {
        sortName = 'updatedTime';
        sortValue = 'asc'
      }
      else if(event.sort === 'like') {
        sortName = 'like';
      }
      else if(event.sort === 'see') {
        sortName = 'see';
      }
    
    
      let res = await db.collection('diarys').where(
        {
          openid: event.openid
        }
      )
      .orderBy(sortName,sortValue)
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
    
      for(let i=0; i<res.data.length; i++) {
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
  },

  "getMyDiary_value": async (event, context) => {
    // 第几页
      let page = Math.max(event.page * 1,1) - 1;
    
      // 每页几项
      let perPage = Math.max(event.per_page * 1,1);
    
      //排序方式
      let sortName = '';
      let sortValue = 'desc'
      if(event.sort === 'updatedTimeA') {
        sortName = 'updatedTime';
      }
      else if(event.sort === 'updatedTimeB') {
        sortName = 'updatedTime';
        sortValue = 'asc'
      }
      else if(event.sort === 'like') {
        sortName = 'like';
      }
      else if(event.sort === 'see') {
        sortName = 'see';
      }
    
    
      let res = await db.collection('diarys').where(_.or(
        [
          {
            title: db.RegExp({
              regexp:event.value,
              option:'i'
            })
          },
          {
            location: db.RegExp({
              regexp:event.value,
              option:'i'
            })
          }
        ]
      )
      .and([
        {
          openid: event.openid
        }
      ])
      )
      .orderBy(sortName,sortValue)
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
    
      for(let i=0; i<res.data.length; i++) {
        let user = await db.collection('users').where({
          openid: res.data[i].openid
        }).field({
          'userInfo.nickName': true,
          'userInfo.avatarUrl': true,
          openid: true
        }).get();
        res.data[i].userInfo = user.data[0].userInfo
        res.data[i].userInfo.openid = user.data[0].openid
      }
    
      return res;
  },

  "getMyCollection": async (event, context) => {
    // 第几页
      let page = Math.max(event.page * 1,1) - 1;
    
      // 每页几项
      let perPage = Math.max(event.per_page * 1,1);
    
      let res = await db.collection('users').where({
        openid: event.openid
      })
      .field({
        collection: true
      })
      .get();
      // return res;
      let arr = []
      for(let i=0; i<res.data[0].collection.length; i++) {
        let resX = await db.collection('diarys').where(
          {
            show: true,
            ifDelete: false,
            _id: res.data[0].collection[i]
          }
        )
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
        .get()
        if(resX.data.length != 0) {
          let user = await db.collection('users').where({
            openid: resX.data[0].openid
          })
          .field({
            'userInfo.nickName': true,
            'userInfo.avatarUrl': true,
            openid: true
          })
          .get();
          resX.data[0].userInfo = user.data[0].userInfo
          resX.data[0].userInfo.openid = user.data[0].openid
          arr.push(resX.data[0])
        }
      }  
      //a-b是从小到大
      //b-a是从大到小
      // 时间从大到小排序
      if(event.sort === 'updatedTimeA') {
        arr = arr.sort(function(a,b) {
          return new Date(b.updatedTime).getTime() - new Date(a.updatedTime).getTime();
        })
      }
    
      if(event.sort === 'updatedTimeB') {
        arr = arr.sort(function(a,b) {
          return new Date(a.updatedTime).getTime() - new Date(b.updatedTime).getTime();
        })
      }
    
      if(event.sort === 'like') {
        arr = arr.sort(function(a,b) {
          return b.like - a.like;
        })
      }
    
      if(event.sort === 'see') {
        arr = arr.sort(function(a,b) {
          return b.see - a.see;
        })
      }
    
    
      //筛选
      let filterArr = [];
      for(let x=0; x<arr.length; x++) {
        if(arr[x].title.includes(event.value) || arr[x].title.includes(event.value)) {
          filterArr.push(arr[x])
        }
      }
      let start = (event.page - 1) * event.per_page;
      let end = event.page * event.per_page;
      return filterArr.slice(start,end);
  },

  "addDiarySee": async (event, context) => {
    try {
        return await db.collection('diarys').where({
            _id: event.id
          })
          .update({
            data: {
              see: _.inc(1)
            }
          })
    
      } catch (e) {
        console.error(e)
      }
  },

  "lockDiary": async (event, context) => {
    try {
        return await db.collection('diarys').where({
            _id: event.id
          })
          .update({
            data: {
              lock: event.lock
            }
          })
    
      } catch (e) {
        console.error(e)
      }
  },

  "setDiaryLike": async (event, context) => {
    try {
        return await db.collection('diarys').where({
            _id: event.id
          })
          .update({
            data: {
              like: _.inc(event.num),
            }
          })
    
      } catch (e) {
        console.error(e)
      }
  },

  "setDiaryCollection": async (event, context) => {
    try {
        return await db.collection('diarys').where({
            _id: event.id
          })
          .update({
            data: {
              collection: _.inc(event.num),
            }
          })
    
      } catch (e) {
        console.error(e)
      }
  },

  "uploadComment": async (event, context) => {
    try {
        let comment = await db.collection('comments').where({
          diary_id: event.diary_id,
        })
        .get()
    
        //该日记没有评论
        if(comment.data.length <= 0) {
    
          //先创建
          await db.collection('comments').add({
            data: {
              diary_id: event.diary_id,
              updatedTime: event.updatedTime,
              createdTime: event.createdTime,
              arr: []
            }
          })
    
          let res = await db.collection('comments').where({
            diary_id: event.diary_id,
          })
          .update({
            data: {
              updatedTime: event.updatedTime,
              arr: _.push({
                content: event.content,
                openid: event.openid,
                updatedTime: event.updatedTime,
                arr: []
              })
            }
          })
    
          return res;
    
        }
    
        //有评论
        else {
    
          //一级评论
          if(event.bol === false) {
            let res = await db.collection('comments').where({
              diary_id: event.diary_id,
            })
            .update({
              data: {
                updatedTime: event.updatedTime,
                arr: _.push({
                  content: event.content,
                  openid: event.openid,
                  updatedTime: event.updatedTime,
                  arr: []
                })
              }
            })
      
            return res;
          }
    
          //二级评论
          else if(event.bol === true) {
            let res = await db.collection('comments').where({
              diary_id: event.diary_id,
            })
            .update({
              data: {
                updatedTime: event.updatedTime,
                [`arr.${event.comment_index}.arr`]: _.push(
                  {
                    content: event.content,
                    openid: event.openid,
                    updatedTime: event.updatedTime,
                    comment_openid: event.comment_openid
                  }
                )
              }
            })
            return res;
          }
    
        }
       
      } 
      catch(e) {
        console.error(e)
      }
  },

  "getComment": async (event, context) => {
    let res = await db.collection('comments').where({
        diary_id: event.diary_id
      })
      .field({
        arr: true
      })
      .get()
    
      if(res.data.length <=0 ) {
        return [];
      }
    
      let arr = JSON.parse(JSON.stringify(res.data[0].arr))
    
      for(let i=0; i<arr.length; i++) {
        let user = await db.collection('users').where({
          openid: arr[i].openid
        }).field({
          'userInfo.nickName': true,
          'userInfo.avatarUrl': true,
          openid: true
        }).get();
        arr[i].userInfo = user.data[0].userInfo
        arr[i].userInfo.openid = user.data[0].openid
    
        for(let j=0; j<arr[i].arr.length; j++) {
          let user = await db.collection('users').where({
            openid: arr[i].arr[j].openid
          }).field({
            'userInfo.nickName': true,
            'userInfo.avatarUrl': true,
            openid: true
          }).get();
    
          let commentUser = await db.collection('users').where({
            openid: arr[i].arr[j].comment_openid
          }).field({
            'userInfo.nickName': true,
            'userInfo.avatarUrl': true,
            openid: true
          }).get();
    
          arr[i].arr[j].userInfo = user.data[0].userInfo
          arr[i].arr[j].userInfo.openid = user.data[0].openid
    
          arr[i].arr[j].comment = commentUser.data[0].userInfo
          arr[i].arr[j].comment.openid = commentUser.data[0].openid
    
        }  
        
      }
    
      return arr;
  }
}

exports.main = async (event = {}, context) => {
  let action = event.action || event.name || event.functionName

  if (action === 'getDiary') {
    action = 'getDiary_noValue'
    event.sort = event.sort || 'updatedTimeA'
  }

  if (action && handlers[action]) {
    return handlers[action](event, context)
  }

  return {
    status: 'err',
    message: 'Unknown cloud action',
    action
  }
}

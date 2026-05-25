const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

const handlers = {
  "uploadQuestion": async (event, context) => {
    try {
        return await db.collection('questions').add({
          data: {
            answer: false,
            answerInfo: {},
            question: event.question,
            openid: event.openid,
            updatedTime: event.updatedTime,
            ifDelete: false
          }
        })
      } 
      catch(e) {
        console.error(e)
      }
  },

  "getUserQuestion": async (event, context) => {
    // 第几页
      const page = Math.max(event.page * 1,1) - 1;
    
      // 每页几项
      const perPage = Math.max(event.per_page * 1,1);
    
      let res = await db.collection('questions')
      .orderBy('updatedTime','desc')
      .field({
        question: true,
        updatedTime: true,
        answer: true,
        openid: true,
        ifDelete: true
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

  "getMyQuestion": async (event, context) => {
    return await db.collection('questions').where({
        openid: event.openid,
        ifDelete: false
      })
      .orderBy('updatedTime','desc')
      .field({
        ifDelete: true,
        question: true,
        updatedTime: true,
        answer: true
      })
      .get()
  },

  "getMyQuestionDetail": async (event, context) => {
    let res = await db.collection('questions').where({
        _id: event.id
      })
      .get()
    
      if(res.data[0].answer === false) {
        return res;
      }
      else {
        let user = await db.collection('users').where({
          openid: res.data[0].answerInfo.openid
        }).field({
          'userInfo.nickName': true,
          'userInfo.avatarUrl': true,
          openid: true
        }).get();
        res.data[0].answerInfo.userInfo = user.data[0].userInfo;
        res.data[0].answerInfo.userInfo.openid = user.data[0].openid
        return res;
      }
  },

  "answerQuestion": async (event, context) => {
    try {
        db.collection('users').where({
          openid: event.userOpenid
        })
        .update({
          data: {
            answer: true
          }
        })
    
        return await db.collection('questions').where({
          _id: event.id
        })
        .update({
          data: {
            'answerInfo.openid': event.openid,
            'answerInfo.answer': event.answer,
            'answerInfo.updatedTime': event.updatedTime,
            answer: true
          }
        })
      } 
      catch(e) {
        console.error(e)
      }
  },

  "cancelQuestion": async (event, context) => {
    try {
        // return event
        return await db.collection('questions').where({
          _id: event.id
        })
        .update({
          data: {
            ifDelete: false
          }
        })
      } catch(e) {
        console.error(e)
      }
  },

  "deleteQuestion": async (event, context) => {
    try {
        // return event
        return await db.collection('questions').where({
          _id: event.id
        })
        .update({
          data: {
            ifDelete: true
          }
        })
      } catch(e) {
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

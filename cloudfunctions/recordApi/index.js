const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

function limitText(value, max) {
  return String(value || '').trim().slice(0, max)
}

function normalizeDate(value) {
  const str = String(value || '').trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : ''
}

function cleanRecord(record, openid) {
  const now = limitText(record.updatedTime, 32)
  return {
    openid,
    category: record.category === 'milestone' ? 'milestone' : 'daily',
    title: limitText(record.title, 50),
    description: limitText(record.description, 2000),
    event_date: normalizeDate(record.event_date),
    importance: Math.min(Math.max(Number(record.importance || 3), 1), 5),
    mood: limitText(record.mood, 12),
    location: limitText(record.location, 60),
    images: Array.isArray(record.images) ? record.images.slice(0, 9).map(item => ({
      type: 'old',
      url: limitText(item && item.url, 300)
    })).filter(item => item.url) : [],
    tags: Array.isArray(record.tags) ? record.tags.map(item => limitText(item, 12)).filter(Boolean).slice(0, 8) : [],
    linked_diary_id: limitText(record.linked_diary_id, 64),
    createdTime: limitText(record.createdTime, 32) || now,
    updatedTime: now
  }
}

function cleanUpdate(record) {
  const data = cleanRecord(record, '')
  delete data.openid
  delete data.createdTime
  return data
}

function validate(record) {
  if (!normalizeDate(record.event_date)) {
    return 'event_date is required'
  }
  if (record.category === 'milestone' && !limitText(record.title, 50)) {
    return 'title is required for milestone'
  }
  if (!limitText(record.title, 50) && !limitText(record.description, 2000)) {
    return 'title or description is required'
  }
  return ''
}

const handlers = {
  createRecord: async (event, context, openid) => {
    const record = event.record || {}
    const message = validate(record)
    if (message) return { status: 'err', message }
    return await db.collection('records').add({
      data: cleanRecord(record, openid)
    })
  },

  updateRecord: async (event, context, openid) => {
    const record = event.record || {}
    const message = validate(record)
    if (!event.id || message) {
      return {
        status: 'err',
        message: !event.id ? 'id is required' : message
      }
    }
    return await db.collection('records').where({
      _id: event.id,
      openid
    }).update({
      data: cleanUpdate(record)
    })
  },

  deleteRecord: async (event, context, openid) => {
    if (!event.id) return { status: 'err', message: 'id is required' }
    return await db.collection('records').where({
      _id: event.id,
      openid
    }).remove()
  },

  getRecordDetail: async (event, context, openid) => {
    if (!event.id) return { status: 'err', message: 'id is required' }
    return await db.collection('records').where({
      _id: event.id,
      openid
    }).limit(1).get()
  },

  getRecordsByDate: async (event, context, openid) => {
    const date = normalizeDate(event.date)
    if (!date) return { status: 'err', message: 'date is required' }
    return await db.collection('records').where({
      openid,
      event_date: date
    }).orderBy('importance', 'desc').orderBy('createdTime', 'desc').get()
  },

  getRecordsByMonth: async (event, context, openid) => {
    const year = Number(event.year)
    const month = Number(event.month)
    if (!year || !month) {
      return { status: 'err', message: 'year and month are required' }
    }
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return await db.collection('records').where({
      openid,
      event_date: db.RegExp({
        regexp: `^${prefix}`,
        option: 'i'
      })
    }).field({
      event_date: true,
      category: true,
      importance: true,
      title: true,
      description: true,
      mood: true,
      tags: true,
      createdTime: true
    }).orderBy('event_date', 'asc').get()
  }
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const action = event.action
  const handler = handlers[action]

  if (!handler) {
    return {
      status: 'err',
      message: 'unknown action'
    }
  }

  try {
    return await handler(event, context, openid)
  } catch (err) {
    console.error(err)
    return {
      status: 'err',
      message: err.message || 'record api failed'
    }
  }
}

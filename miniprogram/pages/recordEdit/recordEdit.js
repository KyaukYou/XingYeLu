const app = getApp()

Page({
  data: {
    back: true,
    globalData: {},
    id: '',
    mode: 'create',
    saving: false,
    toastBol: false,
    toastTitle: '',
    toastDuration: 0,
    record: {
      category: 'milestone',
      title: '',
      description: '',
      event_date: '',
      importance: 3,
      mood: '',
      location: '',
      images: [],
      tags: [],
      linked_diary_id: ''
    },
    tagInput: '',
    importanceOptions: [1, 2, 3, 4, 5],
    moods: ['开心', '平静', '惊喜', '努力', '难忘', '珍贵', '期待', '释然']
  },

  onLoad(options) {
    const today = this.formatDate(new Date())
    const editing = wx.getStorageSync('recordEditing')
    const data = {
      globalData: app.globalData,
      id: options.id || '',
      mode: options.id ? 'edit' : 'create'
    }

    if (options.id && editing && editing._id === options.id) {
      data.record = {
        category: editing.category || 'milestone',
        title: editing.title || '',
        description: editing.description || '',
        event_date: editing.event_date || today,
        importance: editing.importance || 3,
        mood: editing.mood || '',
        location: editing.location || '',
        images: editing.images || [],
        tags: editing.tags || [],
        linked_diary_id: editing.linked_diary_id || ''
      }
    } else {
      data['record.event_date'] = options.date || today
    }

    this.setData(data)
  },

  onShow() {
    this.setData({
      globalData: app.globalData
    })
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  formatTime(date) {
    const ymd = this.formatDate(date)
    const h = String(date.getHours()).padStart(2, '0')
    const m = String(date.getMinutes()).padStart(2, '0')
    const s = String(date.getSeconds()).padStart(2, '0')
    return `${ymd} ${h}:${m}:${s}`
  },

  changeField(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`record.${field}`]: e.detail.value
    })
  },

  changeDate(e) {
    this.setData({
      'record.event_date': e.detail.value
    })
  },

  setImportance(e) {
    this.setData({
      'record.importance': Number(e.currentTarget.dataset.value)
    })
  },

  setMood(e) {
    this.setData({
      'record.mood': e.currentTarget.dataset.mood
    })
  },

  changeTag(e) {
    this.setData({
      tagInput: e.detail.value
    })
  },

  addTag() {
    const tag = this.data.tagInput.trim()
    if (!tag) return
    const tags = this.data.record.tags.slice()
    if (!tags.includes(tag)) tags.push(tag)
    this.setData({
      'record.tags': tags.slice(0, 8),
      tagInput: ''
    })
  },

  removeTag(e) {
    const tags = this.data.record.tags.slice()
    tags.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      'record.tags': tags
    })
  },

  async chooseImages() {
    const remain = 9 - this.data.record.images.length
    if (remain <= 0) return
    const res = await wx.chooseImage({
      count: remain
    })
    const images = this.data.record.images.concat(res.tempFilePaths.map(url => ({
      type: 'new',
      url
    })))
    this.setData({
      'record.images': images
    })
  },

  removeImage(e) {
    const images = this.data.record.images.slice()
    images.splice(e.currentTarget.dataset.index, 1)
    this.setData({
      'record.images': images
    })
  },

  async uploadImages(record) {
    const images = []
    for (let i = 0; i < record.images.length; i++) {
      const image = record.images[i]
      if (image.type === 'new') {
        const res = await this.uploadRecordFile(image.url)
        images.push({
          type: 'old',
          url: res.fileID
        })
      } else {
        images.push(image)
      }
    }
    record.images = images
    return record
  },

  async uploadRecordFile(filePath) {
    const openid = wx.getStorageSync('openid')
    const extMatch = filePath.match(/\.[^.]+?$/)
    const ext = extMatch ? extMatch[0] : '.png'
    const cloudPath = 'user/' + openid + '/records/' + new Date().getTime() + '-' + Math.floor(Math.random() * 10000) + ext
    return await wx.cloud.uploadFile({
      cloudPath,
      filePath
    })
  },

  validate(record) {
    if (!record.event_date) return '请选择日期'
    if (!record.title.trim()) return '大事件需要标题'
    if (!record.title.trim() && !record.description.trim()) return '写一点内容吧'
    return ''
  },

  async saveRecord() {
    if (!wx.getStorageSync('openid')) {
      this.showToast('请先登录')
      return
    }

    let record = JSON.parse(JSON.stringify(this.data.record))
    const message = this.validate(record)
    if (message) {
      this.showToast(message)
      return
    }

    this.setData({ saving: true })
    const now = this.formatTime(new Date())
    record.updatedTime = now
    if (this.data.mode === 'create') record.createdTime = now
    record = await this.uploadImages(record)

    const res = await wx.cloud.callFunction({
      name: 'recordApi',
      data: this.data.mode === 'edit' ? {
        action: 'updateRecord',
        id: this.data.id,
        record
      } : {
        action: 'createRecord',
        record
      }
    })

    this.setData({ saving: false })
    if (res.errMsg === 'cloud.callFunction:ok' && (!res.result || res.result.status !== 'err')) {
      this.showToast('已保存')
      setTimeout(() => {
        wx.navigateBack({ delta: 1 })
      }, 500)
    } else {
      this.showToast('保存失败')
    }
  },

  showToast(title) {
    this.setData({
      toastBol: true,
      toastTitle: title,
      toastDuration: 1800
    })
  }
})

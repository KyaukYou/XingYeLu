const app = getApp()

Page({
  data: {
    back: true,
    globalData: {},
    id: '',
    record: {},
    toastBol: false,
    toastTitle: '',
    toastDuration: 0
  },

  async onLoad(options) {
    const cached = wx.getStorageSync('recordDetail') || {}
    this.setData({
      globalData: app.globalData,
      id: options.id || '',
      record: this.decorate(cached)
    })
    if (options.id) {
      await this.loadDetail(options.id)
    }
  },

  async onShow() {
    this.setData({
      globalData: app.globalData
    })
    if (this.data.id) {
      await this.loadDetail(this.data.id)
    }
  },

  async loadDetail(id) {
    const res = await wx.cloud.callFunction({
      name: 'recordApi',
      data: {
        action: 'getRecordDetail',
        id
      }
    })
    const data = res.result && res.result.data && res.result.data[0]
    if (data) {
      this.setData({
        record: this.decorate(data)
      })
    }
  },

  decorate(record) {
    record = record || {}
    record.typeText = record.category === 'milestone' ? '大事件' : '日常'
    record.displayTitle = record.title || record.event_date || '记录'
    record.importanceText = `${record.importance || 3}级重要`
    record.images = record.images || []
    record.tags = record.tags || []
    return record
  },

  previewImage(e) {
    const index = e.currentTarget.dataset.index
    const urls = (this.data.record.images || []).map(item => item.url)
    wx.previewImage({
      current: urls[index],
      urls
    })
  },

  toEdit() {
    wx.setStorageSync('recordEditing', this.data.record)
    wx.navigateTo({
      url: `/pages/recordEdit/recordEdit?id=${this.data.record._id}`
    })
  },

  deleteRecord() {
    wx.showModal({
      title: '删除记录',
      content: '删除后无法恢复，确定继续吗？',
      success: async (res) => {
        if (!res.confirm) return
        const result = await wx.cloud.callFunction({
          name: 'recordApi',
          data: {
            action: 'deleteRecord',
            id: this.data.record._id
          }
        })
        if (result.errMsg === 'cloud.callFunction:ok' && (!result.result || result.result.status !== 'err')) {
          this.setData({
            toastBol: true,
            toastTitle: '已删除',
            toastDuration: 800
          })
          setTimeout(() => {
            wx.navigateBack({ delta: 1 })
          }, 500)
        }
      }
    })
  }
})

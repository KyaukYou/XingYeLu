const app = getApp()

const importanceColor = {
  1: '#98A2B3',
  2: '#5B8DEF',
  3: '#33A474',
  4: '#F59E0B',
  5: '#EF4444'
}

Page({
  data: {
    back: false,
    globalData: {},
    today: '',
    currentYear: 0,
    currentMonth: 0,
    selectedDate: '',
    weeks: [],
    markedDates: {},
    dayRecords: [],
    loadingMonth: false,
    loadingDay: false,
    toastBol: false,
    toastTitle: '',
    toastDuration: 0,
    importanceColor
  },

  async onLoad() {
    const now = new Date()
    const today = this.formatDate(now)
    this.setData({
      globalData: app.globalData,
      today,
      selectedDate: today,
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1
    })
    await this.refreshCalendar()
  },

  async onShow() {
    this.setData({
      globalData: app.globalData
    })
    if (this.data.selectedDate) {
      await this.refreshCalendar()
    }
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  formatDisplayDate(dateStr) {
    const date = new Date(dateStr.replace(/-/g, '/'))
    const week = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 周${week}`
  },

  buildWeeks(year, month, markedDates) {
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const offset = firstDay === 0 ? 6 : firstDay - 1
    const weeks = []
    let week = new Array(offset).fill(null)

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const marks = markedDates[dateStr] || []
      week.push({
        day,
        dateStr,
        marks: marks.slice(0, 3),
        hasMore: marks.length > 3
      })
      if (week.length === 7) {
        weeks.push(week)
        week = []
      }
    }

    if (week.length) {
      while (week.length < 7) week.push(null)
      weeks.push(week)
    }
    return weeks
  },

  async refreshCalendar() {
    await this.loadMonth()
    await this.loadDate()
  },

  async loadMonth() {
    if (!wx.getStorageSync('openid')) {
      this.setData({
        markedDates: {},
        weeks: this.buildWeeks(this.data.currentYear, this.data.currentMonth, {})
      })
      return
    }

    this.setData({ loadingMonth: true })
    const res = await wx.cloud.callFunction({
      name: 'recordApi',
      data: {
        action: 'getRecordsByMonth',
        year: this.data.currentYear,
        month: this.data.currentMonth
      }
    })

    const markedDates = {}
    const list = (res.result && res.result.data) || []
    list.forEach(item => {
      if (!markedDates[item.event_date]) markedDates[item.event_date] = []
      markedDates[item.event_date].push({
        importance: item.importance,
        category: item.category
      })
    })

    this.setData({
      markedDates,
      weeks: this.buildWeeks(this.data.currentYear, this.data.currentMonth, markedDates),
      loadingMonth: false
    })
  },

  async loadDate() {
    if (!wx.getStorageSync('openid')) {
      this.setData({ dayRecords: [] })
      return
    }

    this.setData({ loadingDay: true })
    const res = await wx.cloud.callFunction({
      name: 'recordApi',
      data: {
        action: 'getRecordsByDate',
        date: this.data.selectedDate
      }
    })

    this.setData({
      dayRecords: ((res.result && res.result.data) || []).map(item => this.decorateRecord(item)),
      loadingDay: false
    })
  },

  decorateRecord(item) {
    item.typeText = item.category === 'milestone' ? '大事件' : '日常'
    item.displayTitle = item.title || this.formatDisplayDate(item.event_date)
    item.preview = item.description || '没有填写内容'
    item.color = importanceColor[item.importance] || importanceColor[3]
    return item
  },

  selectDate(e) {
    const date = e.currentTarget.dataset.date
    if (!date) return
    this.setData({ selectedDate: date })
    this.loadDate()
  },

  prevMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth--
    if (currentMonth < 1) {
      currentMonth = 12
      currentYear--
    }
    this.setData({ currentYear, currentMonth })
    this.loadMonth()
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
    this.setData({ currentYear, currentMonth })
    this.loadMonth()
  },

  toCreate() {
    if (!wx.getStorageSync('openid')) {
      this.setData({
        toastBol: true,
        toastTitle: '请先登录',
        toastDuration: 1800
      })
      return
    }
    wx.navigateTo({
      url: `/pages/recordEdit/recordEdit?date=${this.data.selectedDate}`
    })
  },

  toDetail(e) {
    const index = e.currentTarget.dataset.index
    wx.setStorageSync('recordDetail', this.data.dayRecords[index])
    wx.navigateTo({
      url: `/pages/recordDetail/recordDetail?id=${this.data.dayRecords[index]._id}`
    })
  }
})

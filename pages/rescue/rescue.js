// pages/rescue/rescue.js
import { HTTP } from '../../utils/http.js'
import { Token } from '../../utils/token'
import { config } from '../../config.js'
var http = new HTTP()
let token = new Token()
var util = require('../../utils/util.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    swiperList: config.swiperList,
    swiperList2: config.swiperList2,
    region: config.region,
    feedOptions: config.feedOptions,
    customItem: ['全部'],
    showFeedbackModal: false,
    showWxModal: false,
    seekHelp: null,
    isNextPageLoading: false,
    onSearching: false,
    searchResult: null, // 搜索框输入时此字段变为 {items:[]}，用于控制求助列表显/隐
    searchQ: null,
    noSearchResult: false, // 无搜索结果时提示
    hasPosition: false, // 是否可获取用户位置
    feedbackId: null, // 反馈错误的数据 id
    feedErrType: null, // 选择的错误反馈类型
    typeIndex: '1', //选择分类 1 求喂养 2 我能帮
    canHelp: {},
    showUpdate: false,
    showEndDate: '',
    showHelpDate: '',
    updateId: ''
  },
  onLoad: function(options) {
    var that = this
    token.verify()
    setTimeout(() => {
      wx.getSetting({
        success(res) {
          // 用户未允许获取位置信息
          if (!res.authSetting['scope.userLocation']) {
            // 发起申请授权请求
            wx.authorize({
              scope: 'scope.userLocation',
              // 用户允许
              success: res => {
                // 通过用户当前位置请求数据
                that._rqDataBySelfLocation()
                that.setData({
                  hasPosition: true
                })
              },
              // 用户不允许
              fail(res) {
                // 通过默认地区请求数据
                that._rqDataByPosition()
              }
            })
            // 用户已允许获取位置信息
          } else {
            that._rqDataBySelfLocation()
            that.setData({
              hasPosition: true
            })
          }
        }
      })
    }, 1000)
  },
  //上拉加载
  onReachBottom: function(e) {
    if (this.data.searchQ) {
      if (this.data.searchResult.next_num) {
        this._rqSearch(this.data.searchQ, this.data.searchResult.next_num, function() {
          wx.stopPullDownRefresh()
        })
      }
    } else {
      this._rqNextPage()
    }
  },
  // 下拉刷新时请求初始数据
  onPullDownRefresh(e) {
    if (this.data.searchQ) {
      this._rqSearch(this.data.searchQ, 1, function() {
        wx.stopPullDownRefresh()
      })
    } else {
      this._rqInitData(function() {
        wx.stopPullDownRefresh()
      })
    }
  },
  RegionChange: function(e) {
    this.setData({
      region: e.detail.value[0] === '全部' ? config.region : e.detail.value,
      isNextPageLoading: true,
      onSearching: false,
      searchResult: null,
      searchQ: null,
      noSearchResult: false
    })
    this._rqDataByPosition()
  },
  onSearchInput(e) {
    var q = e.detail.value
    let page = 1
    this.setData({
      searchQ: q
    })
    if (q) this._rqSearch(q, page)
  },
  onSearchFocus(e) {
    this.setData({
      onSearching: true,
      searchResult: {
        items: []
      }
    })
  },
  onSearchConfirm(e) {
    var q = this.data.searchQ
    let page = 1
    if (q) this._rqSearch(q, page)
  },
  onSearchCancel(e) {
    this.setData({
      onSearching: false,
      searchResult: null,
      noSearchResult: false,
      searchQ: null
    })
  },
  // 求喂养
  onSeekHelpTap: function(e) {
    let that = this
    if (app.globalData.userInfo) {
      wx.navigateTo({
        url: '/pages/seek-help/seek-help'
      })
      wx.aldstat.sendEvent('点击求喂养', {})
    } else {
      wx.getUserInfo({
        withCredentials: 'false',
        lang: 'zh_CN',
        success: result => {
          app.globalData.userInfo = result.userInfo
          that.updateUserInfo(result.userInfo)
          wx.navigateTo({
            url: '/pages/seek-help/seek-help'
          })
          wx.aldstat.sendEvent('点击求喂养', {})
        },
        fail: () => {
          wx.showModal({
            title: '喂喂提示',
            content: '登录才可以发布求喂信息哦(*^_^*)',
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#3CC51F',
            success: result => {
              if (result.confirm) {
              }
            },
            fail: () => {},
            complete: () => {}
          })
        },
        complete: () => {}
      })
    }
  },
  //我能帮
  onCanHelpTap: function(e) {
    let that = this
    if (app.globalData.userInfo) {
      wx.navigateTo({
        url: '/pages/can-help/can-help'
      })
      wx.aldstat.sendEvent('点击我能帮', {})
    } else {
      wx.getUserInfo({
        withCredentials: 'false',
        lang: 'zh_CN',
        success: result => {
          app.globalData.userInfo = result.userInfo
          that.updateUserInfo(result.userInfo)
          wx.navigateTo({
            url: '/pages/can-help/can-help'
          })
          wx.aldstat.sendEvent('点击我能帮', {})
        },
        fail: () => {
          wx.showModal({
            title: '喂喂提示',
            content: '登录才可以发布能帮信息哦(*^_^*)',
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#3CC51F',
            success: result => {
              if (result.confirm) {
              }
            },
            fail: () => {},
            complete: () => {}
          })
        },
        complete: () => {}
      })
    }
  },
  onCommunicateTap: function(e) {
    wx.navigateToMiniProgram({
      appId: 'wx02dc77299f086017',
      fail: res => {
        console.log(res)
      }
    })
    wx.aldstat.sendEvent('点击跳转小程序', {})
  },
  onPhoneTap: function(e) {
    let that = this
    if (app.globalData.userInfo) {
      wx.makePhoneCall({
        phoneNumber: e.currentTarget.dataset.phone
      })
      // 阿拉丁自定义事件
      wx.aldstat.sendEvent('点击电话', {
        电话号: e.currentTarget.dataset.phone
      })
    } else {
      wx.getUserInfo({
        withCredentials: 'false',
        lang: 'zh_CN',
        success: result => {
          app.globalData.userInfo = result.userInfo
          wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone
          })
          // 阿拉丁自定义事件
          wx.aldstat.sendEvent('点击电话', {
            电话号: e.currentTarget.dataset.phone
          })
          that.updateUserInfo(result.userInfo)
        },
        fail: () => {
          wx.showModal({
            title: '喂喂提示',
            content: '登录才可以拨打电话哦(*^_^*)',
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#3CC51F',
            success: result => {
              if (result.confirm) {
              }
            },
            fail: () => {},
            complete: () => {}
          })
        },
        complete: () => {}
      })
    }
  },
  onWxTap: function(e) {
    this.setData({
      wxid: e.currentTarget.dataset.wxid,
      showWxModal: true
    })
    wx.aldstat.sendEvent('点击微信', {
      微信号: e.currentTarget.dataset.wxid
    })
  },
  onCopyWxidTap(e) {
    var data = this.data.wxid
    wx.setClipboardData({
      data: data
    })
  },
  // 更新信息按钮
  onUpdateTap: function(e) {
    let that = this
    if (app.globalData.userInfo) {
      // wx.navigateTo({
      //   url: '/pages/seek-help/seek-help?id=' + e.currentTarget.dataset.cid
      // })
      // wx.aldstat.sendEvent('点击更新', {
      //   更新数据id: e.currentTarget.dataset.cid.toString()
      // })
      this.setData({
        updateId: e.currentTarget.dataset.cid,
        showUpdate: true
      })
    } else {
      wx.getUserInfo({
        withCredentials: 'false',
        lang: 'zh_CN',
        success: result => {
          app.globalData.userInfo = result.userInfo
          this.setData({
            updateId: e.currentTarget.dataset.cid,
            showUpdate: true
          })
          that.updateUserInfo(result.userInfo)
        },
        fail: () => {
          wx.showModal({
            title: '喂喂提示',
            content: '登录才可以更新信息哦(*^_^*)',
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#3CC51F',
            success: result => {
              if (result.confirm) {
              }
            },
            fail: () => {},
            complete: () => {}
          })
        },
        complete: () => {}
      })
    }
  },
  // 纠错
  onFeedbackTap: function(e) {
    let that = this
    if (app.globalData.userInfo) {
      this.setData({
        showFeedbackModal: true,
        feedbackId: e.currentTarget.dataset.cid
      })
      wx.aldstat.sendEvent('点击纠错', {
        纠错数据id: e.currentTarget.dataset.cid.toString()
      })
    } else {
      wx.getUserInfo({
        withCredentials: 'false',
        lang: 'zh_CN',
        success: result => {
          app.globalData.userInfo = result.userInfo
          this.setData({
            showFeedbackModal: true,
            feedbackId: e.currentTarget.dataset.cid
          })
          wx.aldstat.sendEvent('点击纠错', {
            纠错数据id: e.currentTarget.dataset.cid.toString()
          })
          that.updateUserInfo(result.userInfo)
        },
        fail: () => {
          wx.showModal({
            title: '喂喂提示',
            content: '登录才可以纠错哦(*^_^*)',
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#3CC51F',
            success: result => {
              if (result.confirm) {
              }
            },
            fail: () => {},
            complete: () => {}
          })
        },
        complete: () => {}
      })
    }
  },
  hideUpdateModal(e) {
    this.setData({
      showUpdateModal: false
    })
  },
  hideFeedbackModal(e) {
    this.setData({
      showFeedbackModal: false,
      feedbackId: null
    })
  },
  hideUpdateModal(e) {
    this.setData({
      showUpdate: false,
      updateId: null,
      showHelpDate: '',
      showEndDate: ''
    })
  },
  hideWxModal(e) {
    this.setData({
      showWxModal: false
    })
  },
  // 选择错误类型
  onChooseErrType(e) {
    this.setData({
      feedErrType: e.detail.value
    })
  },
  // 提交错误反馈
  onSubmitFeedTap(e) {
    if (this.data.feedbackId !== null && this.data.feedErrType !== null) this._rqAddFeedback()
  },
  //提交更新
  onSubmitUpdate() {
    var that = this
    if (!that.data.endDate || !that.data.helpDate) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      })
      return false
    }
    var params = {
      url: 'seek-help/' + that.data.updateId,
      data: {
        last_date: that.data.endDate,
        help_date: that.data.helpDate
      },
      type: 'put',
      sCallback(res) {
        wx.hideLoading()
        wx.showToast({
          title: '已更新'
        })
        that.setData({
          showUpdate: false,
          updateId: null,
          showHelpDate: '',
          showEndDate: ''
        })
        wx.aldstat.sendEvent('更新成功', {
          更新数据id: that.data.id
        })
      }
    }
    http.request(params)
  },
  // 通过省市区请求数据
  _rqDataByPosition: function(page, callback) {
    this.setData({
      isNextPageLoading: true
    })
    var region = this.data.region,
      that = this,
      page = page || 1

    if (that.data.typeIndex === '1') {
      var params = {
        url: 'seek-help/location',
        data: {
          province: region[0] === '全国' ? '全部' : region[0],
          city: region[1] === '全省市' ? '全部' : region[1],
          district: region[2],
          page: page
        },
        sCallback: function(res) {
          // 如果不是第一页请求，将新请求到的数据加入原来数据后面
          if (page > 1) {
            var newItems = that.data.seekHelp.items.concat(res.data.items)
            res.data.items = newItems
          }

          that.setData({
            seekHelp: res.data,
            isNextPageLoading: false
          })
          callback && callback()
        }
      }
      http.request(params)
    } else {
      var params = {
        url: 'rescue/location',
        data: {
          province: region[0] === '全国' ? '全部' : region[0],
          city: region[1] === '全省市' ? '全部' : region[1],
          district: region[2],
          page: page
        },
        sCallback: function(res) {
          // 如果不是第一页请求，将新请求到的数据加入原来数据后面
          if (page > 1) {
            var newItems = that.data.canHelp.items.concat(res.data.items)
            res.data.items = newItems
          }
          that.setData({
            canHelp: res.data,
            isNextPageLoading: false
          })
          callback && callback()
        }
      }
      http.request(params)
    }
  },
  // 通过用户当前位置请求数据
  _rqDataBySelfLocation(page, callback) {
    this.setData({
      isNextPageLoading: true
    })
    var that = this,
      page = page || 1
    wx.getLocation({
      success(res) {
        var params = {
          url: 'seek-help/distance',
          data: {
            latitude: res.latitude,
            longitude: res.longitude,
            page: page
          },
          sCallback(res) {
            // 如果不是第一页请求，将新请求到的数据加入原来数据后面
            if (page > 1) {
              var newItems = that.data.seekHelp.items.concat(res.data.items)
              res.data.items = newItems
            }

            that.setData({
              seekHelp: res.data,
              isNextPageLoading: false
            })
            callback && callback()
          }
        }
        http.request(params)
      }
    })
  },
  // 请求下一页数据
  _rqNextPage(e) {
    if (this.data.typeIndex === '1') {
      if (this.data.hasPosition) {
        if (this.data.seekHelp.has_next) {
          this._rqDataBySelfLocation(this.data.seekHelp.next_num)
        }
      } else {
        if (this.data.seekHelp.has_next) {
          this._rqDataByPosition(this.data.seekHelp.next_num)
        }
      }
    } else {
      this.data.canHelp.has_next ? this._rqDataByPosition(this.data.canHelp.next_num) : ''
    }
  },
  // 请求数据
  _rqInitData(callback) {
    if (this.data.typeIndex === '1') {
      if (this.data.hasPosition) {
        this.setData({
          region: config.region
        })
        this._rqDataBySelfLocation(1, callback)
      } else {
        this._rqDataByPosition(1, callback)
      }
    } else {
      this._rqDataByPosition(1, callback)
    }
  },
  // 向服务端请求搜索数据
  _rqSearch(q, page) {
    var that = this
    var params = {
      url: 'common/search',
      data: {
        q: q,
        page: page,
        category: that.data.typeIndex === '1' ? 'seek-help' : 'rescue'
      },
      sCallback: function(res) {
        if (page > 1) {
          var newItems = that.data.searchResult.items.concat(res.data.items)
          res.data.items = newItems
        }
        that.setData({
          searchResult: res.data,
          noSearchResult: !res.data.total
        })
      }
    }
    // 防抖
    util.debounce(http.request(params), 1000, false)
  },
  // 添加错误反馈
  _rqAddFeedback(callback) {
    var that = this
    var params = {
      url: 'rescue/feedback',
      data: {
        msg_id: that.data.feedbackId,
        err_type: that.data.feedErrType
      },
      type: 'post',
      sCallback(res) {
        wx.showToast({
          title: '已提交'
        })
        wx.aldstat.sendEvent('纠错成功', {
          纠错数据id: that.data.feedbackId.toString(),
          纠错类型: that.data.feedOptions[that.data.feedErrType].content
        })
        that.hideFeedbackModal()
        that.setData({
          feedbackId: null,
          feedErrType: null
        })
      }
    }
    wx.showLoading({})
    http.request(params)
  },
  //切换分类
  changeType(e) {
    this.setData({
      typeIndex: e.currentTarget.dataset.type,
      page: 1,
      region: config.region
    })
    this._rqInitData()
  },
  //跳转详情
  toSeekDetail(e) {
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/seekDetail/seekDetail?id=' + e.currentTarget.dataset.id
    })
  },
  //更新用户信息
  updateUserInfo(item) {
    let params = {
      url: 'user/profile',
      type: 'put',
      data: {
        wx_name: item.nickName,
        wx_avatar: item.avatarUrl,
        gender: item.gender
      },
      sCallback: function(res) {}
    }
    http.request(params)
  },
  //转发
  onShareAppMessage: function(res) {
    return {
      title: '喂喂我-留守宠物救助平台',
      path: '/pages/rescue/rescue'
    }
  },
  onEndDateChange(e) {
    var timestmp = new Date(e.detail.value).getTime() / 1000
    this.setData({
      showEndDate: e.detail.value,
      endDate: timestmp
    })
  },
  onHelpDateChange: function(e) {
    var timestmp = new Date(e.detail.value).getTime() / 1000
    this.setData({
      showHelpDate: e.detail.value,
      helpDate: timestmp
    })
  },
  //banner跳转
  onSwiperTap(e) {
    var idx = e.currentTarget.dataset.idx
    wx.navigateTo({
      url: '/pages/webview/webview?idx=' + idx
    })
  }
})

// pages/rescue/rescue.js
import {
  HTTP
} from "../../utils/http.js"
import {
  config
} from "../../config.js"
var http = new HTTP();
var util = require("../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperList: config.swiperList,
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
    feedErrType: null // 选择的错误反馈类型
  },
  onLoad: function (options) {
    var that = this;
    wx.getSetting({
      success(res) {
        // 用户未允许获取位置信息
        if (!res.authSetting['scope.userLocation']) {
          // 发起申请授权请求
          wx.authorize({
            scope: 'scope.userLocation',
            // 用户允许
            success: (res) => {
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
  },
  onReachBottom: function (e) {
    this._rqNextPage()
  },
  // 下拉刷新时请求初始数据
  onPullDownRefresh(e) {
    this._rqInitData(function () {
      wx.stopPullDownRefresh()
    })
  },
  RegionChange: function (e) {
    this.setData({
      region: e.detail.value,
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
    this.setData({
      searchQ: q
    })
    if (q) this._rqSearch(q)
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
    if (q) this._rqSearch(q)
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
  onSeekHelpTap: function (e) {
    wx.navigateTo({
      url: '/pages/seek-help/seek-help',
    })
    wx.aldstat.sendEvent('点击求喂养', {})
  },
  onCommunicateTap: function (e) {
    wx.navigateToMiniProgram({
      appId: 'wx02dc77299f086017',
      fail: (res) => {
        console.log(res)
      }
    })
    wx.aldstat.sendEvent('点击跳转小程序', {})
  },
  onPhoneTap: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
    })
    // 阿拉丁自定义事件
    wx.aldstat.sendEvent('点击电话', {
      "电话号": e.currentTarget.dataset.phone
    })
  },
  onWxTap: function (e) {
    this.setData({
      wxid: e.currentTarget.dataset.wxid,
      showWxModal: true
    })
    wx.aldstat.sendEvent('点击微信', {
      "微信号": e.currentTarget.dataset.wxid
    })
  },
  onCopyWxidTap(e) {
    var data = this.data.wxid
    wx.setClipboardData({
      data: data
    })
  },
  // 更新信息按钮
  onUpdateTap: function (e) {
    wx.navigateTo({
      url: '/pages/seek-help/seek-help?id=' + e.currentTarget.dataset.cid,
    })
    wx.aldstat.sendEvent('点击更新', {
      "更新数据id": e.currentTarget.dataset.cid.toString()
    })
  },
  // 纠错
  onFeedbackTap: function (e) {
    this.setData({
      showFeedbackModal: true,
      feedbackId: e.currentTarget.dataset.cid
    })
    wx.aldstat.sendEvent('点击纠错', {
      "纠错数据id": e.currentTarget.dataset.cid.toString()
    })
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
    if (this.data.feedbackId !== null &&
      this.data.feedErrType !== null)
      this._rqAddFeedback()
  },
  // 通过省市区请求数据
  _rqDataByPosition: function (page, callback) {
    this.setData({
      isNextPageLoading: true
    })
    var region = this.data.region,
      that = this,
      page = page || 1;

    var params = {
      url: 'rescue/position',
      data: {
        province: region[0],
        city: region[1],
        district: region[2],
        page: page
      },
      sCallback: function (res) {
        // 如果不是第一页请求，将新请求到的数据加入原来数据后面
        if (page > 1) {
          var newItems = that.data.seekHelp.items.concat(res.items)
          res.items = newItems
        }

        that.setData({
          seekHelp: res,
          isNextPageLoading: false
        })
        callback && callback()
      }
    }
    http.request(params)
  },
  // 通过用户当前位置请求数据
  _rqDataBySelfLocation(page, callback) {
    this.setData({
      isNextPageLoading: true
    })
    var that = this,
      page = page || 1;
    wx.getLocation({
      success(res) {
        var params = {
          url: 'rescue/distance',
          data: {
            latitude: res.latitude,
            longitude: res.longitude,
            page: page
          },
          sCallback(res) {
            // 如果不是第一页请求，将新请求到的数据加入原来数据后面
            if (page > 1) {
              var newItems = that.data.seekHelp.items.concat(res.items)
              res.items = newItems
            }

            that.setData({
              seekHelp: res,
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
    if (this.data.hasPosition) {
      if (this.data.seekHelp.has_next) {
        this._rqDataBySelfLocation(this.data.seekHelp.next_num)
      }
    } else {
      if (this.data.seekHelp.has_next) {
        this._rqDataByPosition(this.data.seekHelp.next_num)
      }
    }
  },
  // 请求数据
  _rqInitData(callback) {
    if (this.data.hasPosition) {
      this._rqDataBySelfLocation(1, callback)
    } else {
      this._rqDataByPosition(1, callback)
    }
  },
  // 向服务端请求搜索数据
  _rqSearch(q) {
    var that = this
    var params = {
      url: 'rescue/search',
      data: {
        q: q
      },
      sCallback: function (res) {
        that.setData({
          searchResult: res,
          noSearchResult: !res.total
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
          title: '已提交',
        })
        wx.aldstat.sendEvent('纠错成功', {
          "纠错数据id": that.data.feedbackId.toString(),
          "纠错类型": that.data.feedOptions[that.data.feedErrType].content
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
  }
})
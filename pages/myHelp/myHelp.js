// pages/myHelp/myHelp.js
import { HTTP } from '../../utils/http.js'
var http = new HTTP()
var util = require('../../utils/util.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    canHelp: {},
    page: 1,
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function(options) {
    this.setData({
      userInfo: app.globalData.userInfo
    })
    this.getData()
  },
  //获取数据
  getData(callback) {
    let that = this
    var params = {
      url: 'user/rescue',
      sCallback: function(res) {
        that.setData({
          canHelp: res.data
        })
        callback && callback()
      }
    }
    http.request(params)
  },

  /*
   * 跳转
   */
  toHelpDetail(e) {
    wx.navigateTo({
      url: '/pages/helpDetail/helpDetail?id=' + e.currentTarget.dataset.id
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {}
})

import { HTTP } from '../../utils/http.js'
var http = new HTTP()
var util = require('../../utils/util.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    mySeeks: [],
    page: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getData()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},
  /*
   *  获取数据
   */
  getData (callback) {
    let that = this
    var params = {
      url: 'user/seek-help',
      sCallback: function(res) {
        that.setData({
          mySeeks: res.data.items
        })
        callback && callback()
      }
    }
    http.request(params)
  },
  /*
   * 跳转
   */
  toSeekDetail(e) {
    wx.navigateTo({
      url: '/pages/seekDetail/seekDetail?id=' + e.currentTarget.dataset.id
    })
  }
})

import { HTTP } from '../../utils/http.js'
var http = new HTTP()
var util = require('../../utils/util.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    appId: 'wx8abaf00ee8c3202e',
    extraData: {
      id: '1221'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },
  //登录
  getUserInfo() {
    let that = this
    if (app.globalData.userInfo) {
      return false
    } else {
      wx.getUserInfo({
        withCredentials: 'false',
        lang: 'zh_CN',
        timeout: 10000,
        success: result => {
          that.setData({
            userInfo: result.userInfo
          })
          app.globalData.userInfo = result.userInfo
          that.updateUserInfo(result.userInfo)
        },
        fail: res => {
          wx.showModal({
            title: '提示',
            content: '登录可以获得更好的体验哦(*^_^*)',
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
  //我的求喂
  toMySeek() {
    let that = this
    if (app.globalData.userInfo) {
      wx.navigateTo({
        url: '/pages/mySeek/mySeek'
      })
    } else {
      wx.getUserInfo({
        withCredentials: 'false',
        lang: 'zh_CN',
        timeout: 10000,
        success: res => {
          that.setData({
            userInfo: res.userInfo
          })
          app.globalData.userInfo = res.userInfo
          wx.navigateTo({
            url: '/pages/mySeek/mySeek'
          })
          that.updateUserInfo(res.userInfo)
        },
        fail: () => {
          wx.showModal({
            title: '喂喂提示',
            content: '登录才可以查看我的求喂哦(*^_^*)',
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#3CC51F'
          })
        }
      })
    }
  },
  //我的帮助
  toMyHelp() {
    let that = this
    if (app.globalData.userInfo) {
      wx.navigateTo({
        url: '/pages/myHelp/myHelp'
      })
    } else {
      wx.getUserInfo({
        withCredentials: 'false',
        lang: 'zh_CN',
        timeout: 10000,
        success: res => {
          that.setData({
            userInfo: res.userInfo
          })
          app.globalData.userInfo = res.userInfo
          wx.navigateTo({
            url: '/pages/myHelp/myHelp'
          })
          that.updateUserInfo(res.userInfo)
        },
        fail: () => {
          wx.showModal({
            title: '喂喂提示',
            content: '登录才可以查看我的能帮哦(*^_^*)',
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#3CC51F'
          })
        }
      })
    }
  },
  //更新用户信息
  updateUserInfo(item) {
    let params = {
      url: 'user/profile',
      data: {
        wx_name: item.nickName,
        wx_avatar: item.avatarUrl,
        gender: item.gender
      },
      sCallback: function(res) {}
    }
    http.request(params)
  }
})

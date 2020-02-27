// 引用使用es6的module引入和定义
// 全局变量以g_开头
// 私有函数以_开头
import { config } from '../config.js'

class Token {
  constructor() {
    var baseUrl = config.api_base_url
    this.verifyUrl = baseUrl + 'token/secret'
    this.tokenUrl = baseUrl + 'token'
    this.registerUrl = baseUrl + 'client/register'
  }

  verify() {
    var token = wx.getStorageSync('token')
    if (!token) {
      this.getTokenFromServer()
    } else {
      this.veirfyFromServer(token)
    }
  }
  //注册
  register(callBack) {
    var that = this
    wx.login({
      success: function(res) {
        wx.request({
          url: that.registerUrl,
          method: 'POST',
          data: {
            account: res.code,
            type: 200
          },
          success: function(res) {
            wx.setStorageSync('token', res.data.token)
            that.verify()
            callBack && callBack(res.data.token)
          }
        })
      }
    })
  }
  //解析
  veirfyFromServer(token) {
    var that = this
    wx.request({
      url: that.verifyUrl,
      method: 'POST',
      data: {
        token: token
      },
      success: function(res) {
        if (res.data.error_code != 0) {
          that.getTokenFromServer()
        }
      }
    })
  }
  //获取
  getTokenFromServer(callBack) {
    var that = this
    wx.login({
      success: function(res) {
        wx.request({
          url: that.tokenUrl,
          method: 'POST',
          data: {
            account: res.code,
            type: 200
          },
          success: function(res) {
            if (res.data.error_code === 0) {
              wx.setStorageSync('token', res.data.data.token)
            } else if (res.data.error_code === 1001) {
              that.register()
            }
            callBack && callBack(res.data.token)
          },
          fail: res => {
            console.log(res)
          }
        })
      }
    })
  }
}

export { Token }

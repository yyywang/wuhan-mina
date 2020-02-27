// pages/helpDetail/helpDetail.js
// pages/seekDetail/seekDetail.js
import { HTTP } from '../../utils/http.js'
const http = new HTTP()
const util = require('../../utils/util.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    content: {},
    shareFlag: false, //遮罩
    posterFlag: false,
    posterImg: '',
    windowWidth: 0,
    totalHeight: 0,
    totalWeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          windowWidth: res.windowWidth
        })
      }
    })
    this.setData({
      id: options.id
    })
    let that = this
    this.getData(function() {
      that.createCanvas()
    })
  },

  //获取数据
  getData(callback) {
    let that = this
    var params = {
      url: 'user/rescue/' + that.data.id,
      sCallback(res) {
        that.setData({
          content: res.data
        })
        callback && callback()
      }
    }
    http.request(params)
  },

  onChooseAddressTap: function(e) {
    // 若用户未允许使用位置权限
    // 提示用户允许使用
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.showModal({
            title: '提示',
            content: '请允许使用位置信息',
            success: res => {
              if (res.confirm) {
                wx.openSetting({
                  success(res) {
                    console.log(res.authSetting)
                    // res.authSetting = {
                    //   "scope.userInfo": true,
                    //   "scope.userLocation": true
                    // }
                  }
                })
              }
            }
          })
        }
      }
    })
    //  选择位置
    wx.chooseLocation({
      success: res => {
        this.setData({
          location: {
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude,
            addressName: res.name
          }
        })
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '喂喂我-留守宠物救助平台',
      path: '/pages/rescue/rescue'
    }
  },

  showShare() {
    this.setData({
      shareFlag: true
    })
  },
  closeShare() {
    this.setData({
      shareFlag: false
    })
  },
  //取消救助
  cancelSeek(callback) {
    wx.showModal({
      title: '是否确定取消',
      content: '取消后不可恢复，请谨慎选择',
      showCancel: true,
      cancelText: '不取消',
      cancelColor: '#000000',
      confirmText: '确定取消',
      confirmColor: '#169bd5',
      success: result => {
        if (result.confirm) {
          let that = this
          var params = {
            url: 'user/rescue/' + that.data.id + '/cancel-or-not',
            type: 'put',
            sCallback(res) {
              that.getData()
              wx.showToast({
                title: '取消成功',
                icon: 'success',
                duration: 1500,
                mask: false
              })
            }
          }
          http.request(params)
        }
      }
    })
  },
  //生成海报
  createCanvas() {
    let userInfo = app.globalData.userInfo
    let that = this
    let scale = this.data.windowWidth / 375.0
    that.setData({
      totalHeight: 900 * scale,
      totalWeight: 600 * scale
    })
    // 获取Canvas
    let ctx = wx.createCanvasContext('myCanvas')
    ctx.drawImage('/images/poster2.jpg', 0, 0, 300 * scale, 450 * scale)
    ctx.draw()
    /* 头像 */
    wx.getImageInfo({
      src: userInfo.avatarUrl,
      success: res => {
        ctx.save()
        ctx.beginPath()
        ctx.arc(50 * scale, 68 * scale, 15 * scale, 0, 2 * Math.PI, false)
        ctx.clip()
        ctx.closePath()
        ctx.drawImage(res.path, 35 * scale, 53 * scale, 30 * scale, 30 * scale)
        ctx.draw(
          true,
          setTimeout(function() {
            wx.canvasToTempFilePath({
              canvasId: 'myCanvas',
              success: function(res) {
                that.tmpPath = res.tempFilePath
              }
            })
          }, 500)
        )
        ctx.restore()
      }
    })
    /* 昵称 */
    ctx.setFillStyle('#000')
    ctx.setFontSize(20)
    ctx.fillText(userInfo.nickName, 70 * scale, 78 * scale, 200 * scale)
    ctx.draw(true)
    /* 最后生成 */
    setTimeout(() => {
      wx.canvasToTempFilePath({
        width: 600,
        height: 900,
        destWidth: 600 * 4,
        destHeight: 900 * 4,
        canvasId: 'myCanvas',
        quality: 2,
        success: result => {
          that.setData({
            posterImg: result.tempFilePath
          })
        },
        fail: (res) => {
          console.log(res)
        }
      })
    }, 1000)
  },
  //保存海报
  showPoster() {
    this.setData({
      posterFlag: true,
      shareFlag: false
    })
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterImg,
      success: result => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
      }
    })
  },
  closePoster() {
    this.setData({
      posterFlag: false
    })
  }
})

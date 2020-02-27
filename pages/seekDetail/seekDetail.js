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
    isSelf: 1, //是否是通过分享进入
    shareFlag: false, //遮罩
    posterFlag: false,
    posterImg: '',
    content: {},
    showUpdate: false,
    showEndDate: '',
    showHelpDate: '',
    updateId: '',
    windowWidth: 0,
    totalHeight: 0,
    totalWeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const scene = decodeURIComponent(options.scene)
    let arr = scene.split('&')
    let that = this
    wx.getSystemInfo({
      success: res => {
        that.setData({
          windowWidth: res.windowWidth
        })
      }
    })
    wx.showLoading({
      title: 'Loading...',
      mask: true
    })

    //海报打开
    if (scene !== 'undefined') {
      setTimeout(() => {
        this.setData({
          isSelf: arr[1].slice(7),
          id: arr[0].slice(3)
        })
        this.getBoostData(function() {
          that.getCode(function() {
            wx.hideLoading()
            that.createCanvas()
          })
        })
      }, 800)
    } else {
      //分享打开
      if (options.isSelf) {
        setTimeout(() => {
          this.setData({
            isSelf: options.isSelf,
            id: options.id
          })
          this.getBoostData(function() {
            that.getCode(function() {
              wx.hideLoading()
              that.createCanvas()
            })
          })
        }, 800)
      } else {
        this.setData({
          id: options.id || arr[0].slice(3)
        })
        this.getData(function() {
          that.getCode(function() {
            wx.hideLoading()
            that.createCanvas()
          })
        })
      }
    }
  },
  //获取数据
  getData(callback) {
    let that = this
    var params = {
      url: 'user/seek-help/' + that.data.id,
      sCallback(res) {
        that.setData({
          content: res.data
        })
        callback && callback()
      }
    }
    http.request(params)
  },
  //获取分享数据
  getBoostData(callback) {
    let that = this
    var params = {
      url: 'seek-help/' + that.data.id + '/boost',
      sCallback(res) {
        that.setData({
          content: res.data
        })
        callback && callback()
      }
    }
    http.request(params)
  },
  //更新数据
  onUpdateTap() {
    wx.navigateTo({
      url: '/pages/seek-help/seek-help?id=' + this.data.id
    })
    wx.aldstat.sendEvent('点击更新', {
      更新数据id: this.data.id.toString()
    })
  },
  //关闭更新
  hideUpdateModal(e) {
    this.setData({
      showUpdate: false,
      updateId: null,
      showHelpDate: '',
      showEndDate: ''
    })
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
  //取消救助
  cancelSeek(callback) {
    let that = this
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
          var params = {
            url: 'user/seek-help/' + that.data.id + '/cancel-or-not',
            type: 'put',
            sCallback(res) {
              wx.showToast({
                title: '取消成功',
                icon: 'success',
                duration: 1500,
                mask: false
              })
              that.getData()
            }
          }
          http.request(params)
        }
      }
    })
  },
  //打开关闭分享
  showShare() {
    this.setData({
      shareFlag: true
    })
    // wx.requestSubscribeMessage({
    //   tmplIds: ['qkboRtOgBOyKVwuXZd4OCSoXw_y09RjPRiXElseuFhc'],
    //   success(res) {
    //     console.log(res)
    //   },
    //   fail: res => {
    //     console.log(res)
    //   }
    // })
  },
  closeShare() {
    this.setData({
      shareFlag: false
    })
  },
  //分享
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '喂喂我-留守宠物救助平台',
      path: '/pages/seekDetail/seekDetail?id=' + this.data.id + '&isSelf=0'
    }
  },
  //助力
  getHelps(callback) {
    let that = this
    if (that.data.content.is_self) {
      wx.showToast({
        title: '不能给自己加速哦',
        icon: 'none'
      })
    } else {
      var params = {
        url: 'seek-help/' + that.data.id + '/boost',
        type: 'post',
        sCallback(res) {
          wx.showToast({
            title: '助力成功',
            icon: 'success'
          })
          that.getBoostData()
          callback && callback()
        }
      }
      http.request(params)
    }
  },
  //获取用户信息
  getUserInfo() {
    let that = this
    if (app.globalData.userInfo) {
      that.getHelps()
    } else {
      wx.getUserInfo({
        withCredentials: 'false',
        lang: 'zh_CN',
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.updateUserInfo(res.userInfo, function() {
            that.getHelps()
          })
        },
        fail: () => {
          wx.showModal({
            title: '喂喂提示',
            content: '登录才可以助力哦(*^_^*)',
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
  //更新用户信息
  updateUserInfo(item, callback) {
    let params = {
      url: 'user/profile',
      type: 'PUT',
      data: {
        wx_name: item.nickName,
        wx_avatar: item.avatarUrl,
        gender: item.gender
      },
      sCallback: function(res) {
        callback && callback()
      }
    }
    http.request(params)
  },
  //我能帮忙
  toHelp() {
    let that = this
    if (app.globalData.userInfo) {
      wx.navigateTo({
        url: '/pages/can-help/can-help'
      })
    } else {
      wx.getUserInfo({
        withCredentials: 'false',
        lang: 'zh_CN',
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.updateUserInfo(res)
          wx.navigateTo({
            url: '/pages/can-help/can-help'
          })
        },
        fail: () => {
          wx.showModal({
            title: '喂喂提示',
            content: '登录才可以帮忙哦(*^_^*)',
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#3CC51F',
            success: res => {}
          })
        }
      })
    }
  },
  //我要求助
  toSeek() {
    let that = this
    if (app.globalData.userInfo) {
      wx.navigateTo({
        url: '/pages/seek-help/seek-help'
      })
    } else {
      wx.getUserInfo({
        withCredentials: 'false',
        lang: 'zh_CN',
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.updateUserInfo(res)
          wx.navigateTo({
            url: '/pages/seek-help/seek-help'
          })
        },
        fail: () => {
          wx.showModal({
            title: '喂喂提示',
            content: '登录才可以求助哦(*^_^*)',
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#3CC51F',
            success: res => {}
          })
        }
      })
    }
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
    ctx.drawImage('/images/poster1.jpg', 0, 0, 300 * scale, 450 * scale)
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
    /* 文字内容 */
    ctx.setFillStyle('#fff')
    ctx.setFontSize(20)
    let posterCat
    if (that.data.content.cat_num === 0) {
      posterCat = ''
    } else if (that.data.content.cat_num === 1) {
      posterCat = '猫'
    } else {
      posterCat = that.data.content.cat_num + '猫'
    }
    let posterDog
    if (that.data.content.dog_num === 0) {
      posterDog = ''
    } else if (that.data.content.dog_num === 1) {
      posterDog = '狗'
    } else {
      posterDog = that.data.content.dog_num + '狗'
    }

    ctx.fillText('我的' + posterCat + posterDog, 30 * scale, 140 * scale, 200 * scale)
    ctx.fillText(
      '急需' + that.data.content.location.city + that.data.content.location.district,
      30 * scale,
      170 * scale,
      200 * scale
    )
    ctx.fillText('的朋友帮忙喂养', 30 * scale, 200 * scale, 200 * scale)
    ctx.draw(true)
    /* 二维码 */
    wx.getImageInfo({
      src: that.data.codeImg,
      success: res => {
        ctx.drawImage(res.path, 105 * scale, 280 * scale, 100 * scale, 100 * scale)
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
      },
      fail: res => {
        console.log(res)
      }
    })

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
        fail: res => {
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
  },
  // 更新信息按钮
  onUpdateTap: function(e) {
    let that = this
    if (app.globalData.userInfo) {
      this.setData({
        showUpdate: true
      })
    } else {
      wx.getUserInfo({
        withCredentials: 'false',
        lang: 'zh_CN',
        success: result => {
          app.globalData.userInfo = result.userInfo
          this.setData({
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
      url: 'seek-help/' + that.data.id,
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
        that.getData()
        wx.aldstat.sendEvent('更新成功', {
          更新数据id: that.data.id
        })
      }
    }
    http.request(params)
  },
  //获取二维码
  getCode(callback) {
    //common/wx/unlimit-code
    let that = this
    var params = {
      url: 'common/wx/unlimit-code',
      data: {
        scene: 'id=' + this.data.id + '&isSelf=0',
        page: 'pages/seekDetail/seekDetail'
      },
      type: 'post',
      sCallback(res) {
        that.setData({
          codeImg: res.data.img_url
        })
        callback && callback()
      }
    }
    http.request(params)
  }
})

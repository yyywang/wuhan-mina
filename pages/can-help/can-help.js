// pages/seek-help/seek-help.js
import { HTTP } from '../../utils/http.js'
var util = require('../../utils/util.js')
var http = new HTTP()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isUpdate: false, // 是否是从更新信息页面跳转过来的
    help_range: null,
    cost: null,
    location: null,
    trafficCtrl: null,
    phone: null,
    wx_id: null,
    trafficRange: ['免费', '收费'],
    note: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},
  onCatInput: function(e) {
    this.setData({
      help_range: e.detail.value
    })
  },
  onDogInput: function(e) {
    this.setData({
      cost: e.detail.value
    })
  },
  onNoteInput: function(e) {
    this.setData({
      note: e.detail.value
    })
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
            address_name: res.name
          }
        })
      }
    })
  },
  // 是否收费
  onTrafficChange: function(e) {
    if (e.detail.value === '0') {
      this.setData({
        cost: 0
      })
    }
    this.setData({
      trafficCtrl: e.detail.value
    })
  },
  onPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  onWxIdInput: function(e) {
    this.setData({
      wx_id: e.detail.value
    })
  },
  onSubmitTap: function(e) {
    if (this._checkAll()) {
      // 向服务端发送数据，成功后跳转到首页
      wx.showLoading({
        mask: true
      })
      this._rqAddSeekHelp()
    }
  },
  /**
   * 校验表单是否正确
   *
   * 1. 猫狗数最少填一个，其余表单必填
   * 2. 校验手机号是否正确
   * @param {*} e
   */
  _checkAll: function(e) {
    if (!this._checkCatAndDog()) {
      wx.showModal({
        title: '喂喂提示',
        content: '请填写愿帮范围・ω・',
        showCancel: false
      })
      return false
    }

    if (!this._checkLocation()) {
      wx.showModal({
        title: '提示',
        content: '请选择：地址・ω・',
        showCancel: false
      })
      return false
    }

    if (this._checkTrafficCtrl() === 0) {
      wx.showModal({
        title: '提示',
        content: '请选择：是否收费・ω・',
        showCancel: false
      })
      return false
    } else if (this._checkTrafficCtrl() === 1) {
      wx.showModal({
        title: '提示',
        content: '请填写收费金额・ω・',
        showCancel: false
      })
      return false
    }

    if (this._checkPhone() === 0) {
      wx.showModal({
        title: '提示',
        content: '请填写手机号・ω・',
        showCancel: false
      })
      return false
    } else if (this._checkPhone() === 1) {
      wx.showModal({
        title: '提示',
        content: '手机号不正确・ω・',
        showCancel: false
      })
      return false
    }

    if (!this._checkWxid()) {
      wx.showModal({
        title: '提示',
        content: '请填写微信号・ω・',
        showCancel: false
      })
      return false
    }

    if (!this._checkNote()) {
      wx.showModal({
        title: '喂喂提示',
        content: '请填写备注・ω・',
        showCancel: false
      })
      return false
    }

    return true
  },
  _checkCatAndDog(e) {
    var data = this.data
    return !data.help_range ? false : true
  },
  _checkCost(e) {
    var data = this.data
    return !data.cost ? false : true
  },
  _checkNote(e) {
    var data = this.data
    return !data.note ? false : true
  },
  _checkLocation(e) {
    var data = this.data
    return data.location === null ? false : true
  },
  _checkTrafficCtrl(e) {
    var data = this.data
    if (data.trafficCtrl === null) {
      return 0
    } else if (data.trafficCtrl === '1') {
      if (!this._checkCost()) return 1
    }
  },
  _checkPhone(e) {
    var data = this.data

    if (data.phone === null) {
      return 0
    } else {
      if (!this._checkPhoneFormat()) return 1
    }
  },
  _checkWxid(e) {
    var data = this.data
    return data.wxid === null ? false : true
  },
  getPhoneNum(e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
  },
  // 校验手机号是否合法
  _checkPhoneFormat: function(e) {
    var phone = this.data.phone
    var returned = true

    if (!/^1[3456789]\d{9}$/.test(phone)) returned = false

    return returned
  },
  // _checkWxid: function (e) {
  //     var wxid = this.data.wxid;
  //     var returned = true;

  //     if (!(/^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/.test(wxid))) returned = false;

  //     return returned
  // },
  _formateDate: function(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    var that = this
    return [year, month, day].map(that._formatNumber).join('-')
  },
  _formatNumber: function(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  // 向服务器请求添加SeekHelp数据
  _rqAddSeekHelp: function() {
    var that = this
    // wx.getSetting({
    //   withSubscriptions: true,
    //   success: res => {
    //     console.log(res)
    //     if (res.authSetting['scope.subscribeMessage']) {
    //       console.log(res)
    //     } else {
    //       wx.requestSubscribeMessage({
    //         tmplIds: [
    //           'Rm2KNe4VCq4zaI0kBBPn0NOPTBnCG_At21NoBM33XZU',
    //           'Rm2KNe4VCq4zaI0kBBPn0H3_7AqoL-M7VUlAyK75rh8'
    //         ],
    //         success(res) {
    //           console.log(res)

    //         },
    //         fail: res => {
    //           console.log(res)

    //         }
    //       })
    //     }
    //   }
    // })

    var params = {
      url: 'rescue',
      data: {
        help_range: that.data.help_range,
        cost: that.data.cost,
        address: that.data.location.address,
        latitude: that.data.location.latitude,
        longitude: that.data.location.longitude,
        address_name: that.data.location.address_name,
        phone: that.data.phone,
        wx_id: that.data.wx_id,
        note: that.data.note
      },
      type: 'post',
      sCallback: res => {
        let helpRes = res
        wx.hideLoading()
        wx.showToast({
          title: '已提交'
        })
        wx.getSetting({
          withSubscriptions: true,
          success: res => {
            console.log(res)
            if (res.authSetting['scope.subscribeMessage']) {
              wx.redirectTo({
                url: '/pages/helpDetail/helpDetail?id=' + helpRes.data.id
              })
            } else {
              wx.requestSubscribeMessage({
                tmplIds: [
                  'Rm2KNe4VCq4zaI0kBBPn0NOPTBnCG_At21NoBM33XZU',
                  'Rm2KNe4VCq4zaI0kBBPn0H3_7AqoL-M7VUlAyK75rh8'
                ],
                success(res) {
                  console.log(res)
                  wx.redirectTo({
                    url: '/pages/helpDetail/helpDetail?id=' + helpRes.data.id
                  })
                },
                fail: res => {
                  console.log(res)
                  wx.redirectTo({
                    url: '/pages/helpDetail/helpDetail?id=' + helpRes.data.id
                  })
                }
              })
            }
          }
        })
        wx.aldstat.sendEvent('我能帮提交成功')
      },
      eCallback: function(e) {}
    }

    http.request(params)
  }
})

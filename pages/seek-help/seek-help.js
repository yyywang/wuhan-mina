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
    catNum: null,
    dogNum: null,
    endDate: null, // 时间戳
    helpDate: null,
    location: null,
    trafficCtrl: null,
    phone: null,
    wxid: null,
    trafficRange: ['小区外人可进', '本小区才可进'],
    helpStartDate: null,
    showEndDate: null // 用与前端展示选择的日期
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 从更新信息页面跳转过来的
    if (options.hasOwnProperty('id')) {
      this._rqGetSeekHelp(options.id)
      this.setData({
        id: options.id,
        isUpdate: true
      })
    }
  },
  onCatInput: function(e) {
    this.setData({
      catNum: e.detail.value
    })
  },
  onDogInput: function(e) {
    this.setData({
      dogNum: e.detail.value
    })
  },
  onEndDateChange: function(e) {
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
  onChooseAddressTap: function(e) {
    // 若是从更新页面跳转过来的，禁止选择位置
    if (this.data.isUpdate) return
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
  // 小区管控
  onTrafficChange: function(e) {
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
      wxid: e.detail.value
    })
  },
  onSubmitTap: function(e) {
    if (this.data.isUpdate) {
      if (this._checkEndDate() || this._checkHelpDate()) {
        // 向服务端发送数据，成功后跳转到首页
        wx.showLoading({
          mask: true
        })
        this._rqUpdateDate()
      }
    } else {
      if (this._checkAll()) {
        // 向服务端发送数据，成功后跳转到首页
        wx.showLoading({
          mask: true
        })
        this._rqAddSeekHelp()
      }
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
        title: '提示',
        content: '猫或狗数量最少填一个・ω・',
        showCancel: false
      })
      return false
    }

    if (!this._checkEndDate()) {
      wx.showModal({
        title: '提示',
        content: '请选择：最后喂养日・ω・',
        showCancel: false
      })
      return false
    }

    if (!this._checkHelpDate()) {
      wx.showModal({
        title: '提示',
        content: '请选择：需要帮助日期・ω・',
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

    if (!this._checkTrafficCtrl()) {
      wx.showModal({
        title: '提示',
        content: '请选择：小区管控・ω・',
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

    return true
  },
  _checkCatAndDog(e) {
    var data = this.data
    return !(data.catNum || data.dogNum) ? false : true
  },
  _checkEndDate(e) {
    var data = this.data
    return data.endDate === null ? false : true
  },
  _checkHelpDate(e) {
    var data = this.data
    return data.helpDate === null ? false : true
  },
  _checkLocation(e) {
    var data = this.data
    return data.location === null ? false : true
  },
  _checkTrafficCtrl(e) {
    var data = this.data
    return data.trafficCtrl === null ? false : true
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
    var params = {
      url: 'seek-help',
      data: {
        cat_num: that.data.catNum,
        dog_num: that.data.dogNum,
        last_date: that.data.endDate,
        help_date: that.data.helpDate,
        address: that.data.location.address,
        latitude: that.data.location.latitude,
        longitude: that.data.location.longitude,
        address_name: that.data.location.addressName,
        traffic_control: that.data.trafficCtrl,
        phone: that.data.phone,
        wx_id: that.data.wxid
      },
      type: 'post',
      sCallback: function(e) {
        wx.hideLoading()
        wx.showToast({
          title: '已提交'
        })
        wx.getSetting({
          withSubscriptions: true,
          success: res => {
            if (res.authSetting['scope.subscribeMessage']) {
              wx.switchTab({
                url: '/pages/rescue/rescue'
              })
            } else {
              wx.requestSubscribeMessage({
                tmplIds: [
                  'Rm2KNe4VCq4zaI0kBBPn0NOPTBnCG_At21NoBM33XZU',
                  'Rm2KNe4VCq4zaI0kBBPn0H3_7AqoL-M7VUlAyK75rh8'
                ],
                success(res) {
                  console.log(res)
                  wx.switchTab({
                    url: '/pages/rescue/rescue'
                  })
                },
                fail: res => {
                  console.log(res)
                  wx.switchTab({
                    url: '/pages/rescue/rescue'
                  })
                }
              })
            }
          }
        })
        wx.aldstat.sendEvent('求喂养提交成功')
      },
      eCallback: function(e) {}
    }
    http.request(params)
  },
  // 向服务端请求更新日期数据
  _rqUpdateDate(e) {
    var that = this
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
          title: '已更新',
          success: res => {
            setTimeout(function() {
              wx.switchTab({
                url: '/pages/rescue/rescue'
              })
            }, 1000)
          }
        })
        wx.aldstat.sendEvent('更新成功', {
          更新数据id: that.data.id
        })
      }
    }
    http.request(params)
  },
  _rqGetSeekHelp(id) {
    var that = this
    var params = {
      url: 'seek-help/' + id,
      type: 'put',
      sCallback(res) {
        var endDate = util.formatTimeStamp(res.last_date)
        var helpDate = util.formatTimeStamp(res.help_date)
        that.setData({
          catNum: res.cat_num,
          dogNum: res.dog_num,
          endDate: res.last_date,
          helpDate: res.help_date,
          showEndDate: endDate,
          showHelpDate: helpDate,
          location: {
            addressName: res.address_name
          },
          trafficCtrl: res.traffic_ctrl == '本小区才可进' ? 1 : 0,
          phone: res.phone,
          wxid: res.wx_id
        })
      }
    }
    http.request(params)
  }
})

// pages/webview/webview.js
import {config} from '../../config'

Page({
  data: {
    url: null
  },
  onLoad: function (options) {
    this.setData({
      url: config.articles[options.idx].url
    })
  }

})
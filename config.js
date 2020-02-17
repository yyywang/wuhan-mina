var config = {
  // api_base_url: 'http://172.20.10.2:5008/v1/',
  api_base_url: 'https://www.ywtest.cn/v1/',
  region: ['全部', '全部', '全部'],
  swiperList: [{
    id: 0,
    type: 'image',
    url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big84000.jpg'
  }, {
    id: 1,
    type: 'image',
    url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big84001.jpg',
  }, {
    id: 2,
    type: 'image',
    url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big39000.jpg'
  }, {
    id: 3,
    type: 'image',
    url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg'
  }],
  feedOptions: [{
      err_type: 0,
      content: '联系不上宠物主'
    },
    {
      err_type: 1,
      content: '宠物已不需要帮助'
    },
    {
      err_type: 2,
      content: '信息重复'
    },
    {
      err_type: 3,
      content: '其他'
    },
  ]
}

export {
  config
}
//index.js
Page({
  data: {
    visible: false,
    items: [
      { name: '1' },
      { name: '2' },
      { name: '3' },
      { name: '4' },
      { name: '5' },
      { name: '6' },
      { name: '7' },
      { name: '8' },
    ],
    current: []
  },

  onTapShowActionSheet: function () {
    this.setData({
      visible: true
    })
  },

  onChangeSelect: function (target) {
    this.setData({
      current: target.detail.current,
      items: target.detail.items
    })
  }
})

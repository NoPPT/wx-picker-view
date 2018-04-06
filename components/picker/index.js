Component({
  relations: {
    './item': {
      type: 'child', // 关联的目标节点应为子节点
      linked: function (target) {
        // 每次有custom-li被插入时执行，target是该节点实例对象，触发在该节点attached生命周期之后
        if (!this.data.custom) {
          this.setData({
            custom: true
          })
        }
      },
      linkChanged: function (target) {
        // 每次有custom-li被移动后执行，target是该节点实例对象，触发在该节点moved生命周期之后
      },
      unlinked: function (target) {
        // 每次有custom-li被移除时执行，target是该节点实例对象，触发在该节点detached生命周期之后
      }
    }
  },

  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer: '_onChangeShow'
    },
    items: {
      type: Array,
      value: [],
      observer: '_onChangeItems'
    },
    current: {
      type: null,
      value: undefined,
    },
    multiple: {
      type: Boolean,
      value: false
    },
    height: {
      type: String,
      value: '586rpx',
      observer: '_onChangeHeight'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    bgAnimation: {},
    animation: {},
    selIndex: [],
    defaultView: '',
    custom: false
  },

  created: function () {
    this.animateTime = 250;
  },

  ready: function () {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    _getAllLi: function () {
      // 使用getRelationNodes可以获得nodes数组，包含所有已关联的custom-li，且是有序的
      var nodes = this.getRelationNodes('./item');
      console.log(nodes);
    },

    _onChangeShow: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) {
          this.show();
        } else {
          this.hide();
        }
      }
    },

    _onChangeHeight: function (newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        const height = (newVal.split('rpx')[0] - 90) + 'rpx';
        this.setData({
          containerHeight: height
        })
      }
    },

    _onChangeItems: function (newVal, oldVal) {
      if (newVal != oldVal) {
        const newDatas = this._changeDataChoose(this.data.current, this.data.current);

        // this.defaultItems = this.defaultItems ? this.defaultItems : JSON.parse(JSON.stringify(newVal));
        this.defaultSelect = this.defaultSelect ? this.defaultSelect : [...this.data.current];
        this.defaultItems = this.defaultItems ? this.defaultItems : (
          newVal.map((value) => {
            return { ...value };
          })
        );

        this.setData({
          items: newDatas,
          defaultView: 'into-' + Number(this.data.current)
        })
      }
    },

    _initShowAnimate: function () {
      const that = this;

      const showAnimate = wx.createAnimation({
        duration: that.animateTime,
        timingFunction: 'ease'
      });
      showAnimate.bottom('0rpx').height(this.data.height).opacity(1).step();

      const bgShowAnimate = wx.createAnimation({
        duration: that.animateTime,
        timingFunction: 'ease'
      });
      bgShowAnimate.backgroundColor('rgba(0, 0, 0, 0.7)').step();

      return { showAnimate, bgShowAnimate };
    },

    _initHideAnimate: function () {
      const that = this;

      const hideAnimate = wx.createAnimation({
        duration: that.animateTime,
        timingFunction: 'ease'
      })
      hideAnimate.bottom(`-${this.data.height}`).opacity(0).step();

      const bgHideAnimate = wx.createAnimation({
        duration: that.animateTime,
        timingFunction: 'ease'
      })
      bgHideAnimate.backgroundColor('rgba(0, 0, 0, 0)').step();

      return { hideAnimate, bgHideAnimate };
    },

    show: function () {
      const { showAnimate, bgShowAnimate } = this._initShowAnimate();
      const defaultView = 'into-' + Number(this.data.current);
      this.setData({
        animation: showAnimate.export(),
        bgAnimation: bgShowAnimate.export(),
        defaultView: defaultView
      });
    },

    hide: function () {
      if (!this.data.show) {
        return;
      }
      const { hideAnimate, bgHideAnimate } = this._initHideAnimate();
      this.setData({
        animation: hideAnimate.export(),
        bgAnimation: bgHideAnimate.export(),
      });

      const that = this;
      setTimeout(() => {
        that.triggerEvent("hide", {}, {})
        that.setData({
          show: false
        });
      }, that.animateTime);
    },

    onTapClear: function () {
      this.changeSelectItem('cancel');
      this.hide();
    },

    onTapAll: function (res) {
      const that = this;
      let lastDatas = this.data.items;
      this.selIndex = [];
      lastDatas.forEach((value, index) => {
        value.choose = true;
        that.selIndex.push(String(index));
      });
      this.setData({
        items: lastDatas
      }, function () {
        if (that.data.custom) {
          that.changeSelectItem();
        }
      })
    },

    onTapOk: function () {
      this.changeSelectItem('confirm');
      this.hide();
    },

    changeSelectItem: function (type = 'change') {
      let items = this.data.items;
      let current = this.selIndex;
      if (type === 'cancel') {
        items = this.defaultItems;
        current = this.defaultSelect;
      } else if (type === 'confirm') {
        this.defaultItems = undefined;
        this.defaultSelect = undefined;
      }

      this.triggerEvent("change", {
        current,
        items,
        type
      }, {})
    },

    handleTapItem: function (index) {
      if (index == undefined) {
        return;
      }
      const that = this;
      const newDatas = this._changeDataChoose(this.selIndex, index);
      this.setData({
        items: newDatas
      }, function () {
        if (that.data.custom) {
          that.changeSelectItem();
        }
      })
    },

    onTapPickerItem: function (res) {
      this.handleTapItem(res.detail.key);
    },

    _changeDataChoose: function (lastIndex, currentIndex) {
      let lastDatas = this.data.items;

      if (this.data.multiple) {
        if (typeof currentIndex != 'object' && Number(currentIndex) != NaN) {
          if (lastDatas[currentIndex].choose) {
            lastDatas[currentIndex].choose = false;
            const index = this.selIndex.indexOf(currentIndex)
            this.selIndex.splice(index, 1);
          } else {
            lastDatas[currentIndex].choose = true;
            this.selIndex = [...this.selIndex, currentIndex];
          }
        } else {
          this.selIndex = lastIndex;
          lastIndex.forEach((value, index) => {
            lastDatas[value].choose = true;
          });
        }
      } else {
        if (lastIndex >= 0 && lastIndex < lastDatas.length) {
          lastDatas[lastIndex].choose = false;
        }
        if (currentIndex >= 0 && currentIndex < lastDatas.length) {
          lastDatas[currentIndex].choose = true;
        }
        this.selIndex = currentIndex;
      }
      return lastDatas;
    }
  }
})

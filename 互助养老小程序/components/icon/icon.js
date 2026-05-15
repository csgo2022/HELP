Component({
  properties: {
    name: { type: String, value: '' },
    size: { type: Number, value: 28 },
    color: { type: String, value: '' }
  },
  data: {
    src: ''
  },
  observers: {
    'name': function(name) {
      if (name) {
        this.setData({
          src: '/images/icons/' + name + '.svg'
        });
      }
    }
  },
  lifetimes: {
    attached() {
      if (this.properties.name) {
        this.setData({
          src: '/images/icons/' + this.properties.name + '.svg'
        });
      }
    }
  }
});

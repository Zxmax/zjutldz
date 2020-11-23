//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    isshow:true,
    balance: 0,
    todayEarn:0,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  signin:function(){
    console.log(app.globalData.openid)
    if(app.globalData.openid!=null)
    {
      wx.request({
        url: 'https://zjutldz.cn/api/Accounts/GetAccountById',
        data: {
          accountId: app.globalData.openid
        },
        success: ({ data }) => {
          console.log(data)
          this.setData({
            isshow:false,
            balance:data.balance
          })
        }
      })
    }
  },
  signup:function(){
    console.log(app.globalData.openid)
    if(app.globalData.openid!=null)
    {
      var account=JSON.stringify({
        "Name":this.data.userInfo.nickName,
        "AccountId":app.globalData.openid
      })
      wx.request({
        url: 'https://zjutldz.cn/api/Accounts/CreateAccount',
        header: {
          "Content-Type": "application/json;charset=UTF-8"
        },
        method: "post",
        data: account,
        success: ({ data }) => {
          if(data=="1"){
            wx.showModal({
              title: '提示',
              content: '你已注册，直接登入',
              success: (res) =>{
                if (res.confirm) {
                  console.log('用户点击确定')
                  this.setData({
                    isshow:false,
                    balance:data.balance
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }
          else{
            this.setData({
              isshow:false,
              balance:data.balance
            })
          }
        },
        fail: function (res) {
          // fail
          wx.showModal({
            title: '提示',
            content: '注册失败',
            success (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      })
    }
  },
add1:function(){
  console.log(app.globalData.openid)
  if(app.globalData.openid!=null)
  {
    wx.request({
      url: 'https://zjutldz.cn/api/TransferRecords/RechargeWithId?rechargeAccountId='+app.globalData.openid+'&amount=100',
      method: "put",
      success: ({ data }) => {
        if(data=="充值失败"){
          wx.showModal({
            title: '提示',
            content: '充值失败',
            success: (res) =>{
            }
          })
        }
        else{
          this.setData({
            balance:data,
            todayEarn:this.todayEarn+100
          })
        }
      },
      fail: function (res) {
        // fail
        wx.showModal({
          title: '提示',
          content: '充值失败',
          success (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    })
  }
},
onPullDownRefresh: function () {
    if(app.globalData.openid!=null)
    {
      wx.request({
        url: 'https://zjutldz.cn/api/Accounts/GetAccountById',
        data: {
          accountId: app.globalData.openid
        },
        success: ({ data }) => {
          this.setData({
            balance:data.balance
          })
        }
      })
      //
      wx.request({
        url: 'https://zjutldz.cn/api/TransferRecords/GetAccountProfitCurrentDay',
        data: {
          accountId: app.globalData.openid
        },
        success: ({ data }) => {
          this.setData({
            todayEarn:data
          })
        }
      })
    }
    this.onLoad(); //重新加载onLoad()
}
})

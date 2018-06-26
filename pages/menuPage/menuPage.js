
var config = require('../../config')
var login = require('controllers/loginController')
var menuPageData = require('menuPageData')

Page({
    data: {
        // 切换顶部导航栏
        currentTab: 0,
        currentMenu: '我吃过',

        // 订单相关
        sum_money: 0,
        order_view_height: 100,
        show_order: false,
        classListStyle: 'class-list',
        table_list: menuPageData.table_list,
        imgUrls: [],
        ordermenu: [],
        dishes_list: [],
        totalStar: 5,
        minusStatus: 'disabled'
    },

    // 切换顶部导航栏
    swichNav: function (e) {
        var that = this;
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current,
            })
        }
    },

    // 记录变化的顶部导航栏的当前标签
    swiperChange: function (e) {
        this.setData({
            currentTab: e.detail.current,
        })
    },

    // 记录当前访问的菜单
    swiperMenu: function (e) {
        //console.log(e.target.dataset.currentmenu)
        this.setData({
            currentMenu: e.target.dataset.currentmenu,
        })
    },

    // 更新订单
    updateOrderMenu: function () {
        var ordermenu = []
        var order_view_height = 0
        var dishes_list = this.data.dishes_list

        // 更新订单信息（将数量大于0的菜品算作订单）
        for (var i = 0; i < dishes_list.length; i++) {
            if (dishes_list[i] == undefined) continue
            if (dishes_list[i].num > 0) {
                var temp = {
                    dish_id: dishes_list[i].dish_id,
                    dish_name: dishes_list[i].dish_name,
                    price: dishes_list[i].price,
                    amount: dishes_list[i].num
                }
                ordermenu.push(temp);
            }
        }

        // 更新菜单高度
        order_view_height = this.data.ordermenu.length * 70 + 40;

        // 保存信息
        this.setData({
            ordermenu: ordermenu,
            order_view_height: order_view_height
        })
    },

    // 显示订单
    showOrderMenu: function (e) {
        var change = false
        if (!this.data.show_order) {
            change = true;
            this.updateOrderMenu()
        }
        this.setData({
            show_order: change
        })
    },

    // 订单减号
    orderMinus: function (e) {

        // 获得当前点击的行数
        var index = e.target.dataset.id;
        var sum_money = this.data.sum_money
        var dishes_list = this.data.dishes_list

        for (var i = 0; i < dishes_list.length; i++) {
            if (dishes_list[i].dish_id == index) {
                // 若数量大于0才能减
                if (dishes_list[i].num >= 1) {
                    dishes_list[i].num--;
                    sum_money = sum_money - dishes_list[i].price;

                    // 保存并更新数据
                    var minus = "dishes_list[" + i + "].num"
                    this.setData({
                        [minus]: dishes_list[i].num,
                        sum_money: sum_money
                    })
                    this.updateOrderMenu()
                }
                break;
            }
        }
    },

    // 订单加号
    orderPlus: function (e) {

        // 获得当前点击的行数
        var index = e.target.dataset.id;
        var sum_money = this.data.sum_money
        var dishes_list = this.data.dishes_list

        for (var i = 0; i < dishes_list.length; i++) {
            if (dishes_list[i].dish_id == index) {
                dishes_list[i].num++;
                sum_money = sum_money + dishes_list[i].price;

                // 保存并更新数据
                var minus = "dishes_list[" + i + "].num"
                this.setData({
                    [minus]: dishes_list[i].num,
                    sum_money: sum_money
                })
                this.updateOrderMenu()
                break;
            }
        }
    },

    // 页面滑动
    scrollPage: function (e) {
        // console.log(e.detail.scrollTop)
        var classListStyle = this.data.classListStyle;
        if (e.detail.scrollTop >= 170) {
            if (classListStyle !== 'class-list-fixed') {
                this.setData({
                    classListStyle: 'class-list-fixed'
                })
            }
            // console.log("fixed")
        }
        else if (e.detail.scrollTop < 170) {
            if (classListStyle === 'class-list-fixed') {
                this.setData({
                    classListStyle: 'class-list'
                })
            }
            // console.log("no-fixed")
        }
    },

    // 减号
    bindMinus: function (e) {
        var id = e.target.dataset.id
        var sum_money = this.data.sum_money
        var count = this.data. dishes_list[id].num
        var price = this.data.dishes_list[id].price
        var minus = "dishes_list[" + id + "].num"
        
        if (count >= 1) {
            count--
            sum_money -= price
        }

        // 只有大于一件的时候，才能normal状态，否则disable状态  
        var minusStatus = count < 1 ? 'disabled' : 'normal'
        
        // 保存并更新数据
        this.setData({
            [minus]: count,
            sum_money: sum_money,
            minusStatus: minusStatus,
        })
        this.updateOrderMenu()
    },

    // 加号
    bindPlus: function (e) {
        var id = e.target.dataset.id
        var sum_money = this.data.sum_money
        var count = this.data.dishes_list[id].num
        var price = this.data.dishes_list[id].price
        var minus = "dishes_list[" + id + "].num"

        count++
        sum_money += price
        
        // 保存并更新数据
        this.setData({
            [minus]: count,
            sum_money: sum_money,
            minusStatus: 'normal'
        })
        this.updateOrderMenu()
    },

    // 导航到下一页
    navigateTo: function () {
        var that = this
        wx.setStorage({
            key: "order",
            data: that.data.ordermenu
        });

        wx.navigateTo({
            url: "../confirmOrder/confirmOrder"
        })
    },

    // 获取菜单数据
    getDishes: function () {
        var that = this
        wx.request({
            url: config.service.dishesUrl,
            method: "GET",
            success: function (data) {
                var data_from_server = data.data
                var dishes = new Array(data_from_server.length)
                console.log(dishes)
                for (var i = 0; i < data_from_server.length; i++) {
                    var temp_dishes = {
                        dish_id: data_from_server[i].dish_id,
                        type: data_from_server[i].type,
                        image: data_from_server[i].image,
                        dish_name: data_from_server[i].dish_name,
                        ordered_count: data_from_server[i].ordered_count,
                        price: data_from_server[i].price,
                        star_count: Math.round(data_from_server[i].star_count / (data_from_server[i].star_times * 5)),
                        num: 0
                    }
                    dishes[temp_dishes.dish_id] = temp_dishes
                    console.log(temp_dishes)
                }
                console.log(dishes)
                that.setData({
                    dishes_list: dishes
                })
                that.getMyDishes()
            },
            fail: function (res) {
                console.log("Get dishes failed!")
            }
        })
    },

    // 获取我吃过的菜谱(未完成)
    getMyDishes: function() {
        var that = this
        wx.getStorage({
            key: 'userid',
            success: function(res) {
                var userid = res.data
                wx.request({
                    url: config.service.dishesUrl + '?userid=' + userid,
                    method: 'GET',
                    success: function(server_res) {
                        var myDishes = server_res.data
                        var dishes = that.data.dishes_list
                        for (var i = 0; i < myDishes.length; i++) {
                            
                        }
                        console.log('ser', server_res)
                    }
                })
            }
        })
    },

    // 获取每日推荐的图片链接(未完成)
    getRecommendedImage: function() {
        console.log('getRecommendedImage')
        var that = this
        wx.request({
            url: config.service.recommendedUrl + '3',
            method: 'GET',
            success: function(server_res) {
                var pic = server_res.data
                for(var i = 0; i < pic.length; i++) {
                    pic[i] = config.service.imageUrl + pic[i]
                }
                that.setData({
                    imgUrls: server_res.data
                })
                console.log(pic)
            }
        })
    },

    onLoad: function (options) {
        // 生命周期函数--监听页面加载
        login(options)
        this.getDishes()
        this.getRecommendedImage()
    },
    onReady: function () {
        // 生命周期函数--监听页面初次渲染完成
    },
    onShow: function () {
        // 生命周期函数--监听页面显示
    },
    onHide: function () {
        // 生命周期函数--监听页面隐藏
    },
    onUnload: function () {
        // 生命周期函数--监听页面卸载
    },
    onPullDownRefresh: function () {
        // 页面相关事件处理函数--监听用户下拉动作
    },
    onReachBottom: function () {
        // 页面上拉触底事件的处理函数
    },
    onShareAppMessage: function () {
        // 用户点击右上角分享
        return {
            title: 'title', // 分享标题
            desc: 'desc', // 分享描述
            path: 'path' // 分享路径
        }
    }
})
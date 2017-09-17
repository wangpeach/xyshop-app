// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'starter.directive', 'ion-tree-list'])

    .run(function ($ionicPlatform, $rootScope, base) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });


        if (!sessionStorage.getItem("curCity")) {
            // sessionStorage.setItem("curCity", "兴义");
            // sessionStorage.setItem("geolocation", "104.895467,25.09204");
            sessionStorage.setItem("curCity", "西安");
            sessionStorage.setItem("geolocation", "108.94787,34.269134");
        }


        /**
         * 定位用户坐标
         * @return {[type]} [description]
         */
        $rootScope.initMap = function () {
            $rootScope.mapObj = new AMap.Map('iCenter');
            $rootScope.mapObj.plugin('AMap.Geolocation', function () {
                $rootScope.geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true, //是否使用高精度定位，默认:true
                    noIpLocate: 0,
                    timeout: 10000, //超过10秒后停止定位，默认：无穷大
                    maximumAge: 0, //定位结果缓存0毫秒，默认：0
                    convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                    showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
                    showCircle: true, //定位成功后用圆圈表示定位精度范围，默认：true
                    panToLocation: true, //定位成功后将定位到的位置作为地图中心点，默认：true
                    zoomToAccuracy: true //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                });
                //返回定位信息
                AMap.event.addListener($rootScope.geolocation, 'complete', function (GeolocationResult) {
                    console.log(GeolocationResult);

                    // 根据定位返回城市信息

                    // var url = 'http://restapi.amap.com/v3/geocode/regeo';
                    // var params = {
                    //     key: base.GaodeRestapiKey,
                    //     location: GeolocationResult.position.lng + "," + GeolocationResult.position.lat
                    // }

                    // base.request(url, params).then(function(data) {
                    //     $rootScope.citys = angular.fromJson(sessionStorage.getItem("citys"));
                    //     if (!data.regeocode.addressComponent.city.includes($rootScope.defailtAddress.clientSide)) {
                    //         base.confirm($rootScope, '提示', "定位到您当前城市为<span style='color: #29D2B3;'>" + data.regeocode.addressComponent.city + "</span>, 是否切换?").then(function(res) {
                    //             $rootScope.swipeCity(data.regeocode.addressComponent.city, res);
                    //         });
                    //     }
                    // });
                    sessionStorage.setItem("geolocation", GeolocationResult.position.lng + "," + GeolocationResult.position.lat);
                });
                //返回定位出错信息
                AMap.event.addListener($rootScope.geolocation, 'error', function (GeolocationError) {
                    console.log(GeolocationError);
                    // if (!sessionStorage.getItem("geoloerror")) {
                    //     sessionStorage.setItem("geoloerror", "true")
                    // base.alert($rootScope, '提示', '无法定位您的位置');
                    // }
                });

                $rootScope.mapObj.addControl($rootScope.geolocation);
                $rootScope.geolocation.getCurrentPosition();
            });
        }
        $rootScope.initMap();
    })
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {

        $httpProvider.defaults.transformRequest = function (data) {
            if (data === undefined) {
                return data;
            }
            return $.param(data);
        }
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';


        $ionicConfigProvider.tabs.position("bottom");
        $ionicConfigProvider.tabs.style("standard");
        $ionicConfigProvider.backButton.previousTitleText(false).text('');
        $ionicConfigProvider.backButton.icon("ion-ios-arrow-back");
        $ionicConfigProvider.navBar.alignTitle('center');
        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive

            // 底部tabs对应的视图和控制器
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html',
                controller: "baseCtrl"
            })

            // tabs中home（首页）对应的视图和控制器
            .state("tab.home", {
                url: '/home',
                views: {
                    'tab-home': {
                        templateUrl: "templates/tab-home.html",
                        controller: 'HomeCtrl'
                    }
                }
            })
            // Each tab has its own nav history stack:

            // realtime中sort（分类）对应的视图和控制器
            .state('tab.realtime', {
                url: '/realtime',
                views: {
                    'tab-realtime': {
                        templateUrl: 'templates/tab-realtime.html',
                        controller: 'realtimeCtrl'
                    }
                }
            })

            // tabs中more（更多）对应的视图和控制器
            .state('tab.more', {
                url: '/more',
                views: {
                    'tab-more': {
                        templateUrl: 'templates/tab-more.html',
                        // controller: 'MoreCtrl'
                    }
                }
            })

            //tabs中account（我的）对应的视图和控制器
            .state('tab.account', {
                url: '/account?where',
                cache: true,
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            })
            /*
                下面是tabs中account(我的)下登录注册及设置、升级账户模块所需要的路由
            */

            //account（我的）中的setting(设置)页面对应的视图和控制器
            .state('tab.setting', {
                url: '/account/setting',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/setting.html',
                        controller: 'settingCtrl'
                    }
                }
            })

            //account（我的）中的setting(设置)中的personal(个人资料)页面对应的视图和控制器
            .state('tab.personal', {
                url: '/account/setting/personal',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/personal.html',
                        controller: 'personalCtrl'
                    }
                }
            })

            //account（我的）中的setting(设置)中的address(地址管理)页面对应的视图和控制器
            .state('tab.setting-address', {
                url: '/account/setting/address',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/address.html',
                        controller: 'addrCtrl'
                    }
                }
            })

            //account（我的）中的setting(设置)中的address(地址管理)添加addrconfig(收货人地址)页面对应的视图和控制器
            .state('tab.setting-addrconfig', {
                url: '/account/setting/addrconfig/:action/:addr',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/addrconfig.html',
                        controller: 'nowAddrCtrl'
                    }
                }
            })

            //account（我的）中的upgrade(账户升级)页面对应的视图和控制器
            .state('tab.account-upgrade', {
                url: '/account/upgrade',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/upgrade.html',
                        controller: 'upgradeCtrl'
                    }
                }
            })

            /*
            下面是tabs内的首页，分类，购物车所需要的路由
             */

            //home（首页）内容的列表
            .state('tab.home-products-list', {
                url: '/home/products/:backWhere/:searchType/:key',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/products.list.html',
                        controller: 'pdlCtrl'
                    }
                }
            })

            //home（首页）内容的详情
            .state('tab.home-product-details', {
                url: '/home/productDetails/:where/:id',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/product.details.html',
                        controller: 'pdatildCtrl'
                    }
                }
            })
            .state('tab.home-addrconfig', {
                url: '/home/addrconfig/:action',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/addrconfig.html',
                        controller: 'nowAddrCtrl'
                    }
                }
            })

            //realtime(分类)内容的列表
            .state('tab.realtime-products-list', {
                url: '/realtime/products/:backWhere/:searchType/:key',
                views: {
                    'tab-realtime': {
                        templateUrl: 'templates/products.list.html',
                        controller: 'pdlCtrl'
                    }
                }
            })

            //realtime(分类)内容的详情
            .state('tab.realtime-product-details', {
                url: '/realtime/productDetails/:where/:id',
                views: {
                    'tab-realtime': {
                        templateUrl: 'templates/product.details.html',
                        controller: 'pdatildCtrl'
                    }
                }
            })
            .state('tab.realtime-addrconfig', {
                url: '/realtime/addrconfig/:action',
                views: {
                    'tab-realtime': {
                        templateUrl: 'templates/addrconfig.html',
                        controller: 'nowAddrCtrl'
                    }
                }
            })
            //cart(购物车)内容的详情
            .state('tab.cart-product-details', {
                url: '/cart/productDetails/:where/:id',
                views: {
                    'tab-cart': {
                        templateUrl: 'templates/product.details.html',
                        controller: 'pdatildCtrl'
                    }
                }
            })

            //cart(购物车)和home(首页)的联系
            .state('tab.home-pd-cart', {
                url: '/home/pdcart/:where/:hastabs',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/tab-cart.html',
                        controller: 'CartCtrl'
                    }
                }
            })

            //cart(购物车)realtimet(分类)的联系
            .state('tab.realtime-pd-cart', {
                url: '/realtime/pdcart/:where/:hastabs',
                views: {
                    'tab-realtime': {
                        templateUrl: 'templates/tab-cart.html',
                        controller: 'CartCtrl'
                    }
                }
            })

            //------------访美团项目路由---------------//
            //首页商品分类
            .state('tab.home-pro-list-details', {
                // 添加搜索关键字 key
                url: '/home/proList/:title/:backWhere/:typeId/:targetChild/:searchKey/:key',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/pro.list.html',
                        controller: 'proListCtrl'
                    }
                }
            })
            //首页分类全部
            .state('tab.home-protype-all', {
                url: '/home/proAll',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/protype.all.html',
                        controller: 'HomeCtrl'
                    }
                }
            })
            //搜索商品类  功能更改:搜索直接跳转到分类搜索页面
            // .state('tab.home-protype-search', {
            //     url: '/home/proTypeSearch/:backWhere/:key',
            //     views: {
            //         'tab-home': {
            //             templateUrl: 'templates/protype.search.html',
            //             controller: 'proTypeSearchCtrl'
            //         }
            //     }
            // })
            //商铺信息详情 begin
            .state('tab.home-shop-list', {
                url: '/home/shopDetails/:backWhere/:shop',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/shop.details.html',
                        controller: 'shopDetailsCtrl'
                    }
                }
            })
            // .state('tab.realtime-shop-list', {
            //     url: '/realtime/shopDetails/:backWhere/:key',
            //     views: {
            //         'tab-realtime': {
            //             templateUrl: 'templates/shop.details.html',
            //             controller: 'shopDetailsCtrl'
            //         }
            //     }
            // })
            //商铺路线规划
            .state('tab.home-shop-transfer', {
                url: '/home/shopTransfer/:backWhere/:shop',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/map-modal.html',
                        controller: 'shopTransferCtrl'
                    }
                }
            })
            // .state('tab.realtime-shop-transfer', {
            //     url: '/realtime/shopTransfer/:backWhere/:shop',
            //     views: {
            //         'tab-realtime': {
            //             templateUrl: 'templates/realtime-map-modal.html',
            //             controller: 'shopTransferCtrl'
            //         }
            //     }
            // })
            // end
            // 商品信息详情 begin
            .state('tab.home-shop-pro-details', {
                url: '/home/shopProDetails/:backWhere/:good',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/pro.details.html',
                        controller: 'proDetailsCtrl'
                    }
                }
            })
            // .state('tab.realtime-shop-pro-details', {
            //     url: '/realtime/shopProDetails/:backWhere/:proId',
            //     views: {
            //         'tab-realtime': {
            //             templateUrl: 'templates/pro.details.html',
            //             controller: 'proDetailsCtrl'
            //         }
            //     }
            // })
            // end
            // 提交商品订单 begin
            .state('tab.home-shop-pro-order', {
                url: '/home/shopProOrder/:backWhere/:product',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/pro.order.html',
                        controller: 'OrderCtrl'
                    }
                }
            })
            .state('tab.realtime-shop-pro-order', {
                url: '/realtime/shopProOrder/:backWhere/:product',
                views: {
                    'tab-realtime': {
                        templateUrl: 'templates/pro.order.html',
                        controller: 'OrderCtrl'
                    }
                }
            })
            .state('tab.account-shop-pro-order', {
                url: '/accoun/order/shopProOrder/:backWhere/:product/:ordernumber',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/pro.order.html',
                        controller: 'OrderCtrl'
                    }
                }
            })
            // end
            // 支付商品订单 begin
            .state('tab.home-shop-pro-pay', {
                url: '/home/shopProPay/:backWhere/:product',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/pro.pay.html',
                        controller: 'PayCtrl'
                    }
                }
            })
            .state('tab.realtime-shop-pro-pay', {
                url: '/realtime/shopProPay/:backWhere/:product',
                views: {
                    'tab-realtime': {
                        templateUrl: 'templates/pro.pay.html',
                        controller: 'PayCtrl'
                    }
                }
            })
            .state('tab.account-shop-pro-pay', {
                url: '/accoun/order/shopProPay/:backWhere/:product',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/pro.pay.html',
                        controller: 'PayCtrl'
                    }
                }
            })
            // end

            /*个人中心*/
            //我的订单
            .state('tab.account-myorder', {
                url: '/account/order/:backWhere/:number',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/myorder.html',
                        controller: 'myorderCtrl'
                    }
                }
            })
            // 我的粉丝
            .state('tab.account-myfans', {
                url: '/account/myfans',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/myfans.html',
                        controller: 'myfansCtrl'
                    }
                }
            })
            //我的收益
            .state('tab.account-myincome', {
                url: '/account/myincome',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/myincome.html',
                        controller: 'myincomeCtrl'
                    }
                }
            })
            //我的提现记录
            .state('tab.account-myrecord', {
                url: '/account/myrecord',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/myrecord.html',
                        controller: 'myrecordCtrl'
                    }
                }
            })
            //免费开店
            .state('tab.account-freeopenshop', {
                url: '/account/freeopenshop',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/freeopenshop.html',
                        controller: 'foShopCtrl'
                    }
                }
            })
            //我的店铺
            .state('tab.account-myshop', {
                url: '/account/myshop',
                cache: false,
                views: {
                    'tab-account': {
                        templateUrl: 'templates/myshop.html',
                        controller: 'myshopCtrl'
                    }
                }
            })
            //店铺认证
            .state('tab.account-myshop-certification', {
                url: '/account/msCertification',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/msCertification.html',
                        controller: 'msCertificationCtrl'
                    }
                }
            })
            //商品发布
            .state('tab.account-myshop-release', {
                url: '/account/msRelease',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/msRelease.html',
                        controller: 'msReleaseCtrl'
                    }
                }
            })
            //商品管理
            .state('tab.account-myshop-manage', {
                url: '/account/msManage',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/msManage.html',
                        controller: 'msManageCtrl'
                    }
                }
            })
            //商品订单
            .state('tab.account-myshop-order', {
                url: '/account/msOrder',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/msOrder.html',
                        controller: 'msOrderCtrl'
                    }
                }
            })
            //店铺设置
            .state('tab.account-myshop-setting', {
                url: '/account/msSetting',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/msSetting.html',
                        controller: 'msSettingCtrl'
                    }
                }
            })
            .state('tab.account-about', {
                url: '/account/about',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/about.html'
                    }
                }
            });
        //我的二维码
        // .state('tab.account-qrcode', {
        //     url: '/account/qrcode',
        //     views: {
        //         'tab-account': {
        //             templateUrl: 'templates/qrcode.html',
        //             controller: 'qrCodeCtrl'
        //         }
        //     }
        // });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/home');

    });
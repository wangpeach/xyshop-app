angular.module("realtime.controller", ["ionic"])
    .controller('realtimeCtrl', ["$scope", "$rootScope", "$state", "$ionicScrollDelegate", "$ionicTabsDelegate", "$ionicSlideBoxDelegate", "$timeout", "$window", "base", "RealTime",
        function($scope, $rootScope, $state, $ionicScrollDelegate, $ionicTabsDelegate, $ionicSlideBoxDelegate, $timeout, $window, base, RealTime) {


            $scope.loadAd = function() {
                base.request("ad/mapi/loadAds", 0, { position: "monitorHomeTop" }).then(function(data) {
                    $scope.advs = data;
                    $ionicSlideBoxDelegate.update();
                });
            }
            $scope.loadAd();

            $scope.tasks = new Array();

            $scope.loadMonitoring = function(array, id, _depth) {

                var next_addr = null;
                switch (_depth) {
                    case 0:
                        next_addr = "app/L0/";
                        break;
                    case 1:
                        next_addr = "app/L1/";
                        break;
                    case 2:
                        next_addr = "app/Camera/";
                        break;
                    default:
                        return false;
                }
                // http://163.177.152.30:8000/
                base.request("http://163.177.152.30:8000/" + next_addr + id, 0, {}).then(function(resp) {
                    for (var i = 0; i < resp.length; i++) {
                        resp[i].tree = new Array();
                        resp[i].depth = _depth;
                        resp[i].collapsed = true;

                        if (_depth == 2) {
                            resp[i].trigger = function(item) {
                                console.log(item);
                            };
                        }
                        array.push(resp[i]);
                        $scope.loadMonitoring(resp[i].tree, resp[i].Id, resp[i].depth + 1);
                    }
                });
            }

            $scope.loadMonitoring($scope.tasks, "", 0, 0);



            $scope.$on("$ionicView.enter", function() {
                $scope.contentStyle = {
                    height: $window.innerHeight - (44 + 50) + "px"
                }
            });
        }
    ])
    .controller('shopDetailsCtrl', ['$scope', '$ionicTabsDelegate', '$stateParams', '$rootScope', '$state', '$window', '$ionicScrollDelegate', 'base', 'RealTime', function($scope, $ionicTabsDelegate, $stateParams, $rootScope, $state, $window, $ionicScrollDelegate, base, RealTime) {

        $scope.firstLoad = true;

        //加载商铺信息
        $scope.loadShopDetails = function() {
            console.log($stateParams.key);
            RealTime.getShopDetails($stateParams.key).then(function(data) {
                $scope.shopDetail = data;
                $scope.loadShopPros();
                //console.log(JSON.stringify(data));
            }, function(resp) {
                $rootScope.prompt("获取店铺详情失败");
            });
        };

        /**
         * 加载店铺商品列表
         * @return {[type]} [description]
         */
        $scope.canbeLoadMore = true;
        $scope.curInx = 0;
        $scope.shopPros = new Array();
        $scope.loadShopPros = function() {
            RealTime.getShopPros($scope.shopDetail.shopId, $scope.curInx++).then(function(data) {
                if (data && data.length < 20) {
                    $scope.canbeLoadMore = false;
                }
                for (var i = 0; i < data.length; i++) {
                    data[i].productimgurl = data[i].productimgurl.split('，')[0];
                    $scope.shopPros.push(data[i]);
                }
                $ionicScrollDelegate.resize();
            }, function(resp) {
                $rootScope.prompt("获取店铺商品失败");
            });
        }

        //点击店铺商品列表进入商品详情
        $scope.shopProDetails = function(arg) {
            $state.go($stateParams.backWhere + "-shop-pro-details", { backWhere: $stateParams.backWhere, proId: arg });
        }

        $scope.$on("$ionicView.enter", function() {
            if ($scope.firstLoad) {
                $scope.firstLoad = false;
                $scope.loadShopDetails();
            }
        });

        // 店铺高德地图导航
        $scope.transfer = function() {
            if ($scope.shopDetail.lng && $scope.shopDetail.lat) {
                $state.go($stateParams.backWhere + "-shop-transfer", { backWhere: $stateParams.backWhere, shop: angular.toJson($scope.shopDetail) });
            } else {
                base.prompt($scope, "无法定位商铺");
            }
        };
    }])
    .controller("shopTransferCtrl", ['$scope', '$ionicTabsDelegate', '$stateParams', '$rootScope', '$state', '$window', '$ionicHistory', 'base', 'RealTime', function($scope, $ionicTabsDelegate, $stateParams, $rootScope, $state, $window, $ionicHistory, base, RealTime) {

        $scope.shop = angular.fromJson($stateParams.shop);

        $scope.glview = {
            style: {
                width: $window.innerWidth + 'px',
                height: ($window.innerHeight * 0.7) + 'px'
            },
            transferStyle: {
                width: $window.innerWidth + 'px',
                height: ($window.innerHeight * 0.3) + 'px',
                top: ($window.innerHeight * 0.7) + 'px',
                position: "absolute"
            },
            panel: 'panel',
            glcontainer: 'mapContainer',
            curCity: sessionStorage.getItem("curCity"),
            search: null,
            type: 1
        };

        $scope.initMap = function() {
            if (!$scope.map) {
                $scope.map = new AMap.Map($scope.glview.glcontainer, {
                    resizeEnable: true,
                    center: [$scope.shop.lng, $scope.shop.lat], //地图中心点
                    zoom: 13 //地图显示的缩放级别
                });
            }
        }

        $scope.initMapTransfer = function(trans_id) {
            $scope.map.clearMap();
            if ($scope.trans)
                $scope.trans.clear();
            if (trans_id == 1) {
                //加载公交换乘插件
                AMap.service(["AMap.Transfer"], function() {
                    $scope.transOptions = {
                        map: $scope.map,
                        city: $scope.glview.curCity,
                        panel: 'panel', //公交城市
                        policy: AMap.TransferPolicy.LEAST_TIME //乘车策略
                    };
                    console.log($scope.glview.curCity);
                    //构造公交换乘类
                    $scope.trans = new AMap.Transfer($scope.transOptions);
                    //根据起、终点坐标查询公交换乘路线
                    $scope.trans.search(sessionStorage.getItem("geolocation").split(","), [$scope.shop.lng, $scope.shop.lat], function(status, result) {
                        console.log(status + "," + result);
                    });
                });
            }
            if (trans_id == 2) {
                //加载驾车插件
                AMap.service(["AMap.Driving"], function() {
                    $scope.transOptions = {
                        map: $scope.map,
                        city: $scope.glview.curCity,
                        panel: 'panel', //驾车城市
                        policy: AMap.DrivingPolicy.LEAST_TIME //驾车策略
                    };
                    console.log($scope.glview.curCity);
                    //构造驾车类
                    $scope.trans = new AMap.Driving($scope.transOptions);
                    //根据起、终点坐标查询驾车路线
                    $scope.trans.search(sessionStorage.getItem("geolocation").split(","), [$scope.shop.lng, $scope.shop.lat], function(status, result) {});
                });
            }
            if (trans_id == 3) {
                //加载步行插件
                AMap.service(["AMap.Walking"], function() {
                    $scope.transOptions = {
                        map: $scope.map,
                        city: $scope.glview.curCity,
                        panel: 'panel' //步行城市
                    };
                    console.log($scope.glview.curCity);
                    //构造步行类
                    $scope.trans = new AMap.Walking($scope.transOptions);
                    //根据起、终点坐标查询步行路线
                    $scope.trans.search(sessionStorage.getItem("geolocation").split(","), [$scope.shop.lng, $scope.shop.lat], function(status, result) {});
                });
            }
            if (trans_id == 4) {
                //加载骑行插件
                AMap.service(["AMap.Riding"], function() {
                    $scope.transOptions = {
                        map: $scope.map,
                        city: $scope.glview.curCity,
                        panel: 'panel', //骑行城市
                        policy: 0
                    };
                    console.log($scope.glview.curCity);
                    //构造骑行类
                    $scope.trans = new AMap.Riding($scope.transOptions);
                    //根据起、终点坐标查询骑行路线
                    $scope.trans.search(sessionStorage.getItem("geolocation").split(","), [$scope.shop.lng, $scope.shop.lat], function(status, result) {});
                });
            }
        };
        $scope.$on("$ionicView.afterEnter", function() {
            $scope.initMapTransfer(1);
        });
    }]);

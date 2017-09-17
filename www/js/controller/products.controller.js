angular.module('products.controller', ['ionic'])

    //产品列表控制器
    .controller("proListCtrl", ["$scope", "$ionicTabsDelegate", "$ionicHistory", "$stateParams", "$state", "$timeout", "base", "Home", "Products",
        function ($scope, $ionicTabsDelegate, $ionicHistory, $stateParams, $state, $timeout, base, Home, Products) {

            $scope.title = $stateParams.title;

            $scope.firstLoad = true;

            //获取产品分类商品列表传的对象
            $scope.searchParams = {
                // 下面是控制页面数据
                typeid: $stateParams.typeId,
                targetChild: $stateParams.targetChild ? $stateParams.targetChild : "-1",
                offset: 0,
                moreDataCanBeLoaded: true,
                allowLoad: false,
                searchKey: $stateParams.searchKey,
                // 下面是搜索参数， 部分也用于控制页面
                cates: $stateParams.targetChild,
                orderBy: 0,
                distance: null,
                key: $stateParams.key,
                position: sessionStorage.getItem("geolocation")
            };

            $scope.selected = {
                type: '',
                distance: '全城',
                orderBy: '离我最近'
            }

            //返回按键
            $scope.itemBack = function () {
                $scope.firstLoad = true;
                $scope.shops = new Array();
                $ionicHistory.goBack();
            }



            /**
             * 搜索分类下商品
             * @return {[type]} [description]
             */
            $scope.lock = false;
            $scope.shops = new Array();
            $scope.loadShops = function (allow) {
                if (allow && !$scope.lock) {
                    $scope.lock = true;
                    $scope.searchParams.offset++;
                    Products.getProByType($scope.searchParams).then(function (data) {
                        $scope.lock = false;
                        if (data && data.length < 20) {
                            $scope.searchParams.moreDataCanBeLoaded = false;
                        }
                        if (!$scope.shops) {
                            $scope.shops = new Array();
                        }
                        for (var i = 0; i < data.length; i++) {
                            // data[i].showpic = data[i].productimgurl.split("，")[0];
                            $scope.shops.push(data[i]);
                        }
                        if ($scope.shops && $scope.shops.length == 0) {
                            $scope.shops = new Array();

                        }
                        $scope.searchParams.allowLoad = true;
                        base.loaded();
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }, function (resp) {
                        base.prompt("获取分类商品失败");
                    });
                }
            }

            /**
             * 获取子分类
             */

            $scope.getTypeChild = function () {


                Home.loadProty().then(function (data) {
                    let temp = null, childIds = null;
                    
                    if ($stateParams.searchKey) {
                        $scope.typeChild = {
                            childs: [{ "name": "全部", "uuid": -1 }]
                        };
                        for (var key in data) {
                            if (data.hasOwnProperty(key)) {
                                var element = data[key];
                                // 为了搜索分类下商铺方便， 集中分类编号
                                let cates = element.catId + ",";
                                for (var key in element.childs) {
                                    var _child = element.childs[key];
                                    cates += _child.catId + ",";
                                }

                                element.cates = cates.substr(0, cates.length - 1);
                                $scope.typeChild.childs.push(element);
                            }
                        }
                        $scope.typeChild.childs[0].cates = null;
                    } else {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].catId == $stateParams.typeId) {
                                 let rootCates = data[i].catId + ",";

                                childIds = data[i].childIds;
                                $scope.typeChild = data[i];
                                $scope.typeChild.childs.splice(0, 0, { "name": "全部", "uuid": -1 });
                                for (var j = 1; j < data[i].childs.length; j++) {

                                    data[i].childs[j].cates = data[i].childs[j].catId;

                                    if ($stateParams.targetChild == data[i].childs[j].catId) {
                                        temp = data[i].childs[j].name;
                                    }
                                    rootCates += data[i].childs[j].cates + ",";
                                }
                                $scope.typeChild.childs[0].cates = rootCates.substr(0, rootCates.length - 1);
                            }
                        }

                    }
                    if (temp) {
                        $scope.selected.type = temp;
                    } else {
                        if (!$stateParams.searchKey) {
                            $scope.searchParams.cates = childIds.join(",");
                        }
                        $scope.selected.type = $scope.typeChild.childs[0].name;
                    }
                });
            }


            $scope.anewSearch = function (arg) {
                console.log(arg);
                if (arg) {
                    $scope.searchParams.cates = arg.cates;
                }
                $scope.shops = new Array();
                $scope.searchParams.offset = 0;
                $scope.searchParams.moreDataCanBeLoaded = true;
                $scope.loadShops(true);
            }

            /**
             * 类别浮动框
             * @param  {[type]}
             * @return {[type]}
             */
            base.openPopover("templates/item-PopoverProList.html", $scope).then(function (popover) {
                $scope.openPopoverProList = popover;
            });


            /**
             * 附近商品浮动框
             * @param  {[type]}
             * @return {[type]}
             */
            base.openPopover("templates/item-PopoverNearby.html", $scope).then(function (popover) {
                $scope.openPopoverNearby = popover;
            });

            $scope.contentList1 = [
                // { text: "500米", value: 500 },
                { text: "1千米", value: 1000 },
                { text: "3千米", value: 3000 },
                { text: "5千米", value: 5000 },
                { text: "10千米", value: 10000 },
                { text: "全城", value: null }
            ];
            /**
             * 商品排序类浮动框
             * @param  {[type]}
             * @return {[type]}
             */
            base.openPopover("templates/item-PopoverSort.html", $scope).then(function (popover) {
                $scope.openPopoverSort = popover;
            });

            $scope.contentList2 = [
                { text: "离我最近", value: 0 },
                { text: "人气最高", value: 1 }
            ];

            /**
             * 点击分类商品目录进入商品详情
             */
            $scope.typeProDetails = function (arg) {
                $state.go("tab.home-shop-list", { backWhere: 'tab.home', shop: angular.toJson(arg) });
            }

            $scope.$on("$ionicView.enter", function () {
                if ($scope.firstLoad) {
                    $scope.firstLoad = false;
                    $scope.getTypeChild();
                    $scope.loadShops(true);
                }
            });
        }
    ])
    //产品详情控制器
    .controller("proDetailsCtrl", ["$scope", "$state", "$ionicTabsDelegate", "$ionicHistory", "$stateParams", "$ionicSlideBoxDelegate", "$sce", "$timeout", "base", "Products", "Account",
        function ($scope, $state, $ionicTabsDelegate, $ionicHistory, $stateParams, $ionicSlideBoxDelegate, $sce, $timeout, base, Products, Account) {
            //下载商品详情
            $scope.loadProDetails = function () {
                $scope.proDetails = angular.fromJson($stateParams.good);
                $scope.proDetails.gallery = $scope.proDetails.moreImgShow.split('#');
                $ionicSlideBoxDelegate.update();

                // 获取商铺信息
                $scope.shop = null;
                base.request("shop/mapi/only", 1, { uuid: $scope.proDetails.shopUuid }).then(function (resp) {
                    $scope.shop = resp;
                });



                //获取商品图文详情
                base.get($scope.proDetails.desFile, 0, {}).then(function (resp) {
                    $scope.proDetail = $sce.trustAsHtml(resp);
                });


            }

            $scope.loadProDetails();

            //点击抢购了进入提交订单
            $scope.goSubmitOrder = function () {
                if (Account.signined) {
                    $state.go($stateParams.backWhere + "-shop-pro-order", { backWhere: $stateParams.backWhere, product: angular.toJson($scope.proDetails[0]) });
                } else {
                    base.prompt($scope, "请先登录");
                }
            }
            //点击商品详情中的商家信息进入店铺详情
            $scope.proShopDetails = function () {
                if ($scope.shop) {
                    $state.go("tab.home-shop-list", { backWhere: $stateParams.backWhere, shop: angular.toJson($scope.shop) });
                } else {
                    base.prompt($scope, "商铺信息获取失败");
                }
            }

            $scope.$on("$ionicView.enter", function () {
                // 用户足迹
                $timeout(function () {
                    if (Account.signined) {
                        base.request("userfoot/mapi/addfoot", 1, { good: $scope.proDetails.uuid, user: Account.getUser().uuid });
                    }
                }, 1500);
            })
        }
    ]);

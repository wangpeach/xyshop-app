angular.module('products.controller', ['ionic'])
	.controller('shopDetailsCtrl', ['$scope', '$ionicTabsDelegate', '$stateParams', '$rootScope', '$state', '$window', '$ionicActionSheet', '$ionicScrollDelegate', 'base', 'Account', function($scope, $ionicTabsDelegate, $stateParams, $rootScope, $state, $window, $ionicActionSheet, $ionicScrollDelegate, base, Account) {

		$scope.firstLoad = true;
		$scope.shop = angular.fromJson($stateParams.shop);

		/**
		 * 加载店铺商品列表
		 * @return {[type]} [description]
		 */
		$scope.canbeLoadMore = true;
		$scope.loadgoods = function() {
			let params = {
				uuid: $scope.shop.uuid,
				offset: 1,
				limit: 10,
			};
			base.request("goods/mapi/shoplist", 1, params).then(function(result) {
				if (result.length < params.limit) {
					$scope.canbeLoadMore = false;
				}
				$scope.goods = result;
			});
		};


		/**
		 * 收藏店铺
		 */
		if (Account.signined) {
			Account.takeCollects(false, 'shop').then(function(result) {
				$scope._method = "save";
				if (result && result.length > 0) {
					for (let i = 0; i < result.length; i++) {
						if (result[i].value === $scope.shop.uuid) {
							$scope._method = "del";
						}
					}
				}
				if ($scope._method === "save") {
					$scope.star = " icon-favor-outline";
				} else {
					$scope.star = " icon-favor";
				}
			});
		}


		$scope.collection = function() {
			let params = undefined;
			if ($scope._method === "save") {
				params = {
					userUuid: Account.getUser().uuid,
					name: $scope.shop.name,
					value: $scope.shop.uuid,
					thumbImg: $scope.shop.thumbImg,
					collectType: 'shop',
					method: $scope._method
				};
			} else {
				params = {
					userUuid: Account.getUser().uuid,
					value: $scope.shop.uuid,
					method: $scope._method
				};
			}

			base.request('collect/mapi/sd', 1, params).then(function(result) {
				if (result === "error") {
					base.prompt($scope, "收藏失败");
				} else {
					if ($scope._method === "save") {
						$scope.star = " icon-favor";
						$scope._method = "del";
					} else {
						$scope._method = "save";
						$scope.star = " icon-favor-outline";
					}
					$scope.$emit("convery-sc-collect");
				}
			});
		}

		//点击店铺商品列表进入商品详情
		$scope.shopProDetails = function(arg) {
			$state.go($stateParams.backWhere + "-shop-pro-details", {
				backWhere: $stateParams.backWhere,
				good: angular.toJson(arg)
			});
		};

		// 店铺高德地图导航
		$scope.transfer = function() {
			// if ($scope.shop.longitude && $scope.shop.latitude) {
			//   $state.go($stateParams.backWhere + "-shop-transfer", {
			//     backWhere: $stateParams.backWhere,
			//     shop: angular.toJson($scope.shop)
			//   });
			// } else {
			//   base.prompt($scope, "无法定位商铺");
			// }

			var hideSheet = $ionicActionSheet.show({
				buttons: [{
					text: '百度地图'
				}, {
					text: '高度地图'
				}],
				titleText: $scope.shop.name,
				cancelText: '取消',
				buttonClicked: function(index) {
					let platform = base.getSystem(),
						toNavMap = undefined,
						appName = sessionStorage.getItem("appName");;
					if (index == 0) {
						toNavMap = "baidumap://map/direction?destination=latlng:" + $scope.shop.latitude + "," + $scope.shop.longitude + "|name:" + $scope.shop.name + "&mode=driving";

						cordovaNaviMap.bdmapRoute(toNavMap, res => {}, err => {
							//失败
							base.prompt($scope, err);
						});
					} else {
						if (platform === "IOS") {
							toNavMap = "iosamap://path";
						} else {
							toNavMap = "amapuri://route/plan/";
						}

						toNavMap = toNavMap + "?sourceApplication=" + appName + "&dlat=" + $scope.shop.latitude + "&dlon=" + $scope.shop.longitude + "&dname=" + $scope.shop.name + "&dev=0&t=0";

						window.cordovaNaviMap.amapRoute(toNavMap, res => {}, err => {
							//失败
							base.prompt($scope, err);
						});
					}
					return true;
				}
			});
		};

		$scope.$on("$ionicView.enter", function() {
			$scope.loadgoods();
		});
	}])
	.controller("shopTransferCtrl", ['$scope', '$ionicTabsDelegate', '$stateParams', '$rootScope', '$state', '$window', '$ionicHistory', 'base', 'RealTime', function($scope, $ionicTabsDelegate, $stateParams, $rootScope, $state, $window, $ionicHistory, base, RealTime) {

		// $scope.shop = angular.fromJson($stateParams.shop);

		// $scope.glview = {
		// 	style: {
		// 		width: $window.innerWidth + 'px',
		// 		height: ($window.innerHeight * 0.7) + 'px'
		// 	},
		// 	transferStyle: {
		// 		width: $window.innerWidth + 'px',
		// 		height: ($window.innerHeight * 0.3) + 'px',
		// 		top: ($window.innerHeight * 0.7) + 'px',
		// 		position: "absolute"
		// 	},
		// 	panel: 'panel',
		// 	glcontainer: 'mapContainer',
		// 	curCity: sessionStorage.getItem("curCity"),
		// 	search: null,
		// 	type: 1
		// };

		// $scope.initMap = function() {
		// 	if (!$scope.map) {
		// 		$scope.map = new AMap.Map($scope.glview.glcontainer, {
		// 			resizeEnable: true,
		// 			center: [$scope.shop.longitude, $scope.shop.latitude], //地图中心点
		// 			zoom: 13 //地图显示的缩放级别
		// 		});
		// 	}
		// }

		// $scope.initMapTransfer = function(trans_id) {
		// 	$scope.map.clearMap();
		// 	if ($scope.trans)
		// 		$scope.trans.clear();
		// 	if (trans_id == 1) {
		// 		//加载公交换乘插件
		// 		AMap.service(["AMap.Transfer"], function() {
		// 			$scope.transOptions = {
		// 				map: $scope.map,
		// 				city: $scope.glview.curCity,
		// 				panel: 'panel', //公交城市
		// 				policy: AMap.TransferPolicy.LEAST_TIME //乘车策略
		// 			};
		// 			console.log($scope.glview.curCity);
		// 			//构造公交换乘类
		// 			$scope.trans = new AMap.Transfer($scope.transOptions);
		// 			//根据起、终点坐标查询公交换乘路线
		// 			$scope.trans.search(sessionStorage.getItem("geolocation").split(","), [$scope.shop.longitude, $scope.shop.latitude], function(status, result) {
		// 				console.log(status + "," + result);
		// 			});
		// 		});
		// 	}
		// 	if (trans_id == 2) {
		// 		//加载驾车插件
		// 		AMap.service(["AMap.Driving"], function() {
		// 			$scope.transOptions = {
		// 				map: $scope.map,
		// 				city: $scope.glview.curCity,
		// 				panel: 'panel', //驾车城市
		// 				policy: AMap.DrivingPolicy.LEAST_TIME //驾车策略
		// 			};
		// 			console.log($scope.glview.curCity);
		// 			//构造驾车类
		// 			$scope.trans = new AMap.Driving($scope.transOptions);
		// 			//根据起、终点坐标查询驾车路线
		// 			$scope.trans.search(sessionStorage.getItem("geolocation").split(","), [$scope.shop.longitude, $scope.shop.latitude], function(status, result) {});
		// 		});
		// 	}
		// 	if (trans_id == 3) {
		// 		//加载步行插件
		// 		AMap.service(["AMap.Walking"], function() {
		// 			$scope.transOptions = {
		// 				map: $scope.map,
		// 				city: $scope.glview.curCity,
		// 				panel: 'panel' //步行城市
		// 			};
		// 			console.log($scope.glview.curCity);
		// 			//构造步行类
		// 			$scope.trans = new AMap.Walking($scope.transOptions);
		// 			//根据起、终点坐标查询步行路线
		// 			$scope.trans.search(sessionStorage.getItem("geolocation").split(","), [$scope.shop.longitude, $scope.shop.latitude], function(status, result) {});
		// 		});
		// 	}
		// 	if (trans_id == 4) {
		// 		//加载骑行插件
		// 		AMap.service(["AMap.Riding"], function() {
		// 			$scope.transOptions = {
		// 				map: $scope.map,
		// 				city: $scope.glview.curCity,
		// 				panel: 'panel', //骑行城市
		// 				policy: 0
		// 			};
		// 			console.log($scope.glview.curCity);
		// 			//构造骑行类
		// 			$scope.trans = new AMap.Riding($scope.transOptions);
		// 			//根据起、终点坐标查询骑行路线
		// 			$scope.trans.search(sessionStorage.getItem("geolocation").split(","), [$scope.shop.longitude, $scope.shop.latitude], function(status, result) {});
		// 		});
		// 	}
		// };
		$scope.$on("$ionicView.afterEnter", function() {
			$scope.initMapTransfer(1);
		});
	}])

	//商家列表控制器
	.controller("proListCtrl", ["$scope", "$ionicTabsDelegate", "$ionicHistory", "$stateParams", "$state", "$timeout", "$window", "$ionicSlideBoxDelegate", "base", "Home", "Products", "Account",
		function($scope, $ionicTabsDelegate, $ionicHistory, $stateParams, $state, $timeout, $window, $ionicSlideBoxDelegate, base, Home, Products, Account) {

			$scope.title = $stateParams.title;

			$scope.firstLoad = true;
			let searchUser = undefined;
			if (Account.getUser()) {
				searchUser = Account.getUser().uuid;
			} else {
				searchUser = "unknown";
			}

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
				position: sessionStorage.getItem("geolocation"),
				user: searchUser
			};


			/**
			 * 加载广告
			 * @return {[type]} [description]
			 */
			$scope.adshow = true;
			$scope.loadAd = function() {
				base.request("ad/mapi/loadAds", 0, {
					position: "cateTop"
				}).then(function(data) {
					if (data && data.length > 0) {
						$scope.ptsAdvs = data;
						var slider_width = $window.innerWidth;
						var slider_height = slider_width / 5 * 1.3;
						$scope.slider_img_style = {
							"width": "100%",
							"height": slider_height + "px"
						};
						$ionicSlideBoxDelegate.$getByHandle("protypesAdvs").loop(true);
						$ionicSlideBoxDelegate.$getByHandle("protypesAdvs").update();
						$scope.$broadcast('scroll.refreshComplete');
					} else {
						$scope.adshow = false;
					}
				});
			};


			$scope.selected = {
				type: '',
				distance: '全城',
				orderBy: '离我最近'
			};

			//返回按键
			$scope.itemBack = function() {
				$scope.firstLoad = true;
				$scope.goods = new Array();
				$ionicHistory.goBack();
			};


			/**
			 * 搜索分类下商品
			 * @return {[type]} [description]
			 */
			$scope.lock = false;
			$scope.goods = new Array();
			$scope.loadGoods = function(allow) {
				if (allow && !$scope.lock) {
					$scope.lock = true;
					$scope.searchParams.offset++;
					Products.getProByType($scope.searchParams).then(function(data) {
						$scope.lock = false;
						if (data && data.length < 20) {
							$scope.searchParams.moreDataCanBeLoaded = false;
						}
						if (!$scope.goods) {
							$scope.goods = new Array();
						}
						for (let i = 0; i < data.length; i++) {
							$scope.goods.push(data[i]);
						}
						if ($scope.goods && $scope.goods.length === 0) {
							$scope.goods = new Array();

						}
						$scope.searchParams.allowLoad = true;
						base.loaded();
						$scope.$broadcast('scroll.infiniteScrollComplete');
					}, function(resp) {
						base.prompt("获取商品失败");
					});
				}
			};


			$scope.goodDetails = function(arg) {
				console.log(arg);
				$state.go("tab.home-shop-pro-details", {
					backWhere: 'tab.home',
					good: angular.toJson(arg)
				});
			};


			/**
			 * 获取子分类
			 */

			$scope.getTypeChild = function() {
				Home.loadProty().then(function(data) {
					let temp = null,
						childIds = null;

					if ($stateParams.searchKey) {
						$scope.typeChild = {
							childs: [{
								"name": "全部",
								"uuid": -1
							}]
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
							if (data[i].catId === $stateParams.typeId) {
								let rootCates = data[i].catId + ",";

								childIds = data[i].childIds;
								$scope.typeChild = data[i];
								$scope.typeChild.childs.splice(0, 0, {
									"name": "全部",
									"uuid": -1
								});
								for (var j = 1; j < data[i].childs.length; j++) {

									data[i].childs[j].cates = data[i].childs[j].catId;

									if ($stateParams.targetChild === data[i].childs[j].catId) {
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
			};


			$scope.anewSearch = function(arg) {
				console.log(arg);
				if (arg) {
					$scope.searchParams.cates = arg.cates;
				}
				$scope.goods = new Array();
				$scope.searchParams.offset = 0;
				$scope.searchParams.moreDataCanBeLoaded = true;
				$scope.loadGoods(true);
			};

			/**
			 * 类别浮动框
			 * @param  {[type]}
			 * @return {[type]}
			 */
			base.openPopover("templates/item-PopoverProList.html", $scope).then(function(popover) {
				$scope.openPopoverProList = popover;
			});


			/**
			 * 附近商品浮动框
			 * @param  {[type]}
			 * @return {[type]}
			 */
			base.openPopover("templates/item-PopoverNearby.html", $scope).then(function(popover) {
				$scope.openPopoverNearby = popover;
			});

			$scope.contentList1 = [
				{
					text: "1千米",
					value: 1000
				}, {
					text: "3千米",
					value: 3000
				}, {
					text: "5千米",
					value: 5000
				}, {
					text: "10千米",
					value: 10000
				}, {
					text: "全城",
					value: null
				}
			];
			/**
			 * 商品排序类浮动框
			 * @param  {[type]}
			 * @return {[type]}
			 */
			base.openPopover("templates/item-PopoverSort.html", $scope).then(function(popover) {
				$scope.openPopoverSort = popover;
			});

			$scope.contentList2 = [{
				text: "离我最近",
				value: 0
			}, {
				text: "人气最高",
				value: 1
			}];

			/**
			 * 进入商家页
			 */
			// $scope.typeProDetails = function(arg) {
			// 	$state.go("tab.home-shop-list", {
			// 		backWhere: 'tab.home',
			// 		shop: angular.toJson(arg)
			// 	});
			// };

			$scope.$on("$ionicView.enter", function() {
				if ($scope.firstLoad) {
					$scope.firstLoad = false;
					$scope.getTypeChild();
					$scope.loadGoods(true);
					$scope.loadAd();
				}
			});
		}
	])
	//产品详情控制器
	.controller("proDetailsCtrl", ["$scope", "$state", "$ionicTabsDelegate", "$ionicHistory", "$stateParams", "$ionicSlideBoxDelegate", "$sce", "$timeout", "base", "Products", "Account",
		function($scope, $state, $ionicTabsDelegate, $ionicHistory, $stateParams, $ionicSlideBoxDelegate, $sce, $timeout, base, Products, Account) {
			//下载商品详情
			$scope.loadProDetails = function() {
				$scope.proDetails = angular.fromJson($stateParams.good);
				$scope.proDetails.gallery = $scope.proDetails.moreImgShow.split('#');
				$ionicSlideBoxDelegate.update();

				// 获取商铺信息
				$scope.shop = null;
				let params = {
					uuid: $scope.proDetails.shopUuid
				};
				base.request("shop/mapi/only", 1, params).then(function(resp) {
					$scope.shop = resp;
					if (Account.signined) {
						Account.takeCollects(false, 'good').then(function(result) {
							$scope._method = "save";
							if (result && result.length > 0) {
								for (let i = 0; i < result.length; i++) {
									if (result[i].value === $scope.proDetails.uuid) {
										$scope._method = "del";
									}
								}
							}
							if ($scope._method === "save") {
								$scope.star = " icon-favor-outline";
							} else {
								$scope.star = " icon-favor";
							}
						})
					}
				});

				//获取商品图文详情
				base.get($scope.proDetails.desFile, 0, {}).then(function(resp) {
					$scope.proDetail = $sce.trustAsHtml(resp);
				});
			};

			$scope.loadProDetails();


			/**
			 * 收藏商品
			 */


			$scope.collection = function() {
				let params = undefined;
				if ($scope._method === "save") {
					params = {
						userUuid: Account.getUser().uuid,
						name: $scope.proDetails.name,
						value: $scope.proDetails.uuid,
						thumbImg: $scope.proDetails.thumbImg,
						collectType: 'good',
						method: $scope._method
					};
				} else {
					params = {
						userUuid: Account.getUser().uuid,
						value: $scope.proDetails.uuid,
						method: $scope._method
					};
				}

				base.request('collect/mapi/sd', 1, params).then(function(result) {
					if (result === "error") {
						base.prompt($scope, "收藏失败");
					} else {
						if ($scope._method === "save") {
							$scope.star = " icon-favor";
							$scope._method = "del";
						} else {
							$scope._method = "save";
							$scope.star = " icon-favor-outline";
						}

						$scope.$emit("convery-gc-collect");
					}
				});
			}


			//点击抢购了进入提交订单
			$scope.submitOrder = function() {
				if (Account.signined) {
					$state.go($stateParams.backWhere + "-shop-pro-order", {
						backWhere: $stateParams.backWhere,
						product: angular.toJson($scope.proDetails)
					});
				} else {
					base.prompt($scope, "请先登录");
				}
			};

			//点击商品详情中的商家信息进入店铺详情
			$scope.proShopDetails = function() {
				if ($scope.shop) {
					$state.go($stateParams.backWhere+"-shop-list", {
						backWhere: $stateParams.backWhere,
						shop: angular.toJson($scope.shop)
					});
				} else {
					base.prompt($scope, "商铺信息获取失败");
				}
			};

			$scope.$on("$ionicView.enter", function() {
				// 用户足迹
				$timeout(function() {
					if (Account.signined) {
						base.request("userfoot/mapi/addfoot", 1, {
							good: $scope.proDetails.uuid,
							user: Account.getUser().uuid
						}, false);
					}
				}, 1500);
			})
		}
	]);
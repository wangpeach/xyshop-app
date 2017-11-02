angular.module("home.controller", ["ionic"])
	.controller('HomeCtrl', ["$scope", "$state", "$stateParams", "$ionicSlideBoxDelegate", "$ionicScrollDelegate", "$timeout", "$window", "$ionicLoading", "$ionicPopover", "$ionicTabsDelegate", "$cordovaGeolocation", "$ionicHistory", "$q", "$ionicPosition", "base", "Home",
		function ($scope, $state, $stateParams, $ionicSlideBoxDelegate, $ionicScrollDelegate, $timeout, $window, $ionicLoading, $ionicPopover, $ionicTabsDelegate, $cordovaGeolocation, $ionicHistory, $q, $ionicPosition, base, Home) {

			$scope.advs = new Array();

			/**
			 * 获取猜你喜欢列表
			 * @type {Object}
			 */
			$scope.options = {
				loop: false,
				maybeInx: 0,
				moreDataCanBeLoaded: true
			};
			$scope.protys = new Array();
			$scope.likes = new Array();


			$scope.loadHotGoods = function () {
				if ($scope.options.maybeInx >= 5) {
					$scope.options.moreDataCanBeLoaded = false;
				} else {
					Home.hotGoods($scope.options.maybeInx++).then(function (data) {
						if (data.length < 20) {
							$scope.options.moreDataCanBeLoaded = false;
						}
						for (var i = 0; i < data.length; i++) {
							$scope.likes.push(data[i]);
						}
						$scope.$broadcast('scroll.infiniteScrollComplete');
					});
				}
			};


			/**
			 * 加载首页分类
			 * @return {[type]} [description]
			 */
			$scope.loadProty = function () {
				Home.loadProty().then(function (data) {
					data.push({
						name: '全部分类',
						iconImgPath: 'img/more.png',
						action: 'all'
					});
					var ptObj = new Array();
					var split = Math.ceil((data.length) / 8);
					for (var i = 0; i < split; i++) {
						var pt_page = data.slice(i * 8, (i + 1) * 8);

						var pt_row = Math.ceil(pt_page.length / 4);
						var ptObjItem = new Array();
						for (var j = 0; j < pt_row; j++) {
							ptObjItem.push(pt_page.slice(j * 4, (j + 1) * 4));
						}

						for (var z = 0; z < ptObjItem.length; z++) {
							if (ptObjItem[z].length < 4) {
								for (var k = ptObjItem[z].length; k < 4; k++) {
									ptObjItem[z].push({
										name: ' ',
										iconImgPath: 'img/tc.png',
										action: 'none'
									});
								}
							}
						}
						ptObj.push(ptObjItem);
					}
					data.pop();
					$scope.protyItems = data;
					$scope.protys = ptObj;
				});
			};

			/**
			 * 加载广告
			 * @return {[type]} [description]
			 */
			$scope.loadAd = function () {
				base.request("ad/mapi/loadAds", 0, {position: "shopHomeTop"}).then(function (data) {
					$scope.homeAdvs = data;
					var slider_width = document.querySelectorAll(".home .ad-slider")[0].clientWidth;
					var slider_height = slider_width / 5 * 2.5;
					$scope.slider_img_style = {"width": "100%", "height": slider_height + "px"};
					$ionicSlideBoxDelegate.$getByHandle("homeAdvs").loop(true);
					$ionicSlideBoxDelegate.$getByHandle("homeAdvs").update();
				});
			};


			/**********************end***********************/

			/**
			 * home-search-modal.html搜索框模块
			 * @param  {[type]}
			 * @return {[type]}
			 */
			$scope.GoingAway = 1;
			$scope.openSearchPanel = function () {
				$scope.GoingAway = 1;
				base.openModal($scope, "templates/home-search-modal.html", "slideInDown").then(function (modal) {
					$scope.searchModal = modal;

					if (localStorage.getItem('historysearch')) {
						$scope.searchItems = angular.fromJson(localStorage.getItem('historysearch')).reverse();
					}
					$scope.searchModal.show();

					$scope.clearhispanel = function () {
						localStorage.removeItem("historysearch");
						$scope.searchItems = null;
						base.prompt($scope, "清除完成");
					}

				});
			};

			//搜索模块内的搜索框
			$scope.searchShopSender = {
				key: null,
				placeholder: '搜索商品类'
			};

			$scope.searchShop = function (arg) {
				var historys = null;
				if (arg) {
					if (localStorage.getItem('historysearch')) {
						historys = angular.fromJson(localStorage.getItem('historysearch'));
					} else {
						historys = new Array();
					}
					if (historys.includes(arg)) {
						historys.splice(historys.indexOf(arg), 1);
						historys.push(arg);
					} else {
						historys.push(arg);
					}
					localStorage.setItem("historysearch", angular.toJson(historys));

					if (historys.length === 10) {
						historys.shift();
					}
				}


				$scope.GoingAway = 0;
				$scope.clearShopKey();
				$scope.searchModal.hide();

				console.log($scope.GoingAway);
				$state.go('tab.home-pro-list-details', {backWhere: 'tab.home', searchKey: true, key: arg});
			};


			$scope.searchSwipe = function(arg) {
				$scope.cancel = arg;
				return true;
			};

			$scope.clearShopKey = function (arg) {
				$scope.searchShopSender.key = null;
				$timeout(function () {
					$scope.cancel = !arg;
				}, 5);
			};
			/**********************end***********************/


			/**
			 * 判断首页分类是不是全部分类
			 * @param arg
			 */
			$scope.searchpro = function (arg) {
				if (arg.action === "all") {
					$state.go('tab.home-protype-all');
				} else if (arg.action === undefined) {
					$state.go('tab.home-pro-list-details', {
						title: arg.name,
						backWhere: 'tab.home',
						typeId: arg.catId,
						key: null
					});
				}
			};


			/**
			 * 点击全部分类目录进入商品分类列表
			 */
			$scope.proListByTybe = function (_title, _typeId, _targetChild) {
				$state.go("tab.home-pro-list-details", {
					title: _title,
					backWhere: 'tab.home',
					typeId: _typeId,
					targetChild: _targetChild
				});
			};


			/**
			 * 点击最热商品进入商品详情
			 */
			$scope.hotGoodDetails = function (arg) {
				console.log(arg);
				$state.go("tab.home-shop-pro-details", {backWhere: 'tab.home', good: angular.toJson(arg)});
			};

			$scope.clearCityKey = function () {
				$scope.searchCitySender.key = null;
			};


			$scope.$on("$ionicView.enter", function () {
				var adh = $window.innerWidth * 0.35 + 'px';
				$scope.ad_height = {
					height: adh
				};
				// $scope.loadMaybeLike();
			});


			$scope.loadAd();
			$scope.loadProty();
			$scope.loadHotGoods();

			$scope.$on("$ionicView.beforeEnter", function () {
			});
		}
	])
	.controller('proTypeSearchCtrl', ["$scope", "$state", "$timeout", "$stateParams", "$ionicHistory", "$q", "base", "Home",
		function ($scope, $state, $timeout, $stateParams, $ionicHistory, $q, base, Home) {
			//返回按键
			$scope.backWhere = function () {
				$state.go($stateParams.backWhere);
			};
			$scope.key = $stateParams.key;
			//搜索模块内的搜索框
			$scope.searchShopSender = {
				key: null,
				placeholder: '搜索商品类'
			};

			$scope.searchShop = function (arg) {
				$state.go('tab.home-protype-search', {backWhere: 'tab.home', key: arg});
				$scope.clearShopKey();
			};

			$scope.clearShopKey = function (arg) {
				$scope.searchShopSender.key = null;
				$timeout(function () {
					$scope.cancel = !arg;
				}, 5);
			};
			//获取搜索商品类店铺列表
			$scope.searchShopOrGoods = function () {
				Home.searchShopOrGoods($stateParams.key).then(function (data) {
					console.log(JSON.stringify(data));
					$scope.typeSearchList = data;
				}, function (resp) {
					base.prompt("获取店铺列表失败");
				});
			};

			$scope.searchShopOrGoods();

			//点击搜索店铺目录进入店铺详情
			$scope.typeSearchShopDetails = function (arg) {
				$state.go("tab.home-shop-list", {backWhere: 'tab.home', key: arg});
			};
			//点击搜索店铺商品目录进入商品详情
			$scope.typeSearchShopProDetails = function (arg) {
				$state.go("tab.home-shop-pro-details", {backWhere: 'tab.home', proId: arg});
			};
		}
	]);

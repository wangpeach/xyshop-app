;
angular.module('home.service', [])
	.factory("Home", ["$q", "$http", "base", function($q, $http, base) {

		return {
			getCarousel: function() {
				return $http.jsonp("", {
					params: {

					}
				});
			},

			/**
			 * 火爆商品
			 * @param  {[type]} inx [description]
			 * @return {[type]}     [description]
			 */
			hotGoods: function(inx) {
				var defer = $q.defer();
				base.request('goods/mapi/list', 1, { shop: null, key: null, offset: inx})
				.then(function(resp) {
					if(resp) {
						defer.resolve(resp);
					}
				}, function(resp) {
					base.prompt('获取商品出错');
					defer.reject(resp);
				});
				return defer.promise;
			},


			/**
			 * 所有分类
			 * @return {[type]} [description]
			 */
			loadProty: function () {
				var defer = $q.defer();
				var homeproty = sessionStorage.getItem("homeproty");
				if (!homeproty || homeproty == "undefined") {
					base.request("shop-categroy/mapi/list", 1, {})
					.then(function(resp) {
						if(resp.length > 0) {
							sessionStorage.setItem("homeproty", JSON.stringify(resp));
							defer.resolve(resp);
						} else {
							base.prompt("无法找到相关数据");
						}
					}, function(resp){
						base.prompt("请求错误");
					});
				} else {
					defer.resolve(JSON.parse(sessionStorage.getItem("homeproty")));
				}
				return defer.promise;
			},

			/**
			 * 所有地理位置
			 */
			// loadAllAddress: function() {
			// 	var defer = $q.defer();
			// 	base.request("adchengshiTwo", {})
			// 	.then(function(resp) {
			// 		defer.resolve(resp);
			// 	}, function(resp){
			// 		base.prompt('获取地理位置出错');
			// 		defer.reject(resp);
			// 	});
			// 	return defer.promise;
			// },

			// /**
			//  * 热门城市
			//  */
			// loadHotAddress: function() {
			// 	var defer = $q.defer();
			// 	base.request("adhotCity", {})
			// 	.then(function(resp) {
			// 		defer.resolve(resp);
			// 	},function(resp) {
			// 		base.prompt("获取热门城市出错");
			// 		defer.reject(resp);
			// 	});
			// 	return defer.promise;
			// },

			// /**
			//  * 切换县区
			//  */
			// loadRegionalAddress: function(addrs) {
			// 	var defer = $q.defer();
			// 	base.request("adgetXianji", {cityName: addrs})
			// 		.then(function(resp) {
			// 			defer.resolve(resp);
			// 		},function(resp) {
			// 			base.prompt("获取县区出错");
			// 			defer.reject(resp);
			// 		});
			// 	return defer.promise;
			// },
			
			/**
			 * 搜索商品或者店铺
			 */
			searchShopOrGoods: function(arg){
				var defer = $q.defer();
				base.request("shgetShopAndName", {name: arg}).then(function(resp){
					defer.resolve(resp.data);
				},function(resp){
					defer.reject(resp);
				});
				return defer.promise;
			}
		};
	}]);

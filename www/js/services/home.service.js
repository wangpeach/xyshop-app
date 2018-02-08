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
			 * ����Ʒ
			 * @param  {[type]} inx [description]
			 * @return {[type]}     [description]
			 */
			hotGoods: function(inx, isload) {
				var defer = $q.defer();
				base.request('goods/mapi/hots', 1, { shop: null, key: null, offset: inx}, isload)
				.then(function(resp) {
					if(resp) {
						defer.resolve(resp);
					}
				}, function(resp) {
					base.prompt('��ȡ��Ʒ����');
					defer.reject(resp);
				});
				return defer.promise;
			},


			/**
			 * ���з���
			 * @return {[type]} [description]
			 */
			loadProty: function (isload) {
				var defer = $q.defer();
				var homeproty = sessionStorage.getItem("homeproty");
				if (!homeproty || homeproty == "undefined") {
					base.request("shop-categroy/mapi/list", 1, {}, isload)
					.then(function(resp) {
						if(resp.length > 0) {
							sessionStorage.setItem("homeproty", JSON.stringify(resp));
							defer.resolve(resp);
						} else {
							base.prompt("加载失败");
						}
					}, function(resp){
						base.prompt("error");
					});
				} else {
					defer.resolve(JSON.parse(sessionStorage.getItem("homeproty")));
				}
				return defer.promise;
			},

			/**
			 * ���е���λ��
			 */
			// loadAllAddress: function() {
			// 	var defer = $q.defer();
			// 	base.request("adchengshiTwo", {})
			// 	.then(function(resp) {
			// 		defer.resolve(resp);
			// 	}, function(resp){
			// 		base.prompt('��ȡ����λ�ó���');
			// 		defer.reject(resp);
			// 	});
			// 	return defer.promise;
			// },

			// /**
			//  * ���ų���
			//  */
			// loadHotAddress: function() {
			// 	var defer = $q.defer();
			// 	base.request("adhotCity", {})
			// 	.then(function(resp) {
			// 		defer.resolve(resp);
			// 	},function(resp) {
			// 		base.prompt("��ȡ���ų��г���");
			// 		defer.reject(resp);
			// 	});
			// 	return defer.promise;
			// },

			// /**
			//  * �л�����
			//  */
			// loadRegionalAddress: function(addrs) {
			// 	var defer = $q.defer();
			// 	base.request("adgetXianji", {cityName: addrs})
			// 		.then(function(resp) {
			// 			defer.resolve(resp);
			// 		},function(resp) {
			// 			base.prompt("��ȡ��������");
			// 			defer.reject(resp);
			// 		});
			// 	return defer.promise;
			// },
			
			/**
			 * ������Ʒ���ߵ���
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

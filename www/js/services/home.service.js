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
			hotGoods: function(inx) {
				var defer = $q.defer();
				base.request('goods/mapi/list', 1, { shop: null, key: null, offset: inx})
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
							base.prompt("�޷��ҵ��������");
						}
					}, function(resp){
						base.prompt("�������");
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

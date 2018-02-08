/**
 * products.service Module
 *
 * Description
 */
angular.module('products.service', [])
	.factory('Products', ["$http", "$q", "base", function($http, $q, base) {
		var products = {

			getShopById: function(arg) {
				var defer = $q.defer();
				base.request('shop/mapi/only', 1, {
					"uuid": arg
				}).then(function(resp) {
					defer.resolve(resp);
				}, function(resp) {
					defer.reject(resp);
				});
				return defer.promise;
			},

			getGoodById: function(arg) {
				var defer = $q.defer();
				base.request('goods/mapi/only', 1, {
					"good": arg
				}).then(function(resp) {
					products.service
					//console.log(resp);
					defer.resolve(resp);
				}, function(resp) {
					defer.reject(resp);
				});
				return defer.promise;
			},

			//获取产品分类的商品列表
			getProByType: function(arg) {
				var defer = $q.defer();
				base.request('goods/mapi/list', 1, arg).then(function(resp) {
					defer.resolve(resp);
				}, function(resp) {
					defer.reject(resp);
				});
				return defer.promise;
			},
		};
		return products;
	}]);
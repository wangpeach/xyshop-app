angular.module('realtime.service', [])
.factory('RealTime', ["$http", "$q", "base", function($http, $q, base) {
	var realTime =  {
		getClassify : function() {
			var defer = $q.defer();
			if(localStorage.getItem("classify")) {
				defer.resolve(JSON.parse(localStorage.getItem("classify")));
			} else {
				this.requestClassify().then(function(data) {
					defer.resolve(data);
				}, function(resp) {
					defer.reject(resp);
				});
			}
			return defer.promise;
		},
		requestClassify : function() {
			var deferred = $q.defer();
			// $http.jsonp(base.getUrl("mbpt_classify"), base.handleParams())
			base.request('ifygaincy', {}, {})
			.then(function(data) {
				localStorage.setItem("classify", JSON.stringify(data));
				deferred.resolve(data);
			});
			return deferred.promise;
		},

		/************************************访美团控制部分*****************************************/
		//获取店铺列表数据
		requestShops : function() {
			var defer=$q.defer();
			base.request('shsearchShop',{'shop.status': 1}).then(function(resp){
				defer.resolve(resp.data);
			},function(resp){
				defer.reject(resp);
			});
			return defer.promise;
		},
		//获取店铺详情数据
		getShopDetails : function(arg){
			if(isNaN(arg)){
				params = {
					shopName: arg
				}
			}else{
				params = {
					shopId: arg
				}
			}
			var defer = $q.defer();
			base.request('progetProductByid', params).then(function(resp){
				defer.resolve(resp);
			},function(resp){
				defer.reject(resp);
			});
			return defer.promise;
		},
		//获取店铺商品列表
		getShopPros : function(arg, curinx){
			var defer = $q.defer();
			base.request('prosearch', {'product.productShopid': arg, 'product.curProInx': curinx, 'product.pagesize': 10}).then(function(resp){
				//console.log(JSON.stringify(resp));
				defer.resolve(resp.data);
			},function(resp){
				defer.reject(resp);
			});
			return defer.promise;
		}
	}
	return realTime;
}])
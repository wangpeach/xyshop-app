angular.module('cart.service', [])
	.factory('Cart', ['$timeout', '$q', '$http', '$window', '$ionicLoading', '$rootScope', '$ionicPopup', '$ionicPlatform', 'base', 'Account',
		function ($timeout, $q, $http, $window, $ionicLoading, $rootScope, $ionicPopup, $ionicPlatform, base, Account) {

			// localStorage.removeItem("cartpd");
			var _cart = localStorage.getItem("cartpd") ? JSON.parse(localStorage.getItem("cartpd")) : new Array();
			var s = base;

			return {
				/**
				 * 支付前 处理我的订单模块里的订单
				 * @param  {[type]} data [description]
				 * @return {[type]}      [description]
				 */
				handleMyOrdersPd: function (_scope, data) {
					var _this = this,
						tempOrders = new Array();

					/**
					 * 提取商品信息
					 * @param  {[type]} arg [description]
					 * @return {[type]}     [description]
					 */
					var extractPd = function (arg) {
						var props = new Array();
						if (arg.productinfo) {
							var _every_props = arg.productinfo.split('；');
							angular.forEach(_every_props, function (sen, inx) {
								var oneprop = sen.split(':');
								var prop = {
									pid: null,
									pname: oneprop[0],
									pval: {
										vid: null,
										vname: oneprop[1],
										price: ''
									}
								}
								props.push(prop);
							});
						}
						var pd = {
							num: arg.num,
							product: arg.pro,
							chooseProps: props,
							checked: true,
							total: 0
						};

						return pd;
					}

					angular.forEach(data.producrs, function (oSen, oInx) {
						var ns = false;
						angular.forEach(tempOrders, function (tSen, tInx) {
							if (oSen.shop.id == tSen.shopId) {
								var pd = extractPd(oSen);
								tSen.products.push(pd);
								ns = true;
							}
						});
						if (!ns) {
							var _pro = new Array();
							var pd = extractPd(oSen);
							_pro.push(pd);
							var orders = {
								shopId: oSen.shop.id,
								shopName: oSen.shop.shopname,
								checkAll: true,
								products: _pro
							};
							tempOrders.push(orders);
						}
					});
					var sender = _this.handleCartsPd(tempOrders);
					//下单时需要检查商品选中数量,这里配置商品选中数量为订单商品数量
					_scope.config = {
						checkNum: sender._data.length
					};
					return sender;
				},

				/**
				 * 下单， 选择收货人， 支付方式
				 * _scope 作用域
				 * @return {[type]} [description]
				 */
				readyBuy: function (_scope, checkUrl) {

					var _this = this,
						defer = $q.defer(),
						singed = Account.signined;
					try {
						_scope.checkUrl = checkUrl;
						_scope.targetAddr = {};
						_scope.ordersTotal = 0;
						_scope.orders = new Array();
						_scope.paywhy = [{
							name: '支付宝支付',
							alis: 'al',
							active: true
						}, {
							name: '微信支付',
							alis: 'wx',
							active: false
						}]


						/**
						 * 购买
						 * @param  {[type]} orders   [订单对象, 需提前组织好数据]
						 * @param  {[type]} total    [总额]
						 * @param  {[type]} orderNum [订单号，如果没有不需要传]
						 * @return {[type]}          [description]
						 */
						_scope.buy = function (orders, total, orderNum) {
							var buyDefer = $q.defer();
							//如果已登陆
							if (!Account.signined) {
								base.prompt('您还没有登陆哦');
							} else {
								_scope.order_num = orderNum;
								_scope.getTakePeople().then(function () {
									if (_scope.config.checkNum > 0) {
										base.openModal(_scope, 'templates/pay.html', "slideInUp").then(function (payModal) {
											payModal.show();

											_scope.orders = orders;
											_scope.ordersTotal = total.toFixed(2);

											_scope.hasYoufei = function (arg) {
												return parseFloat(arg) > 0 ? true : false;
											}

											/**
											 * 计算差价
											 * @param  {[type]} orig [原价]
											 * @param  {[type]} now  [现价]
											 * @return {[type]}      [description]
											 */
											_scope.spread = function (orig, now, respow) {
												return ((Math.round((parseFloat(orig) - parseFloat(now)) * Math.pow(10, 2)) / Math.pow(10, 2) * respow)).toFixed(2);
											}

											_scope.closeOrderModel = function () {
												$ionicPopup.confirm({
													title: '真的不要了吗? 请三思而后行~',
													cancelText: "残忍舍弃",
													cancelType: "button-light",
													okText: "再想片刻",
													okType: "button-assertive"
												}).then(function (res) {
													if (!res) {
														payModal.hide();
													}
												});
											}

											_scope.chooseAddrs = function () {
												base.openModal(_scope, 'templates/chooseCoupon.html', "fadeInRight").then(function (caModal) {
													caModal.show();

													_scope.activeAdr = function (item) {
														_scope.targetAddr = item;
														angular.forEach(_scope.addrs, function (sen, inx) {
															sen.active = false;
														});
														item.active = true;
														caModal.hide();
													}

													_scope.closeCaModal = function () {
														caModal.hide();
													}
												})
											}

											_scope.choosePaywhy = function () {
												base.openModal(_scope, "templates/payment.html", "fadeInRight").then(function (pwModal) {
													pwModal.show();

													_scope.changePayWhy = function (paywhy) {
														angular.forEach(_scope.paywhy, function (sen, inx) {
															sen.active = false;
														})
														paywhy.active = true;
													}

													_scope.closePwModal = function () {
														pwModal.hide();
													}
												})
											}

											_scope.subNewOrder = function () {
												$ionicLoading.show({
													template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
													showBackdrop: false
												});
												var _paywhy = undefined;
												angular.forEach(_scope.paywhy, function (pw, pwix) {
													if (pw.active) {
														_paywhy = pw.alis;
													}
												})

												_this.subNewOrder(_scope.orders, _scope.targetAddr.id, _paywhy, _scope.ordersTotal)
													.then(function (data) {
														if (!data.state) {
															switch (_paywhy) {
																case "al":
																	_scope.alipay(data)
																		.then(function (res) {
																			_this.mulRemove();
																		});
																	break;
																case "wx":

																	break;
															}
														} else {
															base.prompt(data.reason);
														}
													}, function (resp) {
														base.prompt("error");
													}).finally(function () {
													$ionicLoading.hide();
												});
											}

											/**
											 * 支付我的订单里商品
											 * @return {[type]} [description]
											 */
											_scope.subMyOrdersPayment = function () {
												$ionicLoading.show({
													template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
													showBackdrop: false
												});
												_this.subOldOrder(_scope.order_num, _scope.targetAddr.id).then(function (res) {
													$ionicLoading.hide();
												});
												var _paywhy = undefined;
												angular.forEach(_scope.paywhy, function (pw, pwix) {
													if (pw.active) {
														_paywhy = pw.alis;
													}
												})
												_this.pd_payment(_scope.order_num, _paywhy).then(function (data) {
													if (!data.state) {
														switch (_paywhy) {
															case "al":
																_scope.alipay(data);
																break;
															case "wx":
																break;
														}
													} else {
														base.prompt(data.reason);
													}
												});
											}

											/**
											 * 付款
											 * @return {[type]} [description]
											 */
											_scope.pay = function () {
												if (_scope.order_num) {
													_scope.subMyOrdersPayment();
												} else {
													_scope.subNewOrder();
												}
												//允许检查支付状态
												_scope.ischeck = true;
											}

											_scope.alipay = function (data) {
												var defer = $q.defer();
												_scope.tradeno = data.out_trade_no;
												//ios 支付
												if (ionic.Platform.isIOS()) {
													_this.alipay(data);
													$ionicPopup.confirm({
														title: "付款成功了吗?",
														cancelText: "失败",
														cancelType: "button-outline",
														okText: "成功",
														okType: "button-assertive"
													}).then(function (res) {
														if (res) {
															$ionicLoading.show({
																template: '<div style="background: rgba(0,0,0,0.6); width: 88px; border-radius: 6px; height: 40px; line-height: 40px;">请稍后..</div>',
																showBackdrop: false
															});
															var url = _scope.checkUrl;
															_this.checkAliPayment(url, _scope.tradeno).then(function (data) {
																if (data.state == "ok") {
																	payModal.hide();
																	defer.resolve(true);
																	buyDefer.resolve(true);
																}
																$rootScope.prompt(data.reason, 2000);
															}, function () {
																base.prompt("error");
															});

														}
													});
												} else {
													_this.alipay(data).then(function (res) {
														payModal.hide();
														defer.resolve(res);
														buyDefer.resolve(res);
													});
												}

												return defer.promise;
											}
										});
									} else {
										base.prompt("您还没有选中商品哦");
									}
								});
							}
							return buyDefer.promise;
						};
						defer.resolve(true);
					} catch (err) {
						defer.reject(false);
					}
					return defer.promise;
				},

				alipay: function (arg) {
					var defer = $q.defer();
					$window.Alipay.Base.pay(arg, function (successResults) {
						var payres = successResults.resultStatus;
						if (payres === "9000") {
							defer.resolve(true);
							base.prompt("订单支付成功");
						} else if (payres == "6001") {
							base.prompt("已取消支付");
							defer.resolve(false);
						} else if (payres == "6002") {
							base.prompt("网络连接出错");
							defer.resolve(false);
						} else if (payres == "4000") {
							base.prompt("订单支付失败");
							defer.resolve(false);
						} else if (payres == "8000") {
							defer.resolve(true);
							base.prompt("正在处理中");
						}
					}, function (errorResult) {
						base.prompt("发起支付失败");
						defer.reject(errorResult);
					});
					return defer.promise;
				},

				/**
				 * [checkPayment description]
				 * @param  {[type]} tradeno [description]
				 * @return {[type]}         [description]
				 */
				checkAliPayment: function (checkUrl, tradeno) {
					var defer = $q.defer();
					$timeout(function () {
						$http.jsonp(s.getUrl(checkUrl), s.handleParams({tradeno: tradeno}))
							.then(function (resp) {
								defer.resolve(resp.data);
							}, function () {
								defer.reject(false);
							})
					}, 1000);
					return defer.promise;
				}
			};
		}
	]);

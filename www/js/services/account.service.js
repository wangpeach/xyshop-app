angular.module('account.service', [])
	.factory('Account', ["$http", "$q", "$ionicPlatform", "$cordovaCamera", "$cordovaToast", "$cordovaDatePicker", "$cordovaContacts", "base",
		function ($http, $q, $ionicPlatform, $cordovaCamera, $cordovaToast, $cordovaDatePicker, $cordovaContacts, base) {
			var account = {

				signined: !!localStorage.getItem("account"),
				/**
				 * [singIn description]
				 * @param  {[type]} data [description]
				 * @return {[type]}      [description]
				 */
				singIn: function (data) {
					let deferred = $q.defer(), that = this;
					base.request("user/mapi/login", 1, data)
						.then(function (result) {
							if (result) {
								that.storeUser(result);
								that.takeCoupons();
								that.takeCollects();
							}
							deferred.resolve(result);
						}, function (result) {
							deferred.reject(result);
						});
					return deferred.promise;
				},
				/**
				 * 存储用户数据
				 * @param  {[type]} arg [description]
				 * @return {[type]}     [description]
				 */
				storeUser: function (arg) {
					this.signined = true;
					localStorage.setItem("account", JSON.stringify(arg));
				},


				reload: function () {
					var deferred = $q.defer(),
						self = this;
					base.request("user/mapi/reload", 1, {uuid: self.getUser().uuid}, false)
						.then(function (resp) {
							if (resp) {
								self.storeUser(resp);
								self.takeCoupons();
								self.takeCollects();
							}
							deferred.resolve(resp.data);
						}, function (resp) {
							deferred.reject(resp);
						})
					return deferred.promise;
				},
				/**
				 * 注册 检查用户数据是否通过验证
				 * @param  {[type]} arg [description]
				 * @return {[type]}     [description]
				 */
				checkusr: function (arg) {
					var deferred = $q.defer();
					//$http.jsonp(s.getUrl("mblr_checkreg"), s.handleParams(arg))
					base.request("mblr_checkreg", arg)
						.then(function (resp) {
							deferred.resolve(resp);
						}, function (resp) {
							deferred.reject(resp);
						});
					return deferred.promise;
				},
				/**
				 * [getUser description]
				 * @return {[type]} [description]
				 */
				getUser: function () {
					return JSON.parse(localStorage.getItem("account"));
				},

				/**
				 * [signOut description]
				 * @return {[type]} [description]
				 */
				signOut: function () {
					this.signined = false;
					localStorage.removeItem("account");
				},

				/**
				 * 获取优惠卷
				 * @returns {Promise}
				 */
				takeCoupons: function (refresh) {
					let def = $q.defer();
					// coupons = localStorage.getItem("coupons");
					// if(!coupons || refresh) {
					let params = {
						user: this.getUser().uuid,
						shopId: null,
						cate: null,
						good: null
					};
					base.request("usercoupon/mapi/list", 1, params, false).then(function (result) {
						localStorage.setItem("coupons", result);
						def.resolve(result);
					})
					// } else {
					// 	def.resolve(coupons);
					// }
					return def.promise;
				},
				/**
				 *  获取收藏
				 * @returns {Promise}
				 */
				takeCollects: function (refresh, _type) {
					let def = $q.defer(), storageName = "collection" + _type,
						collects = localStorage.getItem(storageName);
					if (!collects || refresh) {
						let params = {user: this.getUser().uuid, type: _type};
						base.request("collect/mapi/list", 1, params, false).then(function (result) {
							def.resolve(result);
							localStorage.setItem(storageName, JSON.stringify(result));
						});
					} else {
						def.resolve(JSON.parse(collects));
					}
					return def.promise;
				},

				/**
				 * [获取余额]
				 * @return {[type]} [description]
				 */
				getBalance: function () {
					var deferred = $q.defer();
					var sender = {
						usersid: this.getUser().usersid
					}
					//$http.jsonp(s.getUrl("mbus_balance"), s.handleParams(sender))
					base.request("mbus_balance", sender)
						.then(function (resp) {
							deferred.resolve(resp);
						}, function (resp) {
							deferred.reject(resp);
						})
					return deferred.promise;
				},
				/**
				 * 发送验证码
				 * @param  {[type]} arg    [description]
				 * @param  {[type]} effect [description]
				 * @return {[type]}        [description]
				 */
				sendCode: function (arg) {
					var deferred = $q.defer();
					base.request("sms/mapi/reg-code", 0, {'phone': arg})
						.then(function (resp) {
							deferred.resolve(resp);
						}, function (resp) {
							deferred.reject(resp);
						});
					return deferred.promise;
				},

				/**
				 * 修改密码
				 * @param  {[type]} arg [description]
				 * @return {[type]}     [description]
				 */
				modPass: function (arg) {
					var deferred = $q.defer();
					//$http.jsonp(s.getUrl("uschangePass"), s.handleParams(arg))
					base.request("uschangePass", arg)
						.then(function (resp) {
							deferred.resolve(resp);
						}, function (resp) {
							deferred.reject(resp);
						});
					return deferred.promise;
				},

				/**
				 * 注册
				 * @param  {[type]} arg [description]
				 * @return {[type]}     [description]
				 */
				register: function (arg) {
					var deferred = $q.defer();
					base.request("user/mapi/register", 1, arg)
						.then(function (resp) {
							deferred.resolve(resp);
						}, function (resp) {
							deferred.reject(resp);
						})
					return deferred.promise;
				},
				chooseDate: function (_date) {
					var defer = $q.defer();
					if (!_date) {
						_date = new Date();
					} else {
						if (_date.getMonth() == 0) {
							_date.setFullYear(_date.getFullYear() - 1);
							_date.setMonth(11);
						} else {
							_date.setMonth(_date.getMonth() - 1);
						}
					}

					$ionicPlatform.ready(function () {
						var options = {
							mode: 'date',
							date: _date,
							allowOldDates: true,
							allowFutureDates: false
						}
						$cordovaDatePicker.show(options).then(function (date) {
							defer.resolve(date);
						});
					});
					return defer.promise;
				},

				chooseContact: function () {
					var defer = $q.defer();
					$ionicPlatform.ready(function () {
						$cordovaContacts.pickContact().then(function (contcat) {
							var arr = new Array();
							angular.forEach(contcat.phoneNumbers, function (o, i) {
								var temp = o.value;
								while (temp.includes('-') || temp.includes(' ')) {
									temp = temp.replace(' ', '').replace(/(-)/, '');
								}
								arr.push(temp);
							});
							var _contcat = {
								displayName: contcat.displayName,
								name: contcat.name,
								phones: arr
							}
							defer.resolve(_contcat);
						}, function (error) {
							var errMsg = undefined;
							switch (error) {
								case ContactError.UNKNOWN_ERROR:
									errMsg = "未知原因, 获取联系人失败"
									break;
								case ContactError.INVALID_ARGUMENT_ERROR:
									errMsg = "参数无效, "
									break;
								case ContactError.TIMEOUT_ERROR:
									errMsg = "加载超时, 获取联系人失败"
									break;
								case ContactError.IO_ERROR:
									errMsg = "读取错误, 获取联系人失败"
									break;
								case ContactError.NOT_SUPPORTED_ERROR:
									errMsg = "暂不支持您的设备"
									break;
								case ContactError.PERMISSION_DENIED_ERROR:
									errMsg = "没有权限获取联系人"
									break;
							}
							if (errMsg) {
								$cordovaToast.showShortCenter(errMsg);
							}
						})
					});
					return defer.promise;
				}
			};
			return account;
		}
	])

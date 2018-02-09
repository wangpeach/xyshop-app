// , 'cordovaHTTP2'
angular.module('starter.services', ['home.service', 'realtime.service', 'cart.service', 'account.service', 'products.service'])
	.factory('base', ['$window', '$ionicPlatform', '$http', '$q', '$cordovaToast', '$ionicModal', '$ionicPopover', "$ionicLoading", "$cordovaAppVersion", "$cordovaFileTransfer", "$cordovaFile", "$cordovaFileOpener2", "$timeout", "$cordovaCamera", "$ionicPopup", "$rootScope",
		function($window, $ionicPlatform, $http, $q, $cordovaToast, $ionicModal, $ionicPopover, $ionicLoading, $cordovaAppVersion, $cordovaFileTransfer, $cordovaFile, $cordovaFileOpener2, $timeout, $cordovaCamera, $ionicPopup, $rootScope) {
			if (!localStorage.getItem("config")) {
				localStorage.setItem("config", JSON.stringify({
					showBalance: false
				}));
			}
			var _config = JSON.parse(localStorage.getItem("config"));
			var services = {
				debug: false,
				// hostHome: "http://192.168.0.2:8080/xyshop/",
				// hostShop: "http://192.168.0.2:8080/xyshop-supplier/",
				// 用生产服务器测试
				hostHome: "http://219.141.127.213:8087/xyshop/",
				hostShop: "http://219.141.127.213:8087/xyshop-supplier/",
				ipcurl: "http://219.141.127.213:81/",

				upgrade_url: '',
				//高德web服务api
				GaodeRestapiKey: "13cdbb92be4fb255d52f4ca82863d949",
				//高德本地检索tableid
				GaodeTableId: '58354330afdf520ea8ecb6b8',

				// 检查更新
				upgrade: function(showtips) {
					let that = this;
					$ionicPlatform.ready(function() {
						that.getVersion().then(function(_version) {
							that.request("params/app-version", 0, {
								"version": _version
							}).then(function(result) {
								if (result.url) {
									console.log(result);
									that.confirm($rootScope, "提示", "发现新版本,是否更新?").then(function(res) {
										if (res) {
											$ionicLoading.show({
												template: "已经下载：0%"
											});
											let targetApk = cordova.file.dataDirectory + "xyshop.apk";
											$cordovaFileTransfer.download(result.url, targetApk, {}, true).then(function() {
												$ionicLoading.hide();
												$cordovaFileOpener2.open(targetApk, 'application/vnd.android.package-archive').then(function() {}, function(err) {
													that.prompt($rootScope, "请手动安装应用程序");
												});
											}, function() {
												that.prompt($rootScope, "下载失败");
											}, function(progress) {
												$timeout(function() {
													var downloadProgress = (progress.loaded / progress.total) * 100;
													$ionicLoading.show({
														template: "已下载：" + Math.floor(downloadProgress) + "%"
													});
													if (downloadProgress > 99) {
														$ionicLoading.hide();
													}
												})
											});

										}
									});
								} else {
									if (showtips) {
										that.prompt($rootScope, "已是最新版本");
									}
								}
							});
						});
					});
				},

				/**
				 * 获取Url
				 * @param  {[type]} service [description]
				 * @return {[type]}         [description]
				 */
				getUrl: function(service) {
					return [this.hostHome + service, this.hostShop + service, this.ipcurl + service];
				},

				/**
				 * 请求服务
				 * @param  {[type]} service [description]
				 * @param  {[type]} host    [指向哪个服务模块, 0 (主模块) / 1 (商家模块) / 2(监控模块)]
				 * @param  {[type]} data    [description]
				 * @return {[type]}         [description]
				 */
				// request: function(service, host, data) {
				//     var defer = $q.defer(),
				//         that = this;
				//     if ($window.cordova) {
				//         if (service.indexOf("http") !== 0) {
				// 	        service = that.getUrl(service)[host];
				//         }
				//         that.handleParams(data).then(function(arg) {
				// 	        cordovaHTTP2.post(service, arg, {}, function (response) {
				// 		        try {
				// 			        let ctype = response.headers["Content-Type"], result = undefined;
				// 			        if(ctype.indexOf("application/json") === 0) {
				// 				        result = JSON.parse(response.data);
				// 			        } else {
				// 				        result = response.data;
				// 			        }
				// 			        defer.resolve(result);
				// 		        } catch (e) {
				// 			        console.log('JSON parseing error');
				// 		        }
				// 	        },function(response) {
				// 		        that.req_error_handle(response.status);
				// 	        });
				//         });
				//     }
				//     return defer.promise;
				// },

				/**
				 * 请求服务
				 * @param  {[type]} service [description]
				 * @param  {[type]} host    [指向哪个服务模块, 0 (主模块) / 1 (商家模块)]
				 * @param  {[type]} data    [description]
				 * @return {[type]}         [description]
				 */
				request: function(service, host, data, isLoad, _timeout) {
					var defer = $q.defer(),
						that = this;
					if (isLoad === undefined || isLoad === null || isLoad !== false) {
						that.loading();
					}
					data = that.handleAndroidParams(data, false);
					// data = that.handleParams(data);
					if (service.indexOf("http") !== 0) {
						service = that.getUrl(service)[host];
					}
					if (!_timeout) {
						_timeout = 30000
					};
					let config = {
						timeout: _timeout
					};
					$http.post(service, data, config).then(function(response) {
						defer.resolve(response.data);
						that.loaded();
					}, function(response) {
						that.req_error_handle(response.status);
						that.loaded();
						defer.reject(response.status);
					});
					return defer.promise;
				},

				get: function(service, host, data) {
					var defer = $q.defer(),
						that = this;
					data = that.handleAndroidParams(data, false);
					if (service.indexOf("http") != 0) {
						service = that.getUrl(service)[host];
					}
					$http.get(service, data).then(function(response) {
						defer.resolve(response.data);
					}, function(response) {
						that.req_error_handle(response.status);
					});
					return defer.promise;
				},

				/**
				 * 请求错误时处理方法
				 * @param  {[type]} code [description]
				 * @return {[type]}      [description]
				 */
				req_error_handle: function(code) {
					switch (code) {
						case 404:
							console.log('无法访问服务');
							this.prompt($rootScope, '无法访问服务');
							break;
						default:
							this.prompt($rootScope, 'error');
							break;
					}
				},

				/**
				 * IOS请求参数封装
				 * @param  {[type]} data [description]
				 * @return {[type]}      [description]
				 */
				handleParams: function(data) {
					var defer = $q.defer();
					data = data || {};
					data.source = this.getSystem();
					this.getVersion().then(function(version) {
						data.version = version;
						defer.resolve(data);
					});
					return defer.promise;
				},

				/**
				 * 获取系统
				 * @return {[type]} [description]
				 */
				getSystem: function() {
					return $ionicPlatform.is('ios') ? "IOS" : "Android";
				},

				loadAppName: function() {
					let defer = $q.defer();
					$ionicPlatform.ready(function() {
						if (window.cordova) {
							cordova.getAppVersion.getAppName(function(name) {
								sessionStorage.setItem("appName", name);
								defer.resolve(name);
							});
						}
					});
					return defer.promise;
				},

				getVersion: function() {
					let defer = $q.defer();
					if (window.cordova) {
						$ionicPlatform.ready(function() {
							$cordovaAppVersion.getVersionNumber().then(function(version) {
								defer.resolve(version);
							});
						});
					}
					return defer.promise;
				},

				/**
				 * Android请求参数封装
				 * @param  {[type]} data  [description]
				 * @param  {[type]} cache [description]
				 * @return {[type]}       [description]
				 */
				handleAndroidParams: function(data, cache) {
					// var sender = {};
					data = data || {};
					// data.callback = "JSON_CALLBACK";
					data.source = "Android";
					// sender.params = data;
					// if (cache == true || cache === undefined) {
					//     sender.cache = true;
					// } else {
					//     sender.cache = false;
					// }
					// //超时20秒
					// sender.timeout = 20000;
					// return sender;
					return data;
				},

				/**
				 * [格式化手机号码]
				 * @param  {[type]} phone [description]
				 * @return {[type]}       [description]
				 */
				formatPhone: function(phone) {
					if (phone) {
						return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
					}
				},

				/**
				 * 获取url参数
				 * @param  {[type]} url   [description]
				 * @param  {[type]} paras [description]
				 * @return {[type]}       [description]
				 */
				getUrlParams: function(url, paras) {
					var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
					var paraObj = {}
					for (i = 0; j = paraString[i]; i++) {
						paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
					}
					var returnValue = paraObj[paras.toLowerCase()];
					if (typeof(returnValue) == "undefined") {
						return "";
					} else {
						return (unescape(returnValue.replace(/\\u/gi, '%u')));
					}
				},

				/**
				 * 打开一个模模板
				 * @param  {[type]} template [description]
				 * @param  {[type]} _scope   [description]
				 * @param  {[type]} animate  [description]
				 * @return {[type]}          [description]
				 */
				openModal: function(_scope, template, animate) {
					var animation = "animated ",
						defer = $q.defer();
					if (animate) {
						animation += animate;
					} else {
						animation += "slide-in-right";
					}
					$ionicModal.fromTemplateUrl(template, {
						scope: _scope,
						animation: animation
					}).then(function(modal) {
						defer.resolve(modal);
					});
					return defer.promise;
				},

				/**
				 * 打开一个浮动框
				 * @param  {[type]} template [description]
				 * @param  {[type]} _scope   [description]
				 * @return {[type]}          [description]
				 */
				openPopover: function(template, _scope) {
					var defer = $q.defer();
					$ionicPopover.fromTemplateUrl(template, {
						scope: _scope,
					}).then(function(popover) {
						defer.resolve(popover);
					});
					return defer.promise;
				},


				/**
				 * 消息提示
				 * @param  {[type]} msg [description]
				 * @return {[type]}     [description]
				 */
				prompt: function(_scope, msg, callback) {
					var sender = {
						template: '<span style="color: white; font-size: 13px; padding: 0.5rem; background: #464646;">' + msg + '</span>',
						scope: _scope ? _scope : null,
						duration: 2000,
						noBackdrop: true
					};
					$ionicLoading.show(sender).then(function() {
						if (callback) {
							$timeout(function() {
								callback.call(this);
							}, 2000);
						}
						console.log("prompt  complete");
					});
				},

				alert: function(_scope, title, msg) {
					var params = {
						title: title,
						template: msg,
						okText: '确定',
						okType: 'button button-small  button-dark',
					}
					$ionicPopup.alert(params);
				},

				confirm: function(_scope, title, msg) {
					var defer = $q.defer();
					var params = {
						title: title, // String. The title of the popup.
						template: msg, // String (optional). The html template to place in the popup body.
						cancelText: '取消', // String (default: 'Cancel'). The text of the Cancel button.
						cancelType: 'button-light', // String (default: 'button-default'). The type of the Cancel button.
						okText: '确定', // String (default: 'OK'). The text of the OK button.
						okType: '', // String (default: 'button-positive'). The type of the OK button.
					}
					$ionicPopup.confirm(params).then(function(res) {
						defer.resolve(res);
					});
					return defer.promise;
				},
				getIPAddress: function() {
					var defer = $q.defer();
					if (!this.debug) {
						networkinterface.getWiFiIPAddress(function(ip, subnet) {
							defer.resolve(ip);
						}, function(error) {
							defer.resolve("127.0.0.1");
						});
					} else {
						defer.resolve("127.0.0.1");
					}
					return defer.promise;
				},
				/**
				 * 加载动画
				 * @return {[type]} [description]
				 */
				loading: function() {
					$ionicLoading.show({
						template: '<ion-spinner icon="ios" class="spinner-dark"></ion-spinner>',
						noBackdrop: true
					});
				},

				/**
				 * 隐藏动画
				 * @return {[type]} [description]
				 */
				loaded: function() {
					$ionicLoading.hide();
				},

				/**
				 * 获取图片
				 * @param  {[type]} source [0:拍照获取， 1:相册获取]
				 * @return {[type]}        [description]
				 */
				takePictures: function(source) {
					var defer = $q.defer(),
						_this = this;
					$ionicPlatform.ready(function() {
						var options = {
							quality: 80,
							destinationType: Camera.DestinationType.DATA_URL,
							sourceType: source == 0 ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY,
							encodingType: Camera.EncodingType.JPEG,
							mediaType: Camera.MediaType.PICTURE,
							popoverOptions: Camera.PopoverArrowDirection.ARROW_DOWN,
							correctOrientation: true,
							saveToPhotoAlbum: false,
							allowEdit: true,
							targetWidth: 100,
							targetHeight: 100
						};
						$cordovaCamera.getPicture(options).then(function(imageData) {
							// _this.uploadHeader(imageData);
							defer.resolve(imageData);
						}, function(err) {
							defer.reject(err);
						})
					});
					return defer.promise;
				},
				/**
				 * 转换参数成javabean对象
				 * @param  {[type]} _class [description]
				 * @param  {[type]} obj    [description]
				 * @return {[type]}        [description]
				 */
				corvertBean: function(_class, obj) {
					var bean = new Object();
					for (item in obj) {
						var property = '' + _class + '.' + item;
						bean[property] = obj[item];
					}
					return bean;
				}
			}
			window.services = services;
			return services;
		}
	]);
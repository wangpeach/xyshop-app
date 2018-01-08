angular.module("account.controller", ["ionic"])
//我的主页
	.controller('AccountCtrl', ["$scope", "$rootScope", "$ionicTabsDelegate", "$state", "$stateParams", "$location", "$ionicPlatform", "$ionicModal", "$ionicLoading", "$timeout", "$interval", "$ionicSlideBoxDelegate", "$cordovaBarcodeScanner", "Account", "base",
		function ($scope, $rootScope, $ionicTabsDelegate, $state, $stateParams, $location, $ionicPlatform, $ionicModal, $ionicLoading, $timeout, $interval, $ionicSlideBoxDelegate, $cordovaBarcodeScanner, Account, base) {


			//默认显示登陆
			$scope.why = "Login";
			$scope.shopActionName = "";

			$scope.collectGoods = 0;
			$scope.collectShops = 0;

			//刚跳到个人账户时检测用户是否是老顾客
			$scope.accountInfoModal = function () {
				$scope.user = Account.getUser();

				if (!$scope.user.headImg) {
					$scope.user.headImg = "img/user_large.jpg";
				}

				$scope.doRefresh = function () {
					Account.reload().then(function (data) {
						$scope.user = data;
						$scope.accountInfoModal();
					}, function () {

					}).finally(function () {
						$scope.$broadcast('scroll.refreshComplete');
					})
				}
			};

			//跳转功能
			$scope.checkGo = function (arg, arg1) {
				if (arg === "clear") {
					sessionStorage.removeItem("homeproty");
					sessionStorage.removeItem("curCity");
					sessionStorage.removeItem("geolocation");
					sessionStorage.removeItem("geoloerror");
					base.prompt($scope, "清理完成");
				} else if (arg1 === "about") {
					$state.go(arg);
				} else if (arg === "upgrade") {
					base.upgrade(true);
				} else {
					if (Account.signined) {
						if (arg === "tab.myorder") {
							$state.go('tab.account-myorder', {backWhere: 'tab.account', status: arg1});
						} else if (arg === "tab.collect") {
							$state.go('tab.account-collect', {type: arg1});
						} else if (arg === 'wait') {
							base.prompt($scope, "敬请期待...");
						} else {
							$state.go(arg);
						}
					} else {
						base.prompt($scope, "请先登录", function () {
							$scope.signOrReg();
						});
					}
				}
			};

			//账户登陆注册模块
			$scope.sinregModal = function () {
				$scope.shopActionName = "免费开店";
				$scope._reguser = {};


				$scope.againNum = 0;
				$scope.againText = "获取验证码";
				$scope.iden = {
					userphone: ""
				};

				/*
				跳到登录模块
				 */
				$ionicModal.fromTemplateUrl('templates/login.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function (modal) {
					$scope.logmodal = modal;
				});

				//显示账户模块
				$scope.signOrReg = function () {
					$scope.why = "Login";
					$scope.logmodal.show();
				};
				//取消登陆
				$scope.cancel = function () {
					$scope.logmodal.hide();
				};

				/*
				跳到注册模块
				 */
				$scope.registerView = function () {
					$ionicModal.fromTemplateUrl('templates/register.html', {
						scope: $scope,
						animation: 'animated modal fadeInRight'
					}).then(function (modal) {
						$scope.regmodal = modal;
						modal.show();
					});
					//取消注册
					$scope.reglogin = function () {
						$scope.regmodal.hide();
					}
				};

				/*
				修改密码模块
				 */
				$scope.repassView = function () {
					$ionicModal.fromTemplateUrl('templates/repass.html', {
						scope: $scope,
						animation: 'animated modal fadeInRight'
					}).then(function (modal) {
						$scope.repassmodal = modal;
						modal.show();
					});
					//取消修改密码
					$scope.replogin = function () {
						$scope.repassmodal.hide();
					}
				};

				// /*
				// 扫码
				//  */
				// $scope.currentlyScanning = false;
				// $scope.scanCode = function ($event) {
				//     $event.stopPropagation();
				//     if (!$scope.currentlyScanning) {
				//         $scope.currentlyScanning = true;
				//         $ionicPlatform.ready(function () {
				//             var config = {
				//                 "showFlipCameraButton": true, // iOS and Android
				//                 "prompt": "请将二维码置于取景框内",
				//                 "formats": "QR_CODE",
				//                 "orientation": "portrait"
				//             };
				//             $cordovaBarcodeScanner.scan().then(function (result) {
				//                 if (!result.cancelled) {
				//                     // $ionicLoading.show({
				//                     //     template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
				//                     //     showBackdrop: false
				//                     // });
				//                     // var userid = base.getUrlParams(result.text, 'registerp');
				//                     var json = angular.fromJson(result.text);
				//                     $scope._reguser.temptjrn = json.username;
				//                     $scope._reguser.usersTuijianren = json.userid;
				//                     // Account.gainUserById(userid).then(function(data) {
				//                     //     $scope._reguser.temptjrn = data.username;
				//                     //     $scope._reguser.usersTuijianren = data.userid;
				//                     // }).finally(function() {
				//                     //     $ionicLoading.hide();
				//                     // });
				//                 } else {
				//                     base.prompt($scope, '已取消');
				//                 }
				//                 $scope.currentlyScanning = false;
				//             }, function (error) {
				//                 base.prompt($scope, '扫描二维码错误');
				//                 $scope.currentlyScanning = false;
				//             });
				//         });
				//     }
				// }

				/*
				获取验证码
				 */
				$scope.sendCode_Reg = function (arg) {
					base.loading();
					Account.sendCode(arg).then(function (data) {
						if (data.status) {
							base.loaded();
							$scope.againNum = 60;
							var stop = $interval(function () {
								if ($scope.againNum > 0) {
									$scope.againNum--;
									$scope.againText = "请等待(" + $scope.againNum + ")";
								} else {
									$interval.cancel(stop);
									$scope.againText = "重新发送";
								}
							}, 1000);
							base.prompt($scope, data.msg);

						} else {
							base.prompt($scope, data.msg);
						}
					}, function (resp) {
						base.prompt($scope, "error");
					});
				};

				/*
				注册
				 */
				$scope.idenSubmit = function (arg) {
					base.loading();
					base.request("sms/mapi/valid-code", 0, {
						"phone": arg.phoneNum,
						"code": arg.code
					}).then(function (resp) {
						base.loaded();
						if (resp) {
							Account.register(arg).then(function (data) {
								if (data.status) {
									base.prompt($scope, data.msg, function () {
										$scope.regmodal.hide();
									});
								} else {
									base.prompt($scope, data.msg);
								}
							}, function (resp) {
								base.prompt($scope, "error");
							})
						} else {

							base.prompt($scope, "验证码错误");
						}
					});
				};


				$scope.phone = {
					num: '',
					code: ''
				};

				/*
				修改密码， 通过手机号码获取验证码
				 */
				$scope.sendCode_forget = function (arg) {
					$ionicLoading.show({
						template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
						showBackdrop: false
					});
					Account.sendCode(arg.num, 1).then(function (data) {
						if (data.state == "ok") {
							$ionicLoading.hide();
							$scope.code = data.reason;
							base.prompt($scope, "验证码已发送");
							$scope.againNum = 60;
							$scope.againText = "请等待(60)";
							var stop = $interval(function () {
								if ($scope.againNum > 0) {
									$scope.againNum--;
									$scope.againText = "请等待(" + $scope.againNum + ")";
								} else {
									$interval.cancel(stop);
									$scope.againText = "重新发送";
								}
							}, 1000);
						} else {
							base.prompt($scope, data.reason);
						}
					}, function (resp) {
						base.prompt($scope, "error");
					});
				};

				//验证验证码
				// $scope.goforget = function(arg) {
				//         if (arg.code == $scope.code) {
				//             $ionicSlideBoxDelegate.slide($ionicSlideBoxDelegate.currentIndex() + 1, 500);
				//         } else {
				//             base.prompt($scope, "验证码错误");
				//         }
				//     }


				/*
				修改密码
				 */
				$scope.savePass = function (arg) {
					$ionicLoading.show({
						template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
						showBackdrop: false
					});
					var params = {
						phone: $scope.phone.num,
						password: arg.pass
					}
					Account.modPass(params).then(function (data) {
						if (data.state == "ok") {
							$ionicLoading.show({
								template: '修改成功'
							});
							$timeout(function () {
								$ionicLoading.hide();
								$scope.why = "Login";
							}, 1500);
						} else {
							base.prompt($scope, data.reason);
						}
					}, function (resp) {

					})
				};

				/*
				登录
				 */
				$scope.signIn = function (arg) {
					$ionicLoading.show({
						template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
						showBackdrop: false
					});
					var result = Account.singIn(arg).then(function (data) {
						if (data) {
							$scope.logmodal.remove();
							$ionicLoading.hide();
							$scope.signed = true;
							$scope.accountInfoModal();
						} else {
							base.prompt($scope, "手机号或密码错误");
						}
					}, function (rep) {
						base.prompt($scope, '登陆超时');
					});
				}
			};


			$scope.collects = function () {
				if (Account.signed) {
					$timeout(function () {
						Account.takeCollects(false, "good").then(function (result) {
							$scope.collectGoods = result.length;
						});
						Account.takeCollects(false, "shop").then(function (result) {
							$scope.collectShops = result.length;
						});
					}, 1000);
				}
			}


			//验证是否已登录
			// $scope.varificationModel = function(arg, params) {
			//     if (!$scope.signed) {
			//         base.prompt($scope, "请先登陆");
			//         $scope.signOrReg();
			//     } else {
			//         $state.go(arg, params);
			//     }
			// }

			$scope.$on("$ionicView.enter", function () {
				//是否登录
				$scope.signed = Account.signined;
				$scope.signed ? $scope.accountInfoModal() : $scope.sinregModal();
				$scope.collects();
			});

			$scope.goWhered = false;
			$scope.$on("$ionicView.afterEnter", function () {
				if ($stateParams.where) {
					// $location.search("where", '');
					var where = $stateParams.where;
					$location.url($location.path());
					$timeout(function () {
						$scope.varificationModel(where, {});
					}, 50);
				}
				//console.log(Account.getUser());
			});
		}
	])

	//系统设置
	// .controller('settingCtrl', ["$scope", "$state", "$ionicPopup", "$ionicHistory", "Account",
	//         function($scope, $state, $ionicPopup, $ionicHistory, Account) {
	//             $scope.signOut = function() {
	//                 $ionicPopup.confirm({
	//                     title: "确定退出吗?",
	//                     cancelText: "取消",
	//                     cancelType: "button-light",
	//                     okText: "确定",
	//                     okType: "button-assertive"
	//                 }).then(function(res) {
	//                     if (res) {
	//                         Account.signOut();
	//                         $ionicHistory.goBack();
	//                     }
	//                 });
	//             }
	//         }
	//     ])
	//个人资料
	.controller('personalCtrl', ['$scope', '$rootScope', '$ionicPopup', '$ionicHistory', '$ionicLoading', '$ionicActionSheet', '$ionicModal', '$q', '$interval', 'Account', 'base',
		function ($scope, $rootScope, $ionicPopup, $ionicHistory, $ionicLoading, $ionicActionSheet, $ionicModal, $q, $interval, Account, base) {

			$scope.account = Account.getUser();
			$scope.headImg = "";
			if ($scope.account.headImg) {
				$scope.headImg = $scope.account.headImg;
			} else {
				$scope.headImg = "img/user_large.jpg";
			}
			console.log(JSON.stringify($scope.account));
			$scope.data_header = "";


			$scope.signOut = function () {
				$ionicPopup.confirm({
					title: "确定退出吗?",
					cancelText: "取消",
					cancelType: "button-light",
					okText: "确定",
					okType: "button-assertive"
				}).then(function (res) {
					if (res) {
						Account.signOut();
						$ionicHistory.goBack();
					}
				});
			};

			//修改头像
			$scope.changeHeader = function () {
				$ionicActionSheet.show({
					buttons: [
						{text: "拍照"},
						{text: "我的相册"}
					],
					cancelText: "取消",
					cancel: function () {
					},
					buttonClicked: function (index) {

						base.takePictures(index).then(function (imgData) {
							base.loading();
							let _base64 = imgData;
							$scope.data_header = "data:image/png;base64," + _base64;
							base.request("user/mapi/upload-head", 1, {
								"base64": _base64,
								"userId": Account.getUser().uuid
							}, true, 100000).then(function (data) {
								if (data.status == "success") {
									Account.reload().then(function () {
										base.loaded();
										base.prompt($scope, "修改头像成功");
									});
								} else {
									base.prompt($scope, "上传头像失败");
								}
							});

						}, function (err) {
							base.prompt($scope, "获取头像失败");
						});
						return true;
					}
				});
			};

			//修改手机号获取验证码
			$scope.valid = function () {
				$scope.againValText = "获取验证码";

				$scope.openModel("templates/personal-chphoneval.html").then(function (model) {
					model.show();

					$scope.takeValCode = function () {
						$ionicLoading.show({
							template: '<ion-spinner  class="spinner-dark" icon="ios"></ion-spinner>',
							showBackdrop: false
						});
						Account.sendCode($scope.account.usersphone, 2).then(function (data) {
							if (data.state == "ok") {
								$ionicLoading.hide();
								$scope.cpcode = data.reason;
								base.prompt($scope, "验证码已发送");
								$scope.againValNum = 60;
								$scope.againValText = "请等待(60)";
								var stop = $interval(function () {
									if ($scope.againValNum > 0) {
										$scope.againValNum--;
										$scope.againValText = "请等待(" + $scope.againValNum + ")";
									} else {
										$interval.cancel(stop);
										$scope.againValText = "重新发送";
									}
								}, 1000);
							} else {
								base.prompt($scope, data.reason);
							}
						}, function (resp) {
							base.prompt($scope, "error");
						});
					};

					$scope.validCode = function (arg) {
						if ($scope.cpcode == arg.code) {
							$scope.changePhone();
						} else {
							base.prompt($scope, '验证码错误');
						}
					};

					$scope.closeValModel = function () {
						model.hide();
					};

					$scope.$on('$destroy', function () {
						model.remove();
					});
				});
			};

			//修改手机号码
			$scope.changePhone = function () {
				$scope.openModel("templates/personal-change-phone.html").then(function (model) {
					$scope.againNPText = "获取验证码";
					model.show();

					$scope.chobj = {
						code: '',
						inCode: '',
						phone: ''
					};

					$scope.takeNPCode = function () {
						Account.sendCode($scope.account.usersphone, 3).then(function (data) {
							console.log(data);
							if (data.state == "ok") {
								$ionicLoading.hide();
								$scope.chobj.code = data.reason;
								base.prompt($scope, "验证码已发送");
								$scope.againNPNum = 60;
								$scope.againNPText = "请等待(60)";
								var stop = $interval(function () {
									if ($scope.againNPNum > 0) {
										$scope.againNPNum--;
										$scope.againNPText = "请等待(" + $scope.againNPNum + ")";
									} else {
										$interval.cancel(stop);
										$scope.againNPText = "重新发送";
									}
								}, 1000);
							} else {
								base.prompt($scope, data.reason);
							}
						}, function (resp) {
							base.prompt($scope, "error");
						});
					};

					$scope.closeNPModel = function () {
						model.hide();
					};

					$scope.savePhone = function () {
						if ($scope.chobj.code != $scope.chobj.inCode) {
							$scope.prompt('验证码错误');
						} else {
							var params = {
								userphone: $scope.chobj.phone
							}
							Account.updateUser(params).then(function (data) {
								base.prompt($scope, data.reason);
							}, function (resp) {
								base.prompt($scope, "error");
							});
							$scope.account.userphone = $scope.chobj.phone;
							model.hide();
							$scope.closeValModel();
						}
					};

					$scope.$on('$destroy', function () {
						model.remove();
					});
				})
			};

			//修改邮箱
			$scope.changeEmail = function () {
				$scope.openModel("templates/personal-change-email.html").then(function (model) {
					model.show();

					$scope.saveEmail = function (arg) {
						Account.updateUser(arg, $scope.account.usersid).then(function (data) {
							base.prompt($scope, "修改邮箱成功");
							//console.log(JSON.stringify($scope.account));
							$scope.account.usersemail = arg.email;
							Account.storeUser($scope.account);
						}, function (resp) {
							base.prompt($scope, "error");
						});
						model.hide();
					};

					$scope.closeEmailModel = function () {
						model.hide();
					}
				})
			};

			//修改出生日期
			$scope.chooseBirthday = function () {
				var date = undefined,
					birday = undefined;
				if ($scope.account.userbirthday != null && $scope.account.userbirthday != "") {
					birday = $scope.account.userbirthday.split("-");
					date = new Date(parseInt(birday[0]), parseInt(birday[1]), parseInt(birday[2]));
				}
				Account.chooseDate(date).then(function (_date) {
					var bir = _date.getFullYear() + "-" + (_date.getMonth() + 1) + "-" + _date.getDate();
					$scope.account.userbirthday = bir;
					var params = {
						userbirthday: bir
					}
					Account.updateUser(params).then(function (data) {
						base.prompt($scope, data.reason);
					}, function (resp) {
						base.prompt($scope, "error");
					});
				});
			};

			$scope.openModel = function (file) {
				var defer = $q.defer();
				$ionicModal.fromTemplateUrl(file, {
					scope: $scope,
					animation: 'animated slideInRight'
				}).then(function (model) {
					defer.resolve(model);
				});
				return defer.promise;
			};

		}
	])
	//收货地址
	.controller('addrCtrl', ["$scope", "$rootScope", "$state", "$ionicLoading", "$ionicTabsDelegate", "$ionicPopup", "Account", "base",
		function ($scope, $rootScope, $state, $ionicLoading, $ionicTabsDelegate, $ionicPopup, Account, base) {
			$scope.noaddr = false;

			//加载所有地址
			$scope.loadAddrs = function () {
				$ionicLoading.show({
					template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
					showBackdrop: false
				});
				Account.takeAddrs()
					.then(function (data) {
						if (data.state == "ok") {
							var _addr = [];
							angular.forEach(data.data, function (obj, inx) {
								obj.isdefault = (obj.isdefault == "true" ? true : false);
								_addr.push(obj);
							})
							$scope.addrs = _addr;

						} else {
							$scope.noaddr = true;
							$scope.prompt = data.reason;
							$scope.addrs = new Array();
						}
					}, function () {
						base.prompt($scope, 'error');
					})
					.finally(function () {
						$ionicLoading.hide();
					});
			};

			//默认地址
			$scope.swipeDefault = function (item, _default) {
				angular.forEach($scope.addrs, function (obj, inx) {
					obj.isdefault = false;
				});
				item.isdefault = true;
				var params = {
					id: item.id,
					isdefault: true
				}
				$ionicLoading.show({
					template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
					showBackdrop: false
				});
				Account.addressAction(params, 'upd').then(function (data) {
					$ionicLoading.hide();
					if (data.state != "ok") {
						base.prompt("请稍后再试!");
					}
				}, function () {
					base.prompt("error");
				});
			};

			//编辑
			$scope.updAddr = function (item) {
				$scope.showBar = false;
				var _addr = angular.toJson(item);
				$state.go("tab.setting-addrconfig", {action: 'upd', addr: _addr});
			};

			//删除
			$scope.delAddr = function (item) {
				$ionicPopup.confirm({
					title: "确定删除该收货人吗?",
					cancelText: "取消",
					cancelType: "button-light",
					okText: "确定",
					okType: "button-assertive"
				}).then(function (res) {
					if (res) {
						$ionicLoading.show({
							template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
							showBackdrop: false
						});
						Account.delAddress(item)
							.then(function (data) {
								if (data.state == "ok") {
									$scope.loadAddrs();
								}
								base.prompt($scope, "删除地址");
							}, function (resp) {
								base.prompt($scope, "error");
							});
					}
				})

			};

			//新建地址
			$scope.goNewAddr = function () {
				$scope.showBar = false;
				$state.go("tab.setting-addrconfig", {action: 'add'});
			};

			//格式化手机
			$scope.formatPhone = function (phone) {
				return base.formatPhone(phone);
			};

			$scope.$on("$ionicView.enter", function () {
				$scope.loadAddrs();
			});
		}
	])
	//新建收货人
	.controller('nowAddrCtrl', ["$scope", "$rootScope", "$stateParams", "$ionicHistory", "$ionicLoading", "$ionicPopup", "$ionicTabsDelegate", "$ionicNavBarDelegate", "$ionicSlideBoxDelegate", "$timeout", "Account",
		function ($scope, $rootScope, $stateParams, $ionicHistory, $ionicLoading, $ionicPopup, $ionicTabsDelegate, $ionicNavBarDelegate, $ionicSlideBoxDelegate, $timeout, Account) {

			$scope.caconfig = {
				cardinal: 18,
				increment: 37.5,
				levelpg: {transform: "translate3d(18px, 0px, 0px) scale(1)"},
				_prov: null,
				_city: null,
				_area: null,
				showArea: ""
			};

			$scope.addr = {
				name: '',
				tel: '',
				provience: '',
				city: '',
				area: '',
				address: '',
				zipcode: '',
				isdefault: false
			};

			$scope.regexp = {
				phone: /^1[3|4|5|7|8][0-9]{9}$/
			};

			//是否正在选择收货地址
			$scope.chooseBack = "ws-choose-back-leave";
			$scope.chooseAddress = "ar-area-animate-leave";

			//打开电话联系人
			$scope.openContacts = function () {
				Account.chooseContact().then(function (contcat) {
					$scope.addr.name = contcat.displayName;
					if (contcat.phones.length == 0) {
						base.prompt($scope, "该联系人无手机号码");
					} else {
						$scope.addr.tel = contcat.phones[0];
					}
				});
			};

			/**
			 * 获取省市区
			 * @param  {[type]}   code  [父级编码]
			 * @param  {[type]}   level [追加数据到下一级别, 0:省, 1: 市 , 2: 县区]
			 * @param  {Function} next  [是否自动进入下级]
			 * @return {[type]}         [description]
			 */
			$scope.getarea = function (code, level, next) {
				var tl = (level == 0 ? '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>' : '<ion-spinner class="spinner-light" icon="ios"></ion-spinner>');
				$ionicLoading.show({
					template: tl,
					showBackdrop: false
				});
				Account.takeArea(code).then(function (data) {
					if (data) {
						switch (level) {
							case 0:
								$scope.caconfig._prov = data;
								break;
							case 1:
								$scope.caconfig._city = data;
								break;
							case 2:
								$scope.caconfig._area = data;
								break;
						}
						$ionicSlideBoxDelegate.update();
						if (next) {
							$timeout(function () {
								$ionicSlideBoxDelegate.next(300);
							}, 300);
						}
					} else {
						$scope.addr.area = "全区";
						$scope.close();
					}
				}, function (resp) {
					base.prompt($scope, "error");
				}).finally(function () {
					$ionicLoading.hide();
				});
			};


			$scope.choosedArea = function (item, forLevel) {
				switch (forLevel) {
					case 1:
						$scope.caconfig._city = null;
						$scope.caconfig._area = null;
						$scope.addr.city = "";
						$scope.addr.area = "";
						$scope.addr.provience = item.name;
						break;
					case 2:
						$scope.caconfig._area = null;
						$scope.addr.area = "";
						$scope.addr.city = item.name;
						break;
					default:
						$scope.addr.area = item.name;
						$scope.close();
						break;
				}
				if (forLevel > 0) {
					$scope.getarea(item.id, forLevel, true);
				}
			};

			$scope.areaSlideChange = function (inx) {
				$scope.switchChoosePanel(inx);
			};

			$scope.chooseAddr = function () {
				$scope.chooseBack = "ws-choose-back-enter";
				$scope.chooseAddress = "ar-area-animate-enter";
				// $ionicNavBarDelegate.showBar(false);
				$ionicSlideBoxDelegate.update();
			};
			$scope.close = function () {
				$scope.chooseBack = "ws-choose-back-leave";
				$scope.chooseAddress = "ar-area-animate-leave";
				// $ionicNavBarDelegate.showBar(true);
			};

			$scope._provience = function () {
				$ionicSlideBoxDelegate.slide(0, 300);
				$scope.switchChoosePanel(0);
			};

			$scope._city = function () {
				$ionicSlideBoxDelegate.slide(1, 300);
				$scope.switchChoosePanel(1);
			};

			$scope._area = function () {
				$ionicSlideBoxDelegate.slide(2, 300);
				$scope.switchChoosePanel(2);
			};

			$scope.switchChoosePanel = function (inx) {
				var aims = $scope.caconfig.cardinal + $scope.caconfig.increment * inx;
				$scope.caconfig.levelpg = {
					transform: "translate3d(" + aims + "px, 0px, 0px) scale(1)",
					"transition-duration": "300ms"
				};
			};

			//保存新地址数据
			$scope.subaddr = function () {
				$ionicLoading.show({
					template: '<ion-spinner icon="ios"></ion-spinner>',
					showBackdrop: false
				});

				Account.addressAction($scope.addr, $stateParams.action)
					.then(function (data) {
						if (data.state == "ok") {
							$ionicLoading.show({
								template: '<div style="background: rgba(0,0,0,0.6); width: 88px; border-radius: 6px; height: 40px; line-height: 40px;">' + data.reason + '</div>',
								showBackdrop: false
							});

							$timeout(function () {
								$ionicLoading.hide();
								$ionicHistory.goBack();
							}, 1500);
						} else {
							base.prompt($scope, data.reason);
						}
					}, function () {
						base.prompt($scope, "error");
					});
			};

			$scope.$on("$ionicView.enter", function () {
				$scope.getarea(0, 0, false);
			});
			$scope.$on("$ionicView.afterEnter", function () {
				if ($stateParams.action == "upd") {
					$scope.addr = angular.fromJson($stateParams.addr);
				}
			});
		}
	])

	/****************************访美团*****************************/
	//我的订单
	.controller('myorderCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$timeout', '$window', '$ionicTabsDelegate', '$ionicSlideBoxDelegate', '$ionicScrollDelegate', '$ionicLoading', '$ionicPopup', 'Account', 'Cart', 'base',
		function ($scope, $rootScope, $state, $stateParams, $timeout, $window, $ionicTabsDelegate, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicLoading, $ionicPopup, Account, Cart, base) {
			$scope.curActive = undefined;
			$scope.myOrders = {
				//全部
				all: {
					//当前加载页面索引
					curInx: 1,
					//是否有更多数据, 当加载数据条数大于10则继续加载, 默认为禁止页面主动加载, 首次进入由程序加载数据
					allowLoadMore: false,
					//存储订单数据
					os: new Array(),
					//当点击订单分类时是否自动加载数据,首次进入时主动加载
					autoLoad: true,
					//是否由页面检测加载数据
					formPageLoad: false,
				},
				//待付款
				waitPay: {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				},
				//待发货
				waitConsume: {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				},
				//待收货
				consumed: {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				},
				//已完成
				refunded: {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				}
			};

			/**
			 * 切换订单面板
			 * @param  {[type]} inx [description]
			 * @return {[type]}     [description]
			 */
			$scope.switchPanel = function (status) {
				$scope.curStu = status;
				var inx = undefined;
				switch (status) {
					case 'all':
						inx = 0;
						$scope.curActive = $scope.myOrders.all;
						break;
					case 'waitPay':
						inx = 1;
						$scope.curActive = $scope.myOrders.waitPay;
						break;
					case 'waitConsume':
						inx = 2;
						$scope.curActive = $scope.myOrders.waitConsume;
						break;
					case 'consumed':
						inx = 3;
						$scope.curActive = $scope.myOrders.consumed;
						break;
					case 'refunded':
						inx = 4;
						$scope.curActive = $scope.myOrders.refunded;
						break;
				}

				$ionicSlideBoxDelegate.slide(inx, 300);
				var to = $window.innerWidth * ((20 * inx) / 100);
				$scope.switchWhere = {
					transform: "translate3d(" + to + "px, 0px, 0px) scale(1)",
					"transition-duration": "300ms"
				};

				if (!($scope.curActive && $scope.curActive.autoLoad)) {
					return false;
				} else {
					$ionicLoading.show({
						template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
						showBackdrop: false
					});
				}
				$scope.loadMore($scope.curStu, true);


			};

			$scope.loadMore = function (status, allowLoad) {
				if (!allowLoad) {
					return false;
				}
				let params = {
					user: Account.getUser().uuid,
					status: status,
					page: $scope.curActive.curInx
				};
				base.request("order/mapi/list", 1, params).then(function (result) {
					switch (status) {
						case 'all':
							$scope.handleAll(result.list);
							break;
						case 'waitPay':
							$scope.handleWaitPay(result.list);
							break;
						case 'waitConsume':
							$scope.handleWaitSent(result.list);
							break;
						case 'consumed':
							$scope.handleWaitTake(result.list);
							break;
						case 'refunded':
							$scope.handleRefunded(result.list);
							break;
					}
					$ionicLoading.hide();
				});
			};

			$scope.handleAll = function (data) {
				if (data.length < 20) {
					$scope.myOrders.all.allowLoadMore = false;
				} else {
					$scope.myOrders.all.allowLoadMore = true;
				}
				$scope.myOrders.all.os = $scope.myOrders.all.os.concat(data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.myOrders.all.curInx++;
				$scope.myOrders.all.formPageLoad = true;
				$scope.myOrders.all.autoLoad = false;
				console.log(data);
			};

			$scope.handleWaitPay = function (data) {
				if (data.length < 20) {
					$scope.myOrders.waitPay.allowLoadMore = false;
				} else {
					$scope.myOrders.waitPay.allowLoadMore = true;
				}
				$scope.myOrders.waitPay.os = $scope.myOrders.waitPay.os.concat(data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.myOrders.waitPay.curInx++;
				$scope.myOrders.waitPay.formPageLoad = true;
				$scope.myOrders.waitPay.autoLoad = false;
				console.log(data);
			};

			$scope.handleWaitSent = function (data) {
				if (data.length < 20) {
					$scope.myOrders.waitConsume.allowLoadMore = false;
				} else {
					$scope.myOrders.waitConsume.allowLoadMore = true;
				}
				$scope.myOrders.waitConsume.os = $scope.myOrders.waitConsume.os.concat(data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.myOrders.waitConsume.curInx++;
				$scope.myOrders.waitConsume.formPageLoad = true;
				$scope.myOrders.waitConsume.autoLoad = false;
				console.log(data);
			};

			$scope.handleWaitTake = function (data) {
				if (data.length < 20) {
					$scope.myOrders.consumed.allowLoadMore = false;
				} else {
					$scope.myOrders.consumed.allowLoadMore = true;
				}
				$scope.myOrders.consumed.os = $scope.myOrders.consumed.os.concat(data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.myOrders.consumed.curInx++;
				$scope.myOrders.consumed.formPageLoad = true;
				$scope.myOrders.consumed.autoLoad = false;
				console.log(data);
			};

			$scope.handleRefunded = function (data) {
				if (data.length < 20) {
					$scope.myOrders.refunded.allowLoadMore = false;
				} else {
					$scope.myOrders.refunded.allowLoadMore = true;
				}
				$scope.myOrders.refunded.os = $scope.myOrders.refunded.os.concat(data);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.myOrders.refunded.curInx++;
				$scope.myOrders.refunded.formPageLoad = true;
				$scope.myOrders.refunded.autoLoad = false;
				console.log(data);
			};

			/**
			 * 点击我的订单中的付款进入提交订单
			 * @param  {[type]} data [description]
			 * @param  {[type]} on   [description]
			 * @return {[type]}      [description]
			 */
			$scope.gopay = function (data) {
				$state.go($stateParams.backWhere + "-shop-pro-pay", {
					backWhere: $stateParams.backWhere,
					order: angular.toJson(data)
				});
			};

			$scope.reset_all = function () {
				$scope.myOrders.all = {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				}
			};
			$scope.reset_waitPay = function () {
				$scope.myOrders.waitPay = {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				}
			};
			$scope.reset_waitConsume = function () {
				$scope.myOrders.waitConsume = {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				}
			};
			$scope.reset_consumed = function () {
				$scope.myOrders.consumed = {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				}
			};
			$scope.reset_refunded = function () {
				$scope.myOrders.refunded = {
					curInx: 1,
					allowLoadMore: false,
					os: new Array(),
					autoLoad: true,
					formPageLoad: false,
				}
			};

			/**
			 * 删除订单
			 * @param  {[type]} order_num [订单编号]
			 * @param  {[type]} inx       [订单索引]
			 * @return {[type]}           [description]
			 */
			$scope.delOrder = function (order, inx) {
				$ionicPopup.confirm({
					title: '确定删除吗?',
					cancelText: "取消",
					cancelType: "button-light",
					okText: "确定",
					okType: "button-assertive"
				}).then(function (res) {
					if (res) {
						let params = {"order": order.uuid, "user": Account.getUser().uuid};
						base.request("order/mapi/del", 1, params).then(function (result) {
							if (result === "success") {
								switch ($scope.curStu) {
									case 'all':
										$scope.reset_waitPay();
										$scope.reset_refunded();
										$scope.myOrders.all.os.splice(inx, 1);
										break;
									case 'waitPay':
										$scope.reset_all();
										$scope.reset_refunded();
										$scope.myOrders.waitPay.os.splice(inx, 1);
										break;
									case 'consumed':
										$scope.reset_all();
										$scope.reset_waitPay();
										$scope.myOrders.refunded.os.splice(inx, 1);
										break;
								}
							} else {
								base.prompt($scope, "删除失败，请稍后重试");
							}
							$ionicScrollDelegate.resize();
						});
					}
				});
			};

			/**
			 * [收货]
			 * @param  {[type]} order_num [订单编号]
			 * @param  {[type]} opd_id    [订单商品ID]
			 * @return {[type]}           [description]
			 */
			$scope.takePd = function (order_num, opd_id) {
				var handleTakePd = function (data) {
					angular.forEach(data, function (sen, inx) {
						if (sen.ordernumber == order_num) {
							angular.forEach(sen.prodecut, function (pdSen, pdInx) {
								if (pdSen.productid == opd_id) {
									sen.prodecut.splice(pdInx, 1);
									return false;
								}
							})
							if (sen.prodecut.length == 0) {
								data.splice(inx, 1);
							}
							return false;
						}
					})
				};
				$ionicPopup.confirm({
					title: '确定收货吗?',
					cancelText: "取消",
					cancelType: "button-light",
					okText: "确定",
					okType: "button-assertive"
				}).then(function (res) {
					if (res) {
						$ionicLoading.show({
							template: '<ion-spinner class="spinner-dark" icon="ios"></ion-spinner>',
							showBackdrop: false
						});
						Cart.takePd(order_num, opd_id).then(function (result) {
							console.log(result);
							if (result) {
								switch ($scope.curLev) {
									case 0:
										handleTakePd($scope.myOrders.all.os);
										$scope.reset_consumed();
										$scope.reset_refunded();
										break;
									case 3:
										handleTakePd($scope.myOrders.consumed.os);
										$scope.reset_all();
										$scope.reset_refunded();
										break;
								}
								$ionicScrollDelegate.resize();
								$ionicLoading.hide();
							}
						});
					}
				});
			};

			$scope.firstLoad = true;
			$scope.$on("$ionicView.enter", function () {
				if ($scope.firstLoad) {
					$scope.scroll = {
						height: $window.innerHeight - (36 + 44) + "px"
					};
					$scope.reset_all();
					$scope.reset_waitPay();
					$scope.reset_waitConsume();
					$scope.reset_consumed();
					$scope.reset_refunded();
					$scope.switchPanel($stateParams.status);
					$ionicSlideBoxDelegate.enableSlide(false);
					$scope.firstLoad = false;
				}
			});


			$rootScope.$on("orderReload", function (event, data) {
				$scope.reset_all();
				$scope.reset_waitPay();
				$scope.reset_waitConsume();
				$scope.reset_consumed();
				$scope.reset_refunded();
				$scope.loadMore(data, true);
			})
		}
	])
	//我的收益
	// .controller('myincomeCtrl', ['$scope', '$state', 'Account', 'base',
	// 	function ($scope, $state, Account, base) {
	// 		$scope.user = Account.getUser();
	// 		$scope.user._amount = undefined;
	// 		console.log(JSON.stringify($scope.user));
	// 		$scope._wdform = function (userWithdraw) {
	// 			var sender = {
	// 				'user.usersZhenshiname': userWithdraw.userszhenshiname,
	// 				'user.usersBankcard': userWithdraw.default4,
	// 				'user.usersBankaddress': userWithdraw.usersbankaddress,
	// 				'fs.amount': userWithdraw._amount,
	// 				'user.usersId': $scope.user.usersid
	// 			};
	// 			base.request("uswithdraw", sender).then(function (data) {
	// 				console.log(data);
	// 				if (data.state == "ok") {
	// 					Account.reload().then(function (reg) {
	// 						$scope.user = reg;
	// 						base.prompt($scope, data.reason);
	// 					});
	// 				} else {
	// 					base.prompt($scope, "提现申请失败")
	// 				}
	// 			});
	// 		};
	// 		//跳转到提现记录页面
	// 		$scope.getrecord = function () {
	// 			$state.go('tab.account-myrecord');
	// 		}
	// 	}
	// ])
	// //提现记录
	// .controller('myrecordCtrl', ['$scope', 'Account', 'base',
	// 	function ($scope, Account, base) {
	// 		$scope.user = Account.getUser();
	// 		$scope.loadMore = function () {
	// 			base.request('usgainuserwd', {'userid': $scope.user.usersid}).then(function (data) {
	// 				$scope.moreDataCanBeLoaded = true;
	// 				$scope.define = false;
	// 				$scope.details = [];
	//
	// 				if (data && data.state === "ok" && data.data.length > 0) {
	// 					if (data.data.length < 20) {
	// 						$scope.moreDataCanBeLoaded = false;
	// 						$scope.define = "已全部加载";
	// 					}
	// 					for (var i = 0; i < data.data.length; i++) {
	// 						$scope.details.push(data.data[i]);
	// 					}
	// 				} else {
	// 					$scope.define = data.reason;
	// 					$scope.moreDataCanBeLoaded = false;
	// 				}
	// 				$scope.$broadcast('scroll.infiniteScrollComplete');
	// 			});
	// 		};
	// 		$scope.loadMore();
	//
	// 		$scope.splitDate = function (arg) {
	// 			return arg.split(" ");
	// 		};
	//
	// 		$scope.failStyle = function (status) {
	// 			if (status == "已拒绝") {
	// 				return {color: '#FC5757', 'text-decoration': 'underline'};
	// 			} else if (status == "已审核") {
	// 				return {color: '#08AE23'};
	// 			} else {
	// 				return {color: '#4C4C4C'};
	// 			}
	// 		};
	//
	// 		$scope.failReason = function (status, reason) {
	// 			if (status == "已拒绝") {
	// 				if (!reason) {
	// 					reason = "无反馈信息";
	// 				}
	// 				base.alert($scope, "提示", reason);
	// 			}
	// 		}
	// 	}
	// ])
	// 我的优惠卷
	.controller('couponsCtrl', ['$scope', "Account", "base", function ($scope, Account, base) {
		Account.takeCoupons().then(function (data) {
			$scope.items = new Array();

			let params = {
				user: Account.getUser().uuid,
				shopId: '',
				cate: '',
				good: ''
			};

			var insert_flg = function (str, flg, sn) {
				var newstr = "", mark = flg;
				if(sn == 0) {
					sn = 1;
				}
				for (var i = 0; i < str.length; i += sn) {
					if(i == sn) {
						mark = "";
					}
					var tmp = str.substring(i, i + sn);
					newstr += tmp + mark;
				}
				return newstr;
			}

			$scope.loadCoupons = function () {

				base.request("usercoupon/mapi/list", 1, params).then(function (result) {
					for (var i = 0; i < result.length; i++) {
						switch (result[i].coupon.rule) {
							case "recoupon":
								result[i].coupon.ruleValue = "劵";
								result[i].coupon.ruleText = "返 券";
								break;
							case "discount":
								result[i].coupon.ruleValue = insert_flg(result[i].coupon.ruleValue, ".", 1);
								result[i].coupon.ruleText = "折 扣";
								break;
							case "fulldown":
								result[i].coupon.ruleMark = "¥";
								result[i].coupon.ruleText = "满 减";
								break;
						}
						if (result[i].coupon.endTime == "forever") {
							result[i].coupon.timeLine = "永久有效";
						} else {
							let start = result[i].coupon.startTime.replace("-", ".");
							let end = result[i].coupon.endTime.replace("-", ".");
							result[i].coupon.timeLine = start + "-" + end;
						}

						$scope.items.push(result[i]);
					}
					console.log(angular.toJson($scope.items));
				});
			}

			$scope.loadCoupons();
			$scope.$on("$ionicView.enter", function () {

			});
		});
	}])
	.controller('collectCtrl', ['$scope', '$stateParams', '$timeout', "Account", 'base', function ($scope, $stateParams, $timeout, Account, base) {

		$scope.moreDataCanBeLoaded = false;

		$scope.getCollects = function (refresh) {
			Account.takeCollects(refresh, $stateParams.type).then(function (result) {
				$scope.items = result;
				$scope.$broadcast('scroll.refreshComplete');

				$timeout(function () {
					$scope.moreDataCanBeLoaded = true;
				}, 300);
			});
		};

		$scope.doRefresh = function () {
			$scope.getCollects(true);
			$scope.refreshData = false;
		};

		$scope.refreshData = false;

		$scope.del = function (item) {
			base.request('collect/mapi/del', 1, {"key": item.uuid}).then(function (result) {
				if (result === "success") {
					base.prompt($scope, "删除成功");
					let inx = $scope.items.indexOf(item);
					$scope.items.splice(inx, 1);
					$scope.refreshData = true;
				} else {
					base.prompt($scope, "删除失败");
				}
			});
		};

		$scope.firstLoad = true;
		$scope.$on("$ionicView.enter", function () {
			if ($scope.firstLoad) {
				$scope.getCollects(false);
			}
		});
		$scope.$on("$ionicView.leave", function () {
			if ($scope.refreshData) {
				Account.takeCollects(true, $stateParams.type);
			}
		});
	}])
	//我的足迹
	.controller('footPrintsCtrl', ['$scope', 'Account', 'base', function ($scope, Account, base) {

		$scope.inx = 1;
		$scope.moreDataCanBeLoaded = true;
		$scope.sender = {
			items: new Array()
		};
		$scope.loadMore = function () {
			let params = {"user": Account.getUser().uuid, "offset": $scope.inx};
			base.request('userfoot/mapi/list', 1, params).then(function (result) {
				if (result.length < 20) {
					$scope.moreDataCanBeLoaded = false;
				}
				$scope.sender.items = $scope.sender.items.concat(result);
				$scope.inx += 1;
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		};

		$scope.refreshData = false;

		$scope.del = function (item) {
			base.request('collect/mapi/del', 1, {"key": item.uuid}).then(function (result) {
				if (result === "success") {
					base.prompt($scope, "删除成功");
					let inx = $scope.items.indexOf(item);
					$scope.items.splice(inx, 1);
					$scope.refreshData = true;
				} else {
					base.prompt($scope, "删除失败");
				}
			});
		};
	}])
	//我的二维码
	.controller('qrCodeCtrl', ['$scope', 'Account', 'base', function ($scope, Account, base) {

		$scope.load = function () {
			base.loading();

			base.request('usmycode', {userid: Account.getUser().usersid}).then(function (data) {
				$scope.qrcode = data.url;
				base.loaded();
			})
		};
		$scope.$on("$ionicView.enter", function () {
			// $scope.shop = Account.getUser().shop;
			$scope.load();
		});
	}]);
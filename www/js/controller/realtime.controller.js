angular.module("realtime.controller", ["ionic"])
	.controller('realtimeCtrl', ["$scope", "$rootScope", "$state", "$ionicScrollDelegate", "$ionicTabsDelegate", "$ionicSlideBoxDelegate", "$timeout", "$interval", "$window", "base", "RealTime", "Account",
		function ($scope, $rootScope, $state, $ionicScrollDelegate, $ionicTabsDelegate, $ionicSlideBoxDelegate, $timeout, $interval, $window, base, RealTime, Account) {


			$scope.loadAd = function () {
				base.request("ad/mapi/loadAds", 0, {position: "monitorHomeTop"}).then(function (data) {
					$scope.monitorAdvs = data;
					var slider_width = document.querySelectorAll(".merchant .ad-slider")[0].clientWidth;
					var slider_height = slider_width / 5 * 2.5;
					$scope.slider_img_style = {"width": "100%", "height": slider_height + "px"};
					$ionicSlideBoxDelegate.$getByHandle("monitorAdvs").loop(true);
					$ionicSlideBoxDelegate.$getByHandle("monitorAdvs").update();
				});
			}

			$scope.slideChanged = function (index) {
				$scope.slideIndex = index;
				if (($ionicSlideBoxDelegate.count() - 1 ) == index) {
					$timeout(function () {
						$ionicSlideBoxDelegate.slide(0);
					}, 3000);
				}
			};


			/**
			 * 监控视频
			 * @type {Array}
			 */
			$scope.tasks = new Array();
			$scope.loading = true;
			$scope.dotsHide = true;
			$scope.loadMonitoring = function (array, id, _depth) {
				var next_addr = null;
				switch (_depth) {
					case 0:
						next_addr = "app/L0/";
						break;
					case 1:
						next_addr = "app/L1/";
						break;
					case 2:
						next_addr = "app/Camera/";
						break;
					default:
						$scope.loading = false;
						return false;
				}
				base.request(next_addr + id, 2, {}, false).then(function (resp) {
					for (var i = 0; i < resp.length; i++) {
						resp[i].tree = new Array();
						resp[i].depth = _depth;
						resp[i].collapsed = true;

						if (_depth == 2) {
							resp[i].trigger = function (item) {
								$scope.videoPrepare(item);
							};
						}
						array.push(resp[i]);
						$scope.loadMonitoring(resp[i].tree, resp[i].Id, resp[i].depth + 1);
					}
				}, function (resp) {
					$scope.dotsHide = false;
				});
			}


			$scope.timer1Hz = null;
			$scope._curVID = 0;
			/**
			 * 通知监控准备
			 * @param item
			 */
			$scope.videoPrepare = function (item) {
				if(!Account.signined) {
					base.prompt($scope, "请先登录");
					return false;
				}
				$scope._curVID = item.Id;
				base.request("app/Prepare/" + item.Id, 2, {}, true, 3000).then(function (result) {
					if (result.ok) {
						// var url = "http://" + item.IP + ":8000/" + item.app + "/" + item.Id + "/index.m3u8";
						console.log(result.url);
						$scope.timer1Hz = $interval($scope.keepAlive, 20000);
						$scope.play(result.url);
					} else {
						$ionicPopup.alert({
							title: '打开视频失败',
							template: '请稍后再试或联系客服人员。',
							okType: 'button-balanced'
						});
					}

				}, function(response) {
					if(response == -1) {
						base.prompt($scope, "视频拉取失败");
					}
				})
			};

			/**
			 * 播放监控
			 * @param url
			 */
			$scope.play = function (videoUrl) {
				var options = {
					successCallback: function () {
						//alert("Video was closed without error.");
						$scope.endPlay();
						$scope._curVID = 0;
					},
					errorCallback: function (errMsg) {
						$scope.endPlay();
						$scope._curVID = 0;
					},
					orientation: 'landscape'
				};
				window.plugins.streamingMedia.playVideo(videoUrl, options);
			}

			$scope.endPlay = function () {
				if (timer1Hz != null) {
					$interval.cancel(timer1Hz);
					timer1Hz = null;
				}
				base.request("app/Disconnect/" + $scope._curVID, 2, {}).then(
					function () {
					},
					function (err) {
					}
				);
			}

			/**
			 * 不知道干啥用的
			 */
			$scope.keepAlive = function () {
				console.log('keepAlive ' + $scope._curVID);
				if ($scope._curVID > 0) {
					base.request("app/Alive/" + $scope._curVID, 2, {}).then(function () {
					}, function (err) {
					});
				}
			}


			$scope.firstEnter = true;
			$scope.$on("$ionicView.enter", function () {
				if ($scope.firstEnter) {
					$scope.contentStyle = {
						height: $window.innerHeight - (44 + 50) + "px"
					}
					$scope.loadAd();
					$scope.loadMonitoring($scope.tasks, "", 0, 0);
					$scope.firstEnter = false;
				}
			});

			$scope.$on("$destroy", function () {
				if (timer1Hz != null) {
					console.log('$destroy kill');
					$interval.cancel(timer1Hz);
					timer1Hz = null;
				}
				else {
					console.log('$destroy null');
				}
			})
		}
	]);

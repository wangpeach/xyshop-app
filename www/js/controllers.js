angular.module('starter.controllers', ["ionic", "home.controller", "realtime.controller", "cart.controller", "account.controller", "products.controller"])
    .controller('baseCtrl', ["$rootScope", "$cordovaInAppBrowser", "$state", "$scope", "$sce", "$timeout", "base", "Account",
    function ($rootScope, $cordovaInAppBrowser, $state, $scope, $sce, $timeout, base, Account) {

        $rootScope.regexp = {
            username: /[^\u4e00-\u9fa5]/g,
            email: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
            useridcard: /^[1-9][0-9]{5}(19[0-9]{2}|200[0-9]|2010)(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[0-9]{3}[0-9xX]$/,
            phone: /^1[3|4|5|7|8][0-9]{9}$/
        };

        /**
         * 处理广告信息
         */
        $rootScope.handleAd = function (ad) {
            if (ad.type === "innerUrl") {
                handleInnerAd(ad);
            } else if (ad.type === "simpleGoods") {
                base.loading();
                base.request("goods/mapi/only", 1, { shop: ad.gotoInfo }).then(function (resp) {
                    base.loaded();
                    $state.go("tab.home-shop-pro-details", { backWhere: 'tab.home', good: angular.toJson(resp) });
                });
            } else {
                $ionicPlatform.ready(function () {
                    $cordovaInAppBrowser.open(ad.gotoInfo, '_system', options)
                        .catch(function (event) {
                            // error
                            that.prompt("系统错误..");
                        });
                });
            }
            base.request("ad/mapi/hits", 0, { key: ad.uuid });
            // 奖励金
            if (!ad.browsed) {
                let user = Account.getUser();
                base.request("user/mapi/coin-reward", 1, { "user": user.uuid, "ad": ad.uuid }).then(function (resp) {
                    if (resp.code === 0) {
                        ad.browsed = true;
                        user.coin = resp.data;
                        Account.storeUser(user);
                    }
                });
            }
        };


        var handleInnerAd = function (ad) {
            $scope.ads = ad;

            base.openModal($scope, "templates/ad.html", "slideInRight").then(function (modal) {
                modal.show();
                $scope.adModal = modal;

                //获取商品图文详情
                if(ad.gotoInfo) {
                    base.get(ad.gotoInfo, 0, {}).then(function (resp) {
                        $scope.adsDetail = $sce.trustAsHtml(resp);
                    });
                }

                // 视频
                if (ad.videoType == "inner") {
                    $scope.readyed = false;
                    $scope.ads.videoInfo = angular.fromJson(ad.videoInfo);

                    let playerId = "_" + Math.round(Math.random() * 100000000);
                    $scope.videoHtml = $sce.trustAsHtml('<video id="' + playerId +'" class="video-js vjs-sublime-skin" poster="' + $scope.ads.videoInfo.imgShow + '" controls><source src="' + $scope.ads.videoInfo.videoShow + '"></source><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to aweb browser that<a href="http://videojs.com/html5-video-support/" target="_blank">无法播放</a></p></video>');

                    $timeout(function () {

                        let player = videojs(playerId, {
                            width: angular.element(document.querySelector(".ad-video"))[0].clientWidth
                        }).ready(function() {
                            // angular.element(document.querySelector(".video-js"))[0].style.display = "block";
                            console.log(this);
                        });

                    }, 100);

                } else if (ad.videoType == "outer") {
                    $scope.videoHtml = $sce.trustAsHtml($scope.ads.videoInfo);
                }
            });

            $scope.$on("modal.hidden", function() {
                $scope.ads = null;
                $scope.videoHtml = null;

                $timeout(function() {
                    $scope.adModal.remove();
                }, 1000);
            })
        }
    }])

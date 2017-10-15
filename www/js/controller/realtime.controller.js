angular.module("realtime.controller", ["ionic"])
    .controller('realtimeCtrl', ["$scope", "$rootScope", "$state", "$ionicScrollDelegate", "$ionicTabsDelegate", "$ionicSlideBoxDelegate", "$timeout", "$window", "base", "RealTime",
        function($scope, $rootScope, $state, $ionicScrollDelegate, $ionicTabsDelegate, $ionicSlideBoxDelegate, $timeout, $window, base, RealTime) {


            $scope.loadAd = function() {
                base.request("ad/mapi/loadAds", 0, { position: "monitorHomeTop" }).then(function(data) {
                    $scope.advs = data;
                    $ionicSlideBoxDelegate.update();
                });
            }
            $scope.loadAd();

            $scope.tasks = new Array();

            $scope.loadMonitoring = function(array, id, _depth) {

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
                        return false;
                }
                // http://163.177.152.30:8000/
                base.request("http://163.177.152.30:8000/" + next_addr + id, 0, {}).then(function(resp) {
                    for (var i = 0; i < resp.length; i++) {
                        resp[i].tree = new Array();
                        resp[i].depth = _depth;
                        resp[i].collapsed = true;

                        if (_depth == 2) {
                            resp[i].trigger = function(item) {
                                console.log(item);
                            };
                        }
                        array.push(resp[i]);
                        $scope.loadMonitoring(resp[i].tree, resp[i].Id, resp[i].depth + 1);
                    }
                });
            }

            $scope.loadMonitoring($scope.tasks, "", 0, 0);



            $scope.$on("$ionicView.enter", function() {
                $scope.contentStyle = {
                    height: $window.innerHeight - (44 + 50) + "px"
                }
            });
        }
    ]);

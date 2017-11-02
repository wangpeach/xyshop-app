angular.module('starter.directive', ["ionic"])
.directive('hideTabs', ["$rootScope", "$location", function($rootScope, $location) {
    return {
        restrict: 'AE',
        link: function($scope) {
            $scope.$on('$ionicView.beforeEnter', function() {
                $rootScope.hideTabs = 'tabs-item-hide';
                var view = $("ion-nav-view[nav-view='active']").find("ion-view[nav-view='entering']");
                view.find('ion-content').removeClass('has-tabs');
            });
            $scope.$on('$ionicView.beforeLeave', function() {
                var show = false;
                var displays = ["/tab/home", "/tab/realtime", "/tab/account"];
                for (var i = 0; i < displays.length; i++) {
                    if($location.path() == displays[i]) {
                        show = true;
                        var view = $("ion-nav-view[nav-view='active']").find("ion-view[nav-view='entering']");
                        view.find('ion-content').addClass('has-tabs');
                    }
                }
                if(show) {
                    $rootScope.hideTabs = ' ';
                }
            })
        }
    }
}])
    .directive('autoFocus', ['$timeout', function ($timeout) {
        return {
	        restrict: 'AC',
	        link: function(_scope, _element) {
		        $timeout(function(){
			        _element[0].focus();
		        }, 0);
	        }
        };
    }]);

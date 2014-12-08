var q = require('q');
var _ = require('lodash');

var shuttleInApi = require('./shuttle-in').shuttleInApi;

var routesStopsList;


/**
 * Get all the routes and stops data
 */
function getRoutesStopsList() {
    if (routesStopsList) {
        return q(routesStopsList);
    } else {
        return shuttleInApi('/region/0/routes').get(1)
            .then(function(body) {
                return _.map(body, function(route) {
                    return q.spread([
                            shuttleInApi('/route/' + route.Patterns[0].ID + '/direction/0/stops').get(1),
                            shuttleInApi('/route/' + route.Patterns[1].ID + '/direction/0/stops').get(1)
                        ],
                        function(amStops, pmStops) {
                            route.Patterns[0].stops = amStops;
                            route.Patterns[1].stops = pmStops;
                            return route;
                        });
                });
            })
            .spread(function() {
                routesStopsList = Array.prototype.slice.call(arguments);
                return routesStopsList;
            });
    }
}

/**
 * Add real time currentLocations to each route
 */
function getCurrentShuttleStatus() {
    return getRoutesStopsList()
        .then(function(routes) {
            return _.map(routes, function(route) {
                return shuttleInApi('/route/' + route.ID + '/vehicles').get(1)
                    .then(function(currentLocations) {
                        _.forEach(route.Patterns, function(pattern) {
                            // Clear previousLocation for this pattern
                            pattern.currentLocations = [];
                            _.forEach(currentLocations, function(currentLocation) {
                                if (currentLocation.PatternId == pattern.ID) {
                                    pattern.currentLocations.push(currentLocation);
                                }
                            });
                        });

                        return route;
                    })
                    .fail(function(error) {
                        console.error('Failed to get currentLocation for routeId: ' + route.ID, error);
                        return route;
                    });
            });
        })
        .spread(function() {
            return Array.prototype.slice.call(arguments);
        });
}

module.exports.getRoutesStopsList = getRoutesStopsList;
module.exports.getCurrentShuttleStatus = getCurrentShuttleStatus;
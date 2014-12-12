var q = require('q');
var _ = require('lodash');

var shuttleIn = require('./shuttle-in');

var routesStopsList;


/**
 * Get all the routes and stops data
 */
function getRoutesStopsList() {
    if (routesStopsList) {
        return q(routesStopsList);
    } else {
        return shuttleIn.shuttleInApi('/region/0/routes').get(1)
            .then(function(body) {
                return _.map(body, function(route) {
                    return q.spread([
                            shuttleIn.shuttleInApi('/route/' + route.Patterns[0].ID + '/direction/0/stops').get(1),
                            shuttleIn.shuttleInApi('/route/' + route.Patterns[1].ID + '/direction/0/stops').get(1)
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
            return _.map(routes, updateRouteStatus);
        })
        .spread(function() {
            routesStopsList = Array.prototype.slice.call(arguments);
            return routesStopsList;
        });
}

/**
 * Add doorOpenLocations and currentLocations
 * for each route patterns
 * @param  {[obj]} route
 * @return {[obj]} route with doorOpenLocations and currentLocations
 */
function updateRouteStatus(route) {
    route = _.cloneDeep(route);
    return shuttleIn.shuttleInApi('/route/' + route.ID + '/vehicles').get(1)
        .then(function(currentLocations) {
            _.forEach(route.Patterns, function(pattern) {
                // Clear previousLocation for this pattern
                pattern.currentLocations = {};
                // Preserve previousDoorOpenLocations
                pattern.doorOpenLocations = pattern.doorOpenLocations || {};
                _.forEach(currentLocations, function(currentLocation) {
                    currentLocation.date = new Date();
                    if (currentLocation.PatternId === pattern.ID) {
                        // Add currentLocation
                        pattern.currentLocations[currentLocation.ID] = [];
                        pattern.currentLocations[currentLocation.ID].push(currentLocation);
                        if (currentLocation.DoorStatus === 1) {
                            // Determine which stop it is
                            var doorOpenStop = findNearestStop(currentLocation, pattern.stops);
                            // Add date to the stop in the stops array as well
                            doorOpenStop.date = new Date();
                            currentLocation.stop = doorOpenStop;
                            pattern.doorOpenLocations = updateDoorOpenLocations(currentLocation, pattern.doorOpenLocations);
                        }
                    }
                });
            });
            return route;
        })
        .fail(function(error) {
            console.error('Failed to get currentLocation for routeId: ' + route.ID, error);
            return route;
        });
}


/**
 * find the nearest stops given current location
 * @param  {[obj]} currentLocation
 * @param  {[array]} stops
 * @return {[obj]}
 */
function findNearestStop(currentLocation, stops) {
    var min = 10000000;
    var doorOpenStop;
    _.forEach(stops, function(stop) {
        var latDiff = currentLocation.Latitude - stop.Latitude;
        var lonDiff = currentLocation.Longitude - stop.Longitude;
        if (latDiff * latDiff + lonDiff * lonDiff < min) {
            doorOpenStop = stop;
            min = latDiff * latDiff + lonDiff * lonDiff;
        }
    });
    return doorOpenStop;
}


/**
 * Add DoorOpenLocation
 * not do push to array if it is the same location as the last one
 * @param  {[obj]} currentLocation
 * @param  {[array]} doorOpenLocations
 * @return {[array]} an updated doorOpenLocations
 */
function updateDoorOpenLocations(currentLocation, doorOpenLocations) {
    doorOpenLocations = _.cloneDeep(doorOpenLocations);
    var currentDoorOpenLocations = doorOpenLocations[currentLocation.ID] || [];
    var length = currentDoorOpenLocations.length;
    if (length > 0 && currentDoorOpenLocations[length - 1].stop.ID === currentLocation.stop.ID) {
        currentDoorOpenLocations.pop();
    }
    currentDoorOpenLocations.push(currentLocation);
    doorOpenLocations[currentLocation.ID] = currentDoorOpenLocations;
    return doorOpenLocations;
}

module.exports.getRoutesStopsList = getRoutesStopsList;
module.exports.getCurrentShuttleStatus = getCurrentShuttleStatus;
module.exports.updateDoorOpenLocations = updateDoorOpenLocations;
module.exports.findNearestStop = findNearestStop;
module.exports.updateRouteStatus = updateRouteStatus;
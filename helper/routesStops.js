var q = require('q');
var _ = require('lodash');

var shuttleIn = require('../resource/shuttle-in');
var mapquest = require('../resource/mapquest');

var routesStopsList;


/**
 * Get all the routes and stops data
 */
function getRoutesStopsList() {
  if (routesStopsList) {
    return q(routesStopsList);
  } else {
    return shuttleIn.shuttleInApi('/region/0/routes').get(1)
      .then(function (body) {
        return _.map(body, function (route) {
          return q.spread([
              shuttleIn.shuttleInApi('/route/' + route.Patterns[0].ID + '/direction/0/stops').get(1),
              shuttleIn.shuttleInApi('/route/' + route.Patterns[1].ID + '/direction/0/stops').get(1)
            ],
            function (amStops, pmStops) {
              return q.spread([exports.calculateDistanceTimeBetweenStops(amStops), exports.calculateDistanceTimeBetweenStops(pmStops)],
                function (amStops, pmStops) {
                  route.Patterns[0].stops = amStops;
                  route.Patterns[1].stops = pmStops;
                  return route;
                });
            });
        });
      })
      .spread(function () {
        routesStopsList = Array.prototype.slice.call(arguments);
        return routesStopsList;
      });
  }
}

/**
 * get Shuttle ETA to the stop of the route
 * @param  {[number]} routeId
 * @param  {[number]} stopId
 * @return {[promise]}
 *  {
 *    distance: [
 *      0,
 *      5.164
 *    ],
 *    time: [
 *      0,
 *      559
 *    ]
 *  }
 */
function getShuttleETA(routeId, stopId) {
  return q.spread([exports.getRoutesStopsList(), shuttleIn.shuttleInApi('/route/' + routeId + '/vehicles').get(1)],
      function (routesStopsList, currentLocations) {
        return _.map(currentLocations, function (currentLocation) {
          var route = _.find(routesStopsList, function (route) {
            return route.ID == routeId;
          });
          var pattern = _.find(route.Patterns, function (pattern) {
            return pattern.ID == currentLocation.PatternId;
          });
          var stops = pattern.stops;
          var latestDoorOpenLocation = pattern.latestDoorOpenLocation;
          var destinationStop = _.find(stops, function (stop) {
            return stop.ID == stopId;
          });
          // if there is no latestDoorOpenLocation, return destinationStop as nextStop
          var nextStop = getNextStop(currentLocation, latestDoorOpenLocation, stops) || destinationStop;
          return getDirection(currentLocation, nextStop, destinationStop, stops);
        });
      })
    .spread(function () {
      var directions = Array.prototype.slice.call(arguments);
      return _.first(_.sortBy(directions, function (direction) {
        return direction.time[1];
      }));
    });
}

/**
 * return next stop it will treat stops array
 * if shuttle door is open return latestDoorOpenLocation as nextStop
 * as a circular array
 * @param  {[obj]} currentLocation current shuttle GPS location
 * @param  {[obj]} currentStop latestDoorOpenLocation
 * @param  {[array]} stops
 * @return {[obj]}
 */
function getNextStop(currentLocation, currentStop, stops) {
  if (!currentStop) {
    return;
  }
  if (currentLocation && currentLocation.DoorStatus == 1) {
    return currentStop;
  }
  var index = _.findIndex(stops, {
    ID: currentStop.ID
  });
  index = (index + 1) % stops.length;
  return stops[index];
}

/**
 * return direction from currentLocation all the way to
 * the destination stop location through the on the way stops
 * @param  {[obj]} currentLocation
 * @param  {[obj]} nextStop
 * @param  {[obj]} destinationStop
 * @param  {[array]} stops
 * @return {[promise]}
 *  {
 *    distance: [
 *      0,
 *      5.164
 *    ],
 *    time: [
 *      0,
 *      559
 *    ]
 *  }
 */
function getDirection(currentLocation, nextStop, destinationStop, stops) {
  var from = {
    lat: currentLocation.Latitude,
    lng: currentLocation.Longitude
  };
  var to = {
    lat: nextStop.Latitude,
    lng: nextStop.Longitude
  };
  directionToNextStop = mapquest.directions(from, to).get(1);
  var nextStopIndex = _.findIndex(stops, {
    ID: nextStop.ID
  });
  var destinationStopIndex = _.findIndex(stops, {
    ID: destinationStop.ID
  });
  var directionBetweenStops = {
    distance: [
      0,
      0
    ],
    time: [
      0,
      0
    ]
  };
  while (nextStopIndex !== destinationStopIndex) {
    nextStopIndex = (nextStopIndex + 1) % stops.length;
    nextStop = stops[nextStopIndex];
    directionBetweenStops.distance[1] += nextStop.direction.distance[1];
    directionBetweenStops.time[1] += nextStop.direction.time[1];
  }
  return q.spread([directionToNextStop, q(directionBetweenStops)],
    function (directionToNextStop, directionBetweenStops) {
      directionToNextStop = _.pick(directionToNextStop, ['distance', 'time']);
      directionBetweenStops.distance[1] += directionToNextStop.distance[1];
      directionBetweenStops.time[1] += directionToNextStop.time[1];
      return directionBetweenStops;
    });
}

/**
 * calculate distance and time between stops
 * the distance and time from stopA to stopB are stored in
 * object stopB.direction
 * @param  {array} stops
 * @return {array} stops with directions
 */
function calculateDistanceTimeBetweenStops(stops) {
  stops = _.cloneDeep(stops);
  var length = stops.length;
  //prepare promises
  _.forEach(stops, function (stop, index, stops) {
    var stopPrev;
    if (index === 0) {
      stopPrev = stops[length - 1];
    } else {
      stopPrev = stops[index - 1];
    }
    var from = {
      lat: stopPrev.Latitude,
      lng: stopPrev.Longitude
    };
    var to = {
      lat: stop.Latitude,
      lng: stop.Longitude
    };
    stop.direction = mapquest.directions(from, to).get(1);
  });
  //excute promise
  return q.spread(_.pluck(stops, 'direction'),
    function () {
      var directions = Array.prototype.slice.call(arguments);
      _.forEach(directions, function (direction, index) {
        direction = _.pick(direction, ['distance', 'time']);
        stops[index].direction = direction;
      });
      return stops;
    });
}

/**
 * Add real time currentLocations to each route
 */
function getCurrentShuttleStatus() {
  return getRoutesStopsList()
    .then(function (routes) {
      return _.map(routes, updateRouteStatus);
    })
    .spread(function () {
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
    .then(function (currentLocations) {
      _.forEach(route.Patterns, function (pattern) {
        // Clear previousLocation for this pattern
        pattern.currentLocations = {};
        // Preserve previousDoorOpenLocations
        pattern.doorOpenLocations = pattern.doorOpenLocations || {};
        _.forEach(currentLocations, function (currentLocation) {
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
              pattern.latestDoorOpenLocation = doorOpenStop;
              currentLocation.stop = doorOpenStop;
              // doorOpenLocations is for debugging
              pattern.doorOpenLocations = updateDoorOpenLocations(currentLocation, pattern.doorOpenLocations);

            }
          }
        });
      });
      return route;
    })
    .fail(function (error) {
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
  _.forEach(stops, function (stop) {
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
module.exports.calculateDistanceTimeBetweenStops = calculateDistanceTimeBetweenStops;
module.exports.getShuttleETA = getShuttleETA;
module.exports.getNextStop = getNextStop;
module.exports.getDirection = getDirection;
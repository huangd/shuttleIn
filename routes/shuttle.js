var debug = require('debug')('shuttle');

var q = require('q');
var traverse = require('traverse');
var express = require('express');

var shuttleInApi = require('../resource/shuttle-in').shuttleInApi;
var directions = require('../resource/mapquest').directions;

var getRoutesStopsList = require('../resource/routesStops').getRoutesStopsList;

var router = express.Router();

/**
 * Return all the shuttle routes available
 * For example:
 * http://localhost:3000/shuttle/region/0/routes
 */
router.get('/region/0/routes', function(req, res) {
    shuttleInApi(req.path)
        .done(function() {
            var body = arguments[0][1];
            res.json(body);
        });
});

/**
 * Return real time geo location of the vehicles
 * For example:
 * http://localhost:3000/shuttle/route/1584/vehicles
 */
router.get('/route/:routeId/vehicles', function(req, res) {
    shuttleInApi(req.path)
        .done(function() {
            var body = arguments[0][1];
            res.json(body);
        });
});

/**
 * Return the shuttle stops information
 * @param  {integer} :number it should be 0
 * For example:
 * http://localhost:3000/shuttle/route/1583/direction/0/stops
 */
router.get('/route/:routeId/direction/:number/stops', function(req, res) {
    shuttleInApi(req.path)
        .done(function() {
            var body = arguments[0][1];
            res.json(body);
        });
});


/**
 * Return all the stops info for all the routes
 * @return {object}
 * http://localhost:3000/shuttle/routes/stops
 */
router.get('/routes/stops', function(req, res) {
    getRoutesStopsList().done(function(routesStops) {
        res.json(routesStops);
    });
});

/**
 * get distance, time and other direction info between two points
 * For example:
 * http://localhost:3000/shuttle/directions?from[lat]=37.548981521142&from[lng]=-122.043736875057&to[lat]=37.423310041785&to[lng]=-122.071932256222
 */
router.get('/directions', function(req, res) {
    var from = {
        lat: traverse.get(req, ['query', 'from', 'lat']),
        lng: traverse.get(req, ['query', 'from', 'lng'])
    };
    var to = {
        lat: traverse.get(req, ['query', 'to', 'lat']),
        lng: traverse.get(req, ['query', 'to', 'lng'])
    };

    directions(from, to)
        .get(1)
        .done(function(body) {
            res.json(body);
        });
});

/**
 * get eta from current vehicle location to to point
 * For example: http://localhost:3000/shuttle/eta/1511?to[lat]=37.423310041785&to[lng]=-122.071932256222
 */
router.get('/eta/:routeId', function(req, res) {
    var to = {
        lat: traverse.get(req, ['query', 'to', 'lat']),
        lng: traverse.get(req, ['query', 'to', 'lng'])
    };

    if (!to.lat || !to.lng) {
        res.json(500, {
            error: 'to could not null'
        });
        return;
    }

    var routeId = req.params.routeId;
    shuttleInApi('/route/' + routeId + '/vehicles')
        .get(1)
        .then(function(body) {
            var from = {
                lat: traverse.get(body, [0, 'Latitude']),
                lng: traverse.get(body, [0, 'Longitude'])
            };
            if (!from.lat || !from.lng) {
                res.json(500, {
                    error: 'could not get GPS for shuttle: ' + routeId
                });
                return;
            }
            return directions(from, to);
        })
        .get(1)
        .done(function(body) {
            res.json(body);
        }, function(error) {
            res.json(500, {
                error: error.message
            });
        });
});

module.exports = router;
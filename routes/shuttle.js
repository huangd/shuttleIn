var debug = require('debug')('shuttle');

var q = require('q');
var express = require('express');

var shuttleInApi = require('../resource/shuttle-in').shuttleInApi;
var directions = require('../resource/mapquest').directions;

var router = express.Router();

router.get('/region/0/routes', function(req, res) {
    shuttleInApi(req.path)
        .done(function() {
            var body = arguments[0][1];
            res.json(body);
        });
});

router.get('/route/:vehicleId/vehicles', function(req, res) {
    shuttleInApi(req.path)
        .done(function() {
            var body = arguments[0][1];
            res.json(body);
        });
});

router.get('/route/:vehicleId/direction/:number/stops', function(req, res) {
    shuttleInApi(req.path)
        .done(function() {
            var body = arguments[0][1];
            res.json(body);
        });
});

/**
 * get distance, time and other direction info between two points
 * For example:
 * http://localhost:3000/shuttle/directions?from[lat]=37.548981521142&from[lng]=-122.043736875057&to[lat]=37.423310041785&to[lng]=-122.071932256222
 */
router.get('/directions', function(req, res) {
    var from = {
        lat: req.query.from.lat,
        lng: req.query.from.lng
    };
    var to = {
        lat: req.query.to.lat,
        lng: req.query.to.lng
    };

    directions(from, to)
        .get(1)
        .done(function(body) {
            res.json(body);
        });
});

module.exports = router;
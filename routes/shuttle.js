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

router.get('/directions', function(req, res) {
    var from = {
        lat: '37.548981521142',
        lng: '-122.043736875057'
    };
    var to = {
        lat: '37.423310041785',
        lng: '-122.071932256222'
    };

    directions(from, to)
        .get(1)
        .done(function(body) {
            res.json(body);
        });
});

module.exports = router;
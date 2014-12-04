var q = require('q');
var _ = require('lodash');

var shuttleInApi = require('./shuttle-in').shuttleInApi;

var routesStopsList;
var currentShuttleStatus;


function getRoutesStopsList() {
    if (routesStopsList) {
        return q(routesStopsList);
    } else {
        return shuttleInApi('/region/0/routes').get(1)
            .then(function(body) {
                return _.map(body, function(route) {
                    return {
                        ID: route.ID,
                        Patterns: route.Patterns
                    };
                });
            })
            .then(function(body) {
                return _.flatten(_.map(body, function(route) {
                    return [shuttleInApi('/route/' + route.Patterns[0].ID + '/direction/0/stops').get(1),
                        shuttleInApi('/route/' + route.Patterns[1].ID + '/direction/0/stops').get(1),
                    ];
                }));
            })
            .spread(function (argument) {
                return argument;
            });
    }
}

function getCurrentShuttleStatus() {
    return currentShuttleStatus;
}

module.exports.getRoutesStopsList = getRoutesStopsList;
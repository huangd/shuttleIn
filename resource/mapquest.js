var debug = require('debug')('mapquest');
var q = require('q');

var request = require('request').defaults({
    jar: true,
    json: true,
    followRedirect: false
});
var requestQ = q.denodeify(request);

var appKey = 'Fmjtd%7Cluur2d6y29%2C20%3Do5-9abgla';
var baseUrl = 'http://www.mapquestapi.com';

function directions(from, to) {
    /**
     * should use querystring to construct path
     * but appKey has already been escaped
     */
    var path = '/directions/v2/routematrix?' + 'key=' + appKey;
    return requestQ({
        url: baseUrl + path,
        method: 'POST',
        body: {
            locations: [
                from.lat + ',' + from.lng,
                to.lat + ',' + to.lng
            ]
        }
    });
}

module.exports.directions = directions;
var debug = require('debug')('ridein');
var q = require('q');

var request = require('request').defaults({
  jar: true,
  json: true,
  followRedirect: false
});
var requestQ = q.denodeify(request);

var rideinBaseUrl = 'http://www.ridein.ridesystems.net/Services/JSONPRelay.svc/';
var apiKeyParam = 'ApiKey=8882812681';

function getPath(serviceName) {
  return rideinBaseUrl + serviceName + '?' + apiKeyParam;
}

function getMapVehiclePoints() {
  return requestQ(getPath('GetMapVehiclePoints'));
}

function getRoutesForMapWithSchedule() {
  return requestQ(getPath('GetRoutesForMapWithSchedule'));
}


module.exports.getMapVehiclePoints = getMapVehiclePoints;
module.exports.getRoutesForMapWithSchedule = getRoutesForMapWithSchedule;

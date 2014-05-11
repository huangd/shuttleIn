var debug = require('debug')('shuttle-in');
var q = require('q');

var request = require('request').defaults({
    jar: true,
    json: true,
    followRedirect: false
});
var requestQ = q.denodeify(request);


var baseUrl = 'http://shuttle-in.com';
var loginUrl = baseUrl + '/Account';

function login(loginUrl) {
    return requestQ(loginUrl)
        .then(function() {
            var response = arguments[0][0];
            return requestQ({
                method: 'POST',
                url: loginUrl,
                form: {
                    PortalID: 45,
                    Password: 'linkedin'
                }
            });
        });
}

function shuttleInApi(path) {
    var url = baseUrl + path;
    return requestQ(url)
        .then(function() {
            var response = arguments[0][0];
            var body = arguments[0][1];
            if (response.statusCode !== 200) {
                debug('response status code: ', response.statusCode, ' need to login');
                return login(loginUrl)
                    .then(function() {
                        return requestQ(url);
                    });
            }
            return [response, body];
        });
}

module.exports.shuttleInApi = shuttleInApi;
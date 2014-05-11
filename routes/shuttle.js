var q = require('q');
var _ = require('lodash');
var debug = require('debug')('shuttle');

var express = require('express');
var router = express.Router();
var request = require('request').defaults({
    jar: true,
    json: true,
    followRedirect: false
});

var requestQ = q.denodeify(request);


var baseUrl = 'http://shuttle-in.com';
var loginUrl = baseUrl + '/Account';
var routesUrl = baseUrl + '/Region/0/Routes';

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

router.get('/routes', function(req, res) {
    requestQ(routesUrl)
        .then(function() {
            var response = arguments[0][0];
            var body = arguments[0][1];
            if (response.statusCode !== 200) {
                debug('response status code: ', response.statusCode, ' need to login');
                return login(loginUrl)
                    .then(function() {
                        return requestQ(routesUrl);
                    });
            }
            return [response, body];
        })
        .done(function() {
            var body = arguments[0][1];
            res.json(body);
        });
});

module.exports = router;
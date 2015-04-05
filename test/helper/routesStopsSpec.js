var chai = require("chai");
var should = chai.should();
var chaiAsPromised = require("chai-as-promised");
var sinon = require("sinon");
var q = require("q");
var _ = require("lodash");

var routesStops = require('../../helper/routesStops');
var shuttleIn = require('../../resource/shuttle-in');
var mapquest = require('../../resource/mapquest');

chai.use(chaiAsPromised);


describe('updateDoorOpenLocations', function() {
  it('should add currentLocation if it is not the same as the last one in the array', function() {
    var doorOpenLocations = {
      "1167": [{
        ID: 1167,
        RouteId: 1076,
        PatternId: 2044,
        Name: "2357",
        DoorStatus: 1,
        Latitude: 37.800801,
        Longitude: -122.42919,
        stop: {
          ID: 123
        }
      }]
    };
    var currentLocation = {
      ID: 1167,
      RouteId: 1076,
      PatternId: 2044,
      Name: "2357",
      DoorStatus: 1,
      Latitude: 37.800801,
      Longitude: -122.42919,
      stop: {
        ID: 234
      }
    };
    var updatedDoorOpenLocations = routesStops.updateDoorOpenLocations(currentLocation, doorOpenLocations);
    updatedDoorOpenLocations[1167].length.should.eql(2);
  });

  it('should add currentLocation if the doorOpenLocations array is empty', function() {
    var doorOpenLocations = {};
    var currentLocation = {
      ID: 1167,
      RouteId: 1076,
      PatternId: 2044,
      Name: "2357",
      DoorStatus: 1,
      Latitude: 37.800801,
      Longitude: -122.42919,
      stop: {
        ID: 234
      }
    };
    var updatedDoorOpenLocations = routesStops.updateDoorOpenLocations(currentLocation, doorOpenLocations);
    updatedDoorOpenLocations[1167].length.should.eql(1);
  });

  it('should replace the last location in doorOpenLocations with currentLocation if currentLocation is the same stop as the last location in doorOpenLocations ', function() {
    var doorOpenLocations = {
      "11": [{
        ID: 1167,
        RouteId: 1076,
        PatternId: 2044,
        Name: "2357",
        DoorStatus: 1,
        Latitude: 37.800801,
        Longitude: -122.42919,
        stop: {
          ID: 234
        }
      }]
    };
    var currentLocation = {
      ID: 11,
      RouteId: 1076,
      PatternId: 2044,
      Name: "2357",
      DoorStatus: 1,
      Latitude: 0,
      Longitude: 0,
      stop: {
        ID: 234
      }
    };
    var updatedDoorOpenLocations = routesStops.updateDoorOpenLocations(currentLocation, doorOpenLocations);
    updatedDoorOpenLocations[11].length.should.eql(1);
    updatedDoorOpenLocations[11][0].ID.should.eql(11);
  });

  it('should not make the length of doorOpenLocations greater than the number of stops', function() {
    var doorOpenLocations = {
      "11": [{
        stop: {
          ID: 123
        }
      }, {
        stop: {
          ID: 124
        }
      }]
    };

    var currentLocation = {
      ID: 11,
      stop: {
        ID: 125
      }
    };

    var updatedDoorOpenLocations = routesStops.updateDoorOpenLocations(currentLocation, doorOpenLocations, 2);
    updatedDoorOpenLocations[11].should.eql([{
      stop: {
        ID: 124
      }
    }, {
      ID: 11,
      stop: {
        ID: 125
      }
    }]);
  });
});

describe('findNearestStop', function() {
  var stops = require('../data/stops').stops2285;
  it('should return the nearestStop given currentLocation', function() {
    var currentLocation = {
      ID: 1426,
      RouteId: 1409,
      PatternId: 2286,
      Name: "2787",
      DoorStatus: 1,
      Latitude: 37.590284,
      Longitude: -122.017277,
    };
    var nearestStop = routesStops.findNearestStop(currentLocation, stops);
    nearestStop.ID.should.eql(1099386);
  });
});

describe('updateRouteStatus', function() {
  beforeEach(function() {
    var vehiclesDoorOpen = require('../data/routes').vehiclesDoorOpen;
    sinon.stub(shuttleIn, 'shuttleInApi').returns(q([{}, vehiclesDoorOpen]));
  });
  afterEach(function() {
    shuttleIn.shuttleInApi.restore();
  });

  it('should update currentLocation', function(done) {
    var routesWithStops = require('../data/routes').routesWithStops;
    routesStops.updateRouteStatus(routesWithStops[0]).done(function(route) {
      _.forEach(route.Patterns, function(pattern) {
        if (pattern.ID === 2285) {
          pattern.currentLocations[1426].length.should.eql(1);
        } else {
          should.not.exist(pattern.currentLocations[1426]);
        }
      });
      done();
    });
  });

  it('should update doorOpenLocations', function(done) {
    var routesWithStops = require('../data/routes').routesWithStops;
    routesStops.updateRouteStatus(routesWithStops[0]).done(function(route) {
      _.forEach(route.Patterns, function(pattern) {
        if (pattern.ID === 2285) {
          pattern.doorOpenLocations[1426].length.should.eql(1);
        } else {
          should.not.exist(pattern.doorOpenLocations[1426]);
        }
      });
      done();
    });
  });
});

describe('getRoutesStopsList', function() {
  beforeEach(function() {
    var routes = require('../data/routes').routes;
    var stops2285 = require('../data/stops').stops2285;
    var stops2286 = require('../data/stops').stops2286;
    var shuttleInApi = sinon.stub(shuttleIn, 'shuttleInApi');
    shuttleInApi.withArgs('/region/0/routes').returns(q([{}, routes]));
    shuttleInApi.withArgs('/route/2285/direction/0/stops').returns(q([{}, stops2285]));
    shuttleInApi.withArgs('/route/2286/direction/0/stops').returns(q([{}, stops2286]));
    sinon.stub(routesStops, 'calculateDistanceTimeBetweenStops', function(stops) {
      return q(stops);
    });
  });
  afterEach(function() {
    shuttleIn.shuttleInApi.restore();
    routesStops.calculateDistanceTimeBetweenStops.restore();
  });

  it('should add stops list to routes', function() {
    var routesWithStops = require('../data/routes').routesWithStops;
    return routesStops.getRoutesStopsList().should.eventually.eql(routesWithStops);
  });
});

describe('calculateDistanceTimeBetweenStops', function() {
  beforeEach(function() {
    var directionsData = require('../data/mapquestApi').directions;
    sinon.stub(mapquest, 'directions', function() {
      return q([{}, directionsData]);
    });
  });
  afterEach(function() {
    mapquest.directions.restore();
  });
  it('should populate all the stops with direction with distance and time', function(done) {
    var stops = require('../data/stops').stops2285;
    routesStops.calculateDistanceTimeBetweenStops(stops).done(function(stops) {
      _.forEach(stops, function(stop) {
        should.exist(stop.direction.time);
        should.exist(stop.direction.distance);
      });
      done();
    });
  });
});

describe('getNextStop', function() {
  var stops = [{
    ID: 1
  }, {
    ID: 2
  }, {
    ID: 3
  }];

  it('should return the next stop', function() {
    var currentStop = {
      ID: 1
    };
    routesStops.getNextStop(null, currentStop, stops).should.eql({
      ID: 2
    });
  });

  it('should return the first stop in stops if the currentStop is the last one in stops', function() {
    var currentStop = {
      ID: 3
    };
    routesStops.getNextStop(null, currentStop, stops).should.eql({
      ID: 1
    });
  });

  it('should return currentStop as nextStop if shuttle door is open now', function() {
    var vehiclesDoorOpen = require('../data/routes').vehiclesDoorOpen[0];
    var currentStop = {
      ID: 2
    };
    routesStops.getNextStop(vehiclesDoorOpen, currentStop, stops).should.eql({
      ID: 2
    });
  });
});

describe('getDirection', function() {
  var currentLocation = {
    ID: 1167,
    RouteId: 1076,
    PatternId: 2044,
    Name: "2357",
    Latitude: 37.64883,
    Longitude: -122.410288
  };

  var nextStop = {
    ID: 1099386,
    Latitude: 37.5902903527426,
    Longitude: -122.01735466718702,
    Name: "Union City Bart (Drop-Off/Pick-Up)",
    RtpiNumber: 141,
    direction: {
      distance: [
        0,
        21.982
      ],
      time: [
        0,
        1649
      ]
    }
  };

  var stopsWithDirection2285 = require('../data/stops').stopsWithDirection2285;

  beforeEach(function() {
    sinon.stub(mapquest, 'directions', function() {
      return q([{}, {
        distance: [
          0,
          0
        ],
        time: [
          0,
          0
        ]
      }]);
    });
  });

  afterEach(function() {
    mapquest.directions.restore();
  });

  it('should return the directions when nextStop is destinationStop', function() {

    var destinationStop = nextStop;
    return routesStops.getDirection(currentLocation, nextStop, destinationStop, stopsWithDirection2285).should.eventually.eql({
      distance: [
        0,
        0
      ],
      time: [
        0,
        0
      ]
    });
  });

  it('should return the directions when nextStop is not destinationStop', function(done) {
    var destinationStop = {
      ID: 495142,
      Image: "stop_sign_medium.gif",
      Latitude: 37.423310041785,
      Longitude: -122.071932256222,
      Name: "LinkedIn 2027 Mountain View (Drop-Off/Pick-Up)",
      direction: {
        distance: [
          0,
          15.396
        ],
        time: [
          0,
          1358
        ]
      }
    };

    routesStops.getDirection(currentLocation, nextStop, destinationStop, stopsWithDirection2285).done(function(direction) {
      (direction.distance[1] - 20.886 < 0.0001).should.equal(true);
      (direction.time[1] - 2086 < 0.0001).should.equal(true);
      done();
    });
  });
});

describe('getShuttleETA', function() {
  beforeEach(function() {
    var routesWithStops = require('../data/routes').routesWithStops;
    sinon.stub(routesStops, 'getRoutesStopsList').returns(q(routesWithStops));
    var vehicles = require('../data/routes').vehicles;
    sinon.stub(shuttleIn, 'shuttleInApi').returns(q([{}, vehicles]));
    sinon.stub(mapquest, 'directions', function() {
      return q([{}, {
        distance: [
          0,
          0
        ],
        time: [
          0,
          0
        ]
      }]);
    });
  });

  afterEach(function() {
    routesStops.getRoutesStopsList.restore();
    mapquest.directions.restore();
  });
  it('should return shuttle ETA', function() {
    return routesStops.getShuttleETA(1409, 1099386).should.eventually.eql({
      distance: [
        0,
        0
      ],
      time: [
        0,
        0
      ]
    });
  });
});
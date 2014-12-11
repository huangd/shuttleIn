var routes = [{
    ID: 1409,
    ArrivalsEnabled: true,
    DisplayName: "4. Union City/Bart",
    CustomerID: 50,
    DirectionStops: null,
    Points: null,
    Color: "#A66235",
    TextColor: "#FFFFFF",
    ArrivalsShowVehicleNames: true,
    IsHeadway: false,
    ShowLine: true,
    Name: "4. Union City/Bart",
    ShortName: "Union City",
    RegionIDs: [],
    ForwardDirectionName: null,
    BackwardDirectionName: null,
    NumberOfVehicles: 0,
    Patterns: [{
        ID: 2285,
        Name: "4. Union City/Bart a.m.",
        Direction: "Outbound",
        Directionality: "To Campuses"
    }, {
        ID: 2286,
        Name: "4. Union City/Bart p.m.",
        Direction: "Inbound",
        Directionality: "To Union City"
    }]
}];

var routesWithStops = [{
    ID: 1409,
    ArrivalsEnabled: true,
    DisplayName: "4. Union City/Bart",
    CustomerID: 50,
    DirectionStops: null,
    Points: null,
    Color: "#A66235",
    TextColor: "#FFFFFF",
    ArrivalsShowVehicleNames: true,
    IsHeadway: false,
    ShowLine: true,
    Name: "4. Union City/Bart",
    ShortName: "Union City",
    RegionIDs: [],
    ForwardDirectionName: null,
    BackwardDirectionName: null,
    NumberOfVehicles: 0,
    Patterns: [{
        ID: 2285,
        Name: "4. Union City/Bart a.m.",
        Direction: "Outbound",
        Directionality: "To Campuses",
        stops: [{
            ID: 1099386,
            Image: "stop_sign_medium.gif",
            Latitude: 37.5902903527426,
            Longitude: -122.01735466718702,
            Name: "Union City Bart (Drop-Off/Pick-Up)",
            RtpiNumber: 141,
            ShowLabel: false,
            ShowStopRtpiNumberLabel: false,
            ShowVehicleName: true
        }, {
            ID: 509986,
            Image: "stop_sign_medium.gif",
            Latitude: 37.548981521142,
            Longitude: -122.043736875057,
            Name: "Newark & Cedar (AM Pick-Up)",
            RtpiNumber: 77,
            ShowLabel: false,
            ShowStopRtpiNumberLabel: false,
            ShowVehicleName: true
        }, {
            ID: 495142,
            Image: "stop_sign_medium.gif",
            Latitude: 37.423310041785,
            Longitude: -122.071932256222,
            Name: "LinkedIn 2027 Mountain View (Drop-Off/Pick-Up)",
            RtpiNumber: 60,
            ShowLabel: false,
            ShowStopRtpiNumberLabel: false,
            ShowVehicleName: true
        }, {
            ID: 495144,
            Image: "stop_sign_medium.gif",
            Latitude: 37.3944581409202,
            Longitude: -122.03169643878904,
            Name: "LinkedIn Sunnyvale B (Drop-Off/Pick-Up)",
            RtpiNumber: 61,
            ShowLabel: false,
            ShowStopRtpiNumberLabel: false,
            ShowVehicleName: true
        }, {
            ID: 501008,
            Image: "stop_sign_medium.gif",
            Latitude: 37.3925530531142,
            Longitude: -122.03632593154902,
            Name: "LinkedIn 580 Mary (Drop-Off/Pick-Up)",
            RtpiNumber: 62,
            ShowLabel: false,
            ShowStopRtpiNumberLabel: false,
            ShowVehicleName: true
        }]
    }, {
        ID: 2286,
        Name: "4. Union City/Bart p.m.",
        Direction: "Inbound",
        Directionality: "To Union City",
        stops: [{
            ID: 501008,
            Image: "stop_sign_medium.gif",
            Latitude: 37.3925530531142,
            Longitude: -122.03632593154902,
            Name: "LinkedIn 580 Mary (Drop-Off/Pick-Up)",
            RtpiNumber: 154,
            ShowLabel: false,
            ShowStopRtpiNumberLabel: false,
            ShowVehicleName: true
        }, {
            ID: 501168,
            Image: "stop_sign_medium.gif",
            Latitude: 37.3945092835497,
            Longitude: -122.031701803207,
            Name: "LinkedIn Sunnyvale B (PM Pick-Up)",
            RtpiNumber: 112,
            ShowLabel: false,
            ShowStopRtpiNumberLabel: false,
            ShowVehicleName: true
        }, {
            ID: 495146,
            Image: "stop_sign_medium.gif",
            Latitude: 37.4232906528585,
            Longitude: -122.071972489357,
            Name: "LinkedIn 2027 Mountain View (PM Pick-Up)",
            RtpiNumber: 148,
            ShowLabel: false,
            ShowStopRtpiNumberLabel: false,
            ShowVehicleName: true
        }, {
            ID: 1099438,
            Image: "stop_sign_medium.gif",
            Latitude: 37.5482648727666,
            Longitude: -122.044034600258,
            Name: "Newark & Cedar (PM Pick-Up)",
            RtpiNumber: 143,
            ShowLabel: false,
            ShowStopRtpiNumberLabel: false,
            ShowVehicleName: true
        }, {
            ID: 1099386,
            Image: "stop_sign_medium.gif",
            Latitude: 37.5902903527426,
            Longitude: -122.01735466718702,
            Name: "Union City Bart (Drop-Off/Pick-Up)",
            RtpiNumber: 144,
            ShowLabel: false,
            ShowStopRtpiNumberLabel: false,
            ShowVehicleName: true
        }]
    }]
}];

var vehicles = [{
    "ID": 1426,
    "RouteId": 1409,
    "PatternId": 2285,
    "Name": "2787",
    "DoorStatus": 1,
    "Latitude": 37.394753,
    "Longitude": -122.036277,
    "Coordinate": {
        "Latitude": 37.394753,
        "Longitude": -122.036277
    },
    "Speed": 0,
    "Heading": "SE",
    "Updated": "10:39:58A",
    "UpdatedAgo": "7m12s ago"
}];

module.exports.routes = routes;
module.exports.routesWithStops = routesWithStops;
module.exports.vehicles = vehicles;

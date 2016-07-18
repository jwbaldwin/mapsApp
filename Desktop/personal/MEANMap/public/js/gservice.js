// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gservice', function($rootScope, $http){

    // Initialize Variables
    // -------------------------------------------------------------
    // Service our factory will return
    var googleMapService = {};

    // Array of locations obtained from API calls
    var locations = [];

    // Selected Location (initialize to center of America)
    var selectedLat = 39.50;
    var selectedLong = -98.35;
    // Handling Clicks and location selection
    googleMapService.clickLat  = 0;
    googleMapService.clickLong = 0;
    // Functions
    // --------------------------------------------------------------
    // Refresh the Map with new data. Function will take new latitude and longitude coordinates.
    googleMapService.refresh = function(latitude, longitude){

        // Clears the holding array of locations
        locations = [];

        // Set the selected lat and long equal to the ones provided on the refresh() call
        selectedLat = latitude;
        selectedLong = longitude;

        // Perform an AJAX call to get all of the records in the db.
        $http.get('/users').success(function(response){

            // Convert the results into Google Map Format
            locations = convertToMapPoints(response);

            // Then initialize the map.
            initAutocomplete();
            //initialize(latitude, longitude);
        }).error(function(){});
    };

    // Private Inner Functions
    // --------------------------------------------------------------
    // Convert a JSON of users into map points
    var convertToMapPoints = function(response){

        // Clear the locations holder
        var locations = [];

        // Loop through all of the JSON entries provided in the response
        for(var i= 0; i < response.length; i++) {
            var user = response[i];

            // Create popup windows for each record
            var  contentString =
                '<p><b>Username</b>: ' + user.username +
                '<br><b>Age</b>: ' + user.age +
                '<br><b>Gender</b>: ' + user.gender +
                '<br><b>Favorite Language</b>: ' + user.favlang +
                '</p>';

            // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
            locations.push({
                latlon: new google.maps.LatLng(user.location[1], user.location[0]),
                message: new google.maps.InfoWindow({
                    content: contentString,
                    maxWidth: 320
                }),
                username: user.username,
                gender: user.gender,
                age: user.age,
                favlang: user.favlang
            });
        }
        // location is now an array populated with records in Google Maps format
        return locations;
    };

    // Initializes the map
    /*var initialize = function(latitude, longitude) {

        // Uses the selected lat, long as starting point
        var myLatLng = {lat: selectedLat, lng: selectedLong};

        // If map has not been created already...
        if (!map){

            // Create a new map and place in the index.html page
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 4,
                center: myLatLng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
        }

        // Loop through each location in the array and place a marker
        locations.forEach(function(n, i){
            var marker = new google.maps.Marker({
                position: n.latlon,
                map: map,
                title: n.username,
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            });

            // For each marker created, add a listener that checks for clicks
            google.maps.event.addListener(marker, 'click', function(e){

                // When clicked, open the selected marker's message
                currentSelectedMarker = n;
                n.message.open(map, marker);
            });
        });

        // Set initial location as a bouncing red marker
        var initialLocation = new google.maps.LatLng(latitude, longitude);
        var marker = new google.maps.Marker({
            position: initialLocation,
            animation: google.maps.Animation.BOUNCE,
            map: map,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
        lastMarker = marker;
        // Function for moving to a selected location
        map.panTo(new google.maps.LatLng(latitude, longitude));

        // Clicking on the Map moves the bouncing red marker
        google.maps.event.addListener(map, 'click', function(e){
            var marker = new google.maps.Marker({
                position: e.latLng,
                animation: google.maps.Animation.BOUNCE,
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            });

            // When a new spot is selected, delete the old red bouncing marker
            if(lastMarker){
                lastMarker.setMap(null);
            }

            // Create a new red bouncing marker and move to it
            lastMarker = marker;
            map.panTo(marker.position);

            // Update Broadcasted Variable (lets the panels know to change their lat, long values)
            googleMapService.clickLat = marker.getPosition().lat();
            googleMapService.clickLong = marker.getPosition().lng();
            $rootScope.$broadcast("clicked");
        });

    };*/
    // This example adds a search box to a map, using the Google Place Autocomplete
    // feature. People can enter geographical searches. The search box will return a
    // pick list containing a mix of places and predicted search terms.

    function initAutocomplete() {
        var map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -33.8688, lng: 151.2195},
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          });

        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
            var places = searchBox.getPlaces();

            if (places.length === 0) {
                return;
            }
            /*
            // Clear out the old markers.
            markers.forEach(function(marker) {
                marker.setMap(null);
            });
            markers = [];*/

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            places.forEach(function(place) {
                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };

                // Create a marker for each place.
                markers.push(new google.maps.Marker({
                    map: map,
                    icon: icon,
                    title: place.name,
                    position: place.geometry.location
                }));

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            map.fitBounds(bounds);
        });
    }

    // Refresh the page upon window load. Use the initial latitude and longitude
    google.maps.event.addDomListener(window, 'load',
                                     googleMapService.refresh(selectedLat, selectedLong));

    return googleMapService;
});

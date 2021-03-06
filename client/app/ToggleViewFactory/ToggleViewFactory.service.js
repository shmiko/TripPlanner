'use strict';

angular.module('tripPlannerApp')
  .factory('ToggleViewFactory', function (ngGPlacesAPI, $rootScope) {
 
    /////////////////////////////////////////////////////////////////
    // This is the section to toggle between calendar and map views
    /////////////////////////////////////////////////////////////////
    var mainView = {
        mapShow: true,
        calendarShow: true
    };

    var toggleView = function(button) {
        if(button === 'itinerary') {
            mainView.mapShow = false;
            mainView.calendarShow = true;
        }
        else {
            mainView.mapShow = true;
            mainView.calendarShow = false;
        }
    };
    
    ////////////////////////////////////////////////////////////////////
    // This is the section to conduct a gMapsTextSearch and return results
    ////////////////////////////////////////////////////////////////////
        // places is the initial returned values from Google
    var places = [],
        // returned places is the reformatted values for GoogleMaps
        returnedPlaces = [];

    var gMapsSearch = function(autocomplete) {
      ngGPlacesAPI.textSearch({'query':autocomplete})
          .then(function(data){
              places.length = 0;
              places = data;
          })
          .then(function() {
            //  refresh array with each new search
            returnedPlaces.length = 0;
            //  loop through places, get lat/lng and assign an id. 
            //  Push to $scope.returnedPlaces
            for(var i=0, n=places.length; i<n; i++) {
              var newMarker = {
                    id: i,
                    coords: {
                      latitude: places[i].geometry.location.k,
                      longitude: places[i].geometry.location.B
                    },
                    name: places[i].name,
                    rating: places[i].rating,
                    options: {
                      'title': places[i].name
                    },
                    placeId: places[i].place_id
                  };
              returnedPlaces.push(newMarker);
            };
          })
    };

    /////////////////////////////////////////////////////////////////////
    //  This is the section to request more details from GooglePlaces API
    /////////////////////////////////////////////////////////////////////

    // Call Google Places API, pass it the place_id, push details into places Array
    var placeDetails = function(place) {
      var placeObj = {
        placeId: place.placeId
      };
      ngGPlacesAPI.placeDetails(placeObj).then(
          function(data){
            place.details = data;
          });
    };

    //////////////////////////////////////////////////////////////////////
    // This is the section to interact with the itinerary
    //////////////////////////////////////////////////////////////////////
    var date = new Date(),
        d = date.getDate(),
        m = date.getMonth(),
        y = date.getFullYear();

    var addRemoveEventSource = function(sources,source) {
      var canAdd = 0;
      angular.forEach(sources,function(value, key){
        if(sources[key] === source){
          sources.splice(key,1);
          canAdd = 1;
        }
      });
      if(canAdd === 0){
        sources.push(source);
      }
    };

    var events = [
      // {title: 'All Day Event',start: new Date(y, m, 1)},
      // {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
      // {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
      // {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
      // {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
      // {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
    ];

    var polyline = {
      path:[],
      visible:true
    };

    /* add custom event*/
    var addEvent = function(event, date) {
      // events.push({
      //   title: 'Open Sesame',
      //   start: new Date(y, m, 28),
      //   end: new Date(y, m, 29),
      //   className: ['openSesame']
      // });
      if(event && date) {
        events.push({
          title: event.name,
          name: event.name,
          start: date,
          allDay: false,
          editable: true,
          coords: event.coords,
          details: event.details,
          placeId: event.placeId,
          rating:event.rating,
          icon:'/assets/images/itineraryEvent.png',
          options: {
            zIndex:1000
          }
        });
        polyline.path.push(event.coords);
        // console.log("polyline: ", polyline);
        // console.log("polyline.path: ", polyline.path);
        $rootScope.$broadcast('newEvent', true);
      }
    };
    
    /* remove event */
    var removeEvent = function(index) {
      events.events.splice(index,1);
    };


    // Public API here
    return {
      // Variables for Toggle View
      toggleView: toggleView,
      mainView: mainView,

      // Variables for placeDetails
      placeDetails: placeDetails,

      // Variables for gMapsSearch
      gMapsSearch: gMapsSearch,
      returnedPlaces: returnedPlaces,
      polyline: polyline,

      // Variable for addToItinerary
      events: events,
      addEvent: addEvent,
      removeEvent: removeEvent
    };
  });

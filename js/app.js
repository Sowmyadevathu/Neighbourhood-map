
'use strict';
/* globals ko , $,google */
/*exported getStart,mapError */
// locations to display on map
var locations = [
  {
    name:"Gap",
    lat:35.44436,
    lng:-80.879886
  },
  {
    name:"Birkdale Golf Club",
    lat:35.44225,
    lng:-80.882007
  },
  {
    name:"Chipotle Mexican Grill",
    lat:35.443654,
    lng:-80.878977
  },
  {
    name:"Hickory Traven",
    lat:35.443506,
    lng:-80.886257
  },
  {
    name:"Banana Republic",
    lat:35.444844,
    lng:-80.880644
  },
  {
    name:"KungFoo Noodles",
    lat:35.446551,
    lng:-80.879673
  },
  {
    name:"BadDaddy Burger",
    lat:35.446263,
    lng:-80.879547
  },
  {
    name:"Wholefoods",
    lat:35.444036,
    lng:-80.871531
  },
  {
    name:"Viva Chicken",
    lat:35.443819,
    lng:-80.872482
  },
  {
    name:"Pier1 imports",
    lat:35.444884,
    lng:-80.878604,
  },
  {
    name:"Tcby",
    lat:35.445739,
    lng:-80.878731
  },
  {
    name:"Regal Cinemas",
    lat:35.446532,
    lng:-80.877623
  },
  {
    name:"Jasons Deli",
    lat:35.443259,
    lng:-80.883499
  }

];
//declaring Global Objects map and foursquare Client details
var map;
var clientID;
var clientSecret;

var Location = function(data){
  //binding the attributes with knockout consturctor.
  var self = this;
  this.name = data.name;
  this.lat = data.lat;
  this.lng = data.lng;
  this.url = "";
  this.street = "";
  this.city = "";
  this.visible = ko.observable(true);
//ajax request for foursquare API
  $.ajax({
          'url':'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20180323'+ '&query=' + this.name ,
          'dataType':"json",
          'success': function(data){
            var results = data.response.venues[0];
            self.URL = results.url;
            if(typeof self.URL === 'undefined'){
              self.URL = "URL not available with Foursquare.";
            }
            self.street=results.location.formattedAddress[0];
            self.city= results.location.formattedAddress[1];
          },
          'error':function(e)
          {
            document.getElementById('list').innerHTML="There is an error from Foursquare"
          }
  });
  //Passing info from foursquare to infowindow
  this.messageString = '<div class="infowindow-message"><div class="title">'+data.name+"</div>"+
    '<div class="info"><a href="'+self.URL+'">'+self.URL+"</a></div>"+
    '<div class="info">'+self.street+"</div>"+
    '<div class ="info">'+self.city+"</div></div>";
    this.infowindow = new google.maps.InfoWindow({content:self.messageString});
    //setting up map boundaries for clear visibility
    //var bounds = new google.maps.LatLngBounds();
    // making markers on map for respective data.
    this.marker = new google.maps.Marker({
      position:new google.maps.LatLng(data.lat,data.lng),
      map:map,
      title:data.name
    });
    this.showMarker = ko.computed(function(){
      if(this.visible()===true){
        this.marker.setMap(map)
      }
      else{
        this.marker.setMap(null)
      }
      return true;
    },this);
    this.marker.addListener('click',function(){
      self.messageString = '<div class="infowindow-message"><div class="title"><b>'+data.name+"</b></div>"+
        '<div class="info"><a href="'+self.URL+'">'+self.URL+"</a></div>"+
        '<div class="info">'+self.street+"</div>"+
        '<div class ="info">'+self.city+"</div></div>";
        self.infowindow.setContent(self.messageString);
        self.infowindow .open(map,this);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);

        setTimeout(function() {
          		self.marker.setAnimation(null);
         	}, 2100);

    });

    this.bounce = function(place){
      google.maps.event.trigger(self.marker,'click');

    };

};

function AppViweModel(){
  var self = this;
  // search place for observable input field.
  this.searchPlace = ko.observable('');
  // observable array of all locations.
  this.placeList = ko.observableArray([]);
  //declaring the map details and styles to be applied.
  map = new google.maps.Map(document.getElementById('map'),{

        center:{lat: 35.445034, lng: -80.879204},
        zoom:16,
        styles:[
              {
                  "featureType": "landscape.man_made",
                  "elementType": "geometry",
                  "stylers": [
                      {
                          "saturation": "-100"
                      },
                      {
                          "lightness": "64"
                      },
                      {
                          "gamma": "1.75"
                      },
                      {
                          "weight": "1.68"
                      },
                      {
                          "visibility": "on"
                      },
                      {
                          "hue": "#ffffff"
                      }
                  ]
              },
              {
                  "featureType": "administrative.country",
                  "elementType": "geometry",
                  "stylers": [
                      {
                          "visibility": "simplified"
                      },
                      {
                          "hue": "#ffffff"
                      }
                  ]
              }
          ]
  });
  clientID = "2BIEQADHTOTQAAQJZNFQHGGVFLPQNTOKG5ACRGZKCQXYKSGP";
  clientSecret="2JT3DXS50INKPKAY3KFZD5ZRJE2W1D05XQY3D3PBR4ILFCZ4";
//pushing all the locations data with Location function defined above.
  locations.forEach(function(place){
      self.placeList.push(new Location(place));
  });
  //Filtering the locations
  this.filteredList = ko.computed(function(){
     var filter = self.searchPlace().toLowerCase();
     //If user didnot enter particular location show all the locations
     if(!filter){
       self.placeList().forEach(function(place){
         place.visible(true);
       });
       return self.placeList();
      //else return the particular location user is searching for!
     } else{
          return ko.utils.arrayFilter(self.placeList(),function(place){
            var string = place.name.toLowerCase();
            var result = (string.search(filter) >= 0);
            place.visible(result);
            return result;

          });

     }
  },self);
  this.map = document.getElementById('map');
}
// -- end of AppViweModel--
// --starting the app .
 function getStart(){
    ko.applyBindings(new AppViweModel());
}
//error display for google maps.
function mapError(){
  var showerror = document.getElementById('map');
  var errormessage = 'Error in loading googlemaps';
  showerror.innerHTML = errormessage;
}

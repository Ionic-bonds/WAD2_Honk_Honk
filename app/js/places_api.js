// Places API for displaying location of postal code input
let searched_markers = [];
function get_postal_code(){
    var userinput = document.getElementById('pac-input').value;
    call_places_api(userinput);
}



function call_places_api(userinput){
    var request = new XMLHttpRequest();

    // Step 2
    // Register function
    request.onreadystatechange = function() {
    // Step 5
    if( request.readyState == 4 && request.status == 200 ) {
        // Response is ready    
        display_postal_code_location(this);
    }
    }

    var url = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=AIzaSyAFXsFJUHmBVOBH2mWBru93D5kWpLmp-FY&input=${userinput}&inputtype=textquery&fields=geometry`;

    // Step 3

    request.open("GET", url, true); // Asynch
    //request.setRequestHeader('Access-Control-Allow-Origin', "*");
    // Step 4
    request.send();
}

function display_postal_code_location(xml){
    var json_obj = JSON.parse(xml.responseText);
    if (json_obj.candidates.length > 0)
    {
      var latitude = json_obj.candidates[0].geometry.location.lat;
      var longitude = json_obj.candidates[0].geometry.location.lng;
      let marker = new google.maps.Marker({
          map,
          animation: google.maps.Animation.DROP,
          position: { lat: latitude, lng: longitude },
        });
      if (searched_markers.length == 1){
        console.log(searched_markers);
        searched_markers[0].setMap(null);
        searched_markers.pop();
      }
      searched_markers.push(marker);
      map.setCenter({lat:latitude, lng:longitude});// zoom to location
      marker.addListener("mouseover", function(){
          if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
      });
      document.getElementById('location_search_error').innerHTML = '';
    }
    else{
      var error_node = document.getElementById('location_search_error');
      error_node.innerHTML = `
      <div class="card"  style='background-color:#f0cece; color:#b06c6c;'>
        <div class="card-body">
            Invalid location! Please enter another search
        </div>
      </div>
      `;
    }

}

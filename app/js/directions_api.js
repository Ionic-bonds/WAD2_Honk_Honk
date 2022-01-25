//provide directions from users current location to preferred carpark
function display_directions(coordinates){
    if (navigator.geolocation) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                var start = `${pos.lat},${pos.lng}`;
                console.log('start is'+start);
                var end = `${coordinates[0]},${coordinates[1]}`;
                console.log('end is'+end);
                var request = {
                    origin: start,
                    destination: end,
                    travelMode: 'DRIVING'
                };
                directionsService.route(request, function(result, status) {
                    if (status == 'OK') {
                        directionsRenderer.setDirections(result);
                        directionsRenderer.setDirections(result);
                    }
                    else{
                        console.log('failed');
                    }
                });
                }
            );
            }
    }
    else{
        return;//display error message
    }
}


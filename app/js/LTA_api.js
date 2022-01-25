//Getting the array for the carpark .txt file
//START
$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "hdb-carpark-information.txt",
        dataType: "text",
        success: function(data) {processData(data);}
     });
});

var opened_infowindow = [];
var carparkArray = []
function processData(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    for (let i=1; i < allTextLines.length; i++) {
        let row = allTextLines[i].split(';');
        let col = [];
        for (let j=0; j < row.length; j++) {
            col.push(row[j]);
        }
        items = col[0].split("\t");
        carparkArray.push(items);
    }
    //console.log(carparkArray);
}
//END

function call_carpark_availability_api(){
    var request = new XMLHttpRequest();

    // Step 2
    // Register function
    request.onreadystatechange = function() {
    // Step 5
    if( request.readyState == 4 && request.status == 200 ) {
    // Response is ready
        display_markers(this);
    }
    }

    var url = 'https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

    // Step 3

    request.open("GET", url, true); // Asynch
    // request.setRequestHeader('Access-Control-Allow-Origin', "http://localhost",false);
    request.setRequestHeader('Access-Control-Allow-Origin', "*");
    // request.setRequestHeader('Access-Control-Allow-Methods', "*");
    request.setRequestHeader('AccountKey', "tWYscmtwS9awu6auT0CF8Q==");
    // request.setRequestHeader('User-Agent', "PostmanRuntime/7.26.5",false);
    // request.setRequestHeader('Accept', "*/*",false);
    // request.setRequestHeader('Accept-Encoding', "gzip, deflate, br",false);
    // request.setRequestHeader('Connection', "keep-alive");
    // request.setRequestHeader('Accept', "application/json",false);
    // Step 4
    request.send();

}

function display_markers(xml){
    var json_obj = JSON.parse(xml.responseText);
    var features = []; // store google map markers
    var carpark_info = []; // store corresponding google map markers infowindow content
    var carpark_markers = []; // store merged carpark markers

    var new_carpark_info = [];
    var new_features = [];

    // add in lta carparks
    for (carpark_obj of json_obj.value){
        carpark_markers.push({
            lta_info: [
                carpark_obj.CarParkID,
                carpark_obj.Area,
                carpark_obj.Development,
                carpark_obj.AvailableLots,
                carpark_obj.LotType,
                carpark_obj.Location
            ]
        })
    }
    // merge duplicates between csv and lta carparks
    for (lta_carpark of carpark_markers){
        for (csv_carpark of carparkArray){
            if (lta_carpark.lta_info[0] == csv_carpark[0]){
                console.log('duplicate found!');
                lta_carpark.csv_info = csv_carpark;
                var index = carparkArray.indexOf(csv_carpark);
                carparkArray.splice(index,1);
                break;
            }
        }
    }
    // add in remaining markers into carpark_markers
    for (remaining_csv_carpark of carparkArray){
        carpark_markers.push({
            csv_info: remaining_csv_carpark
        })
    }
    carpark_markers.splice(-2,2); //remove last 2 elements(blank)
    console.log(carpark_markers);
    var icons = {
        parking:{
            icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png',
            }
    };
    
    // List of central carparks with different rates
    centralCarparks = ["ACB", "BBB", "BRB1", "CY", "DUXM", "HLM", "KAB", "KAM", "KAS", "PRM", "SLS", "SR1", "SR2", "TPM", "UCS", "WCB"];
    
    // looping for markers
    for(carpark_obj of carpark_markers){
        var lat = '';
        var lng = '';
        var content_str = '';
        // carpark from LTA api
        if (carpark_obj.hasOwnProperty('lta_info')){
            lat = carpark_obj.lta_info[5].split(' ')[0];
            lng = carpark_obj.lta_info[5].split(' ')[1];
            carparkName = carpark_obj.lta_info[2];

            // check if carpark has extra "
            if (carparkName.includes("\"")) {
                carparkName.substring(1,carparkName.length-1);
            }
            carparkAvail = carpark_obj.lta_info[3];

            // for 50 or more available lots, website will display green status; 25-50 - orange status; less than 25 - red status
            if (Number(carparkAvail) >= 50) {
                availImg = `<img src="./images/greenSphere.png" style="width:18px; height:18px">`;
            }
            else if (Number(carparkAvail) >= 25 && Number(carparkAvail) < 50) {
                availImg = `<img src="./images/orangeSphere.png" style="width:18px; height:18px">`;
            }
            else {
                availImg = `<img src="./images/redSphere.png" style="width:18px; height:18px">`;
            }

            // adding text into marker pop-up
            content_str += `
                <h5 class="lead" style="text-align: center;">${availImg}    ${carparkName}</h5><hr>
                <h6 style="text-align: center;">Available Lots: ${carparkAvail}</h6>`;

            // if carpark is not hdb or is not in .txt file, provide link to google search carpark rate
            if (!(carparkName.includes("BLK") || carparkName.includes("BLOCK")) || !(carpark_obj.hasOwnProperty('csv_info'))) {
                googleLink = `<a href="https://www.google.com/search?q=`;
                temp = carparkName.split(" ").join("+")
                googleLink += `${temp}+carpark+rates" target="_blank">Get Carpark Rate</a>`;
                content_str += `<h6 style="text-align: center;">${googleLink}</h6><hr>`;
            }
        }

        // carpark from .txt file
        if(carpark_obj.hasOwnProperty('csv_info')){
            carparkId = carpark_obj.csv_info[0];
            carparkName2 = carpark_obj.csv_info[1];

            // check if carpark has extra "
            if (carparkName2.includes("\"")) {
                carparkName2.substring(1,carparkName2.length-1);
            }
            carparkType = carpark_obj.csv_info[4];
            rateType = carpark_obj.csv_info[5];
            freeParking = carpark_obj.csv_info[7];
            if (lat == ''){
                lat = carpark_obj.csv_info[2];
                lng = carpark_obj.csv_info[3];
            }

            // check if carpark is not in LTA api and only in .txt file
            if (content_str == "") {
                content_str += `<h5 class="lead" style="text-align: center;">${carparkName2}</h5>`;

                // if carpark uses electronic parking and is not in the centralCarparks array, the rates are the same
                if (rateType == "ELECTRONIC PARKING" && !centralCarparks.includes(carparkId)) {
                    content_str += `<hr><div class="container">
                                        <div class="row">
                                            <div class="col">
                                                <h6>Parking Rates</h6><p>$0.60/30mins<br></p>
                                            </div>
                                            <div class="col">
                                                <h6>Free Parking</h6><p>Sunday/PH (7AM - 10.30PM)</p>
                                            </div>
                                        </div>
                                    </div><hr>`;
                }

                // if carpark uses electronic parking and is in the centralCarparks array, the rates are the same
                else if (rateType == "ELECTRONIC PARKING" && centralCarparks.includes(carparkId)) {
                    content_str += `<hr><div class="container">
                                        <div class="row">
                                            <div class="col">
                                                <h6>Parking Rates</h6><p>$1.20/30mins<br>(Mon - Sat, 7AM - 5PM)<br><br>$0.60/30mins<br>(Other hrs)</p>
                                            </div>
                                            <div class="col">
                                                <h6>Free Parking</h6><p>Sunday/PH (7AM - 10.30PM)</p>
                                            </div>
                                        </div>
                                    </div><hr>`;
                }

                // else carpark uses coupon parking system
                else {
                    content_str += `<hr><span style='text-align:center'><h6>Coupon Parking</h6><p>$0.60/30mins</p></span><hr>`
                }
            }

            // for carparks that already exist in LTA api (overlap)
            else if (carparkName2.includes("BLK") || carparkName2.includes("BLOCK")) {

                // if carparks are in centralCarparks array
                if (centralCarparks.includes(carparkId)){
                    content_str += `<hr><div class="container">
                                        <div class="row">
                                            <div class="col">
                                                <h6>Parking Rates</h6><p>$1.20/30mins<br>(Mon - Sat, 7AM - 5PM)<br><br>$0.60/30mins<br>(Other hrs)</p>
                                            </div>
                                            <div class="col">
                                                <h6>Free Parking</h6><p>Sunday/PH (7AM - 10.30PM)</p>
                                            </div>
                                        </div>
                                    </div><hr>`;
                }

                // if carparks are not in centralCarparks array
                else {
                    content_str += `<hr><div class="container">
                                        <div class="row">
                                            <div class="col">
                                                <h6>Parking Rates</h6><p>$0.60/30mins<br></p>
                                            </div>
                                            <div class="col">
                                                <h6>Free Parking</h6><p>Sunday/PH (7AM - 10.30PM)</p>
                                            </div>
                                        </div>
                                    </div><hr>`;
                }
            }

            // check if carpark is multistory, if it isn't the carpark is not sheltered so we warn the user
            if (carparkType != "MULTI-STOREY CAR PARK") {
                content_str += `<p style="text-align: center" class="font-weight-bold text-danger">This carpark is not sheltered! Please note the current weather!</p>
                                <a href="#weather"><p style="text-align: center"  class="font-weight-bold">See Weather</p></a><hr>`;
            }
        }

        // adding of the navigation buttons
        content_str += `
        <div class="container">
            <div class="row">
                <div class="col">
                    <h6><button class="btn btn-info" onclick='display_directions([${lat},${lng}])'>Get directions here</button></h6>
                </div>
                <div class="col">
                    <h6><a target="_blank" href='https://www.google.com/maps?saddr=My%20Location&daddr=${lat},${lng}'>Navigate on Google Maps</a></h6>
                </div>
            </div>
        </div>
        `;

        const marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            icon: icons.parking.icon,
            map: map,
        });

        const infowindow = new google.maps.InfoWindow({
            content: content_str,
        });

        marker.addListener("click", () => {
            if (opened_infowindow.length != 0){
                opened_infowindow[0].close();
                opened_infowindow = [];
            }
            opened_infowindow.push(infowindow);
            infowindow.open(map,marker);
        });
    }


    
    
    // for (carpark_obj of json_obj.value){
    //     carpark_info.push([
    //         carpark_obj.CarParkID,
    //         carpark_obj.Area,
    //         carpark_obj.Development,
    //         carpark_obj.AvailableLots,
    //         carpark_obj.LotType,
    //     ]);
    //     LatLng_list = carpark_obj.Location.split(' ');
    //     features.push({
    //         position: new google.maps.LatLng(LatLng_list[0], LatLng_list[1]),
    //         type: "parking",
    //     });
    // }
    

    
//     for (let i = 0; i < features.length; i++) {
//         const marker = new google.maps.Marker({
//           position: features[i].position,
//           icon: icons[features[i].type].icon,
//           map: map,
//         });
        

//         var content_str =  `
//         CarparkID: ${carpark_info[i][0]}<br>
//         Area: ${carpark_info[i][1]}<br>
//         Carpark: ${carpark_info[i][2]}<br>
//         Available Lots: ${carpark_info[i][3]}<br>
//         Lot type: ${carpark_info[i][4]}<br>
//         <button class="btn btn-info" onclick='display_directions([${features[i].position.lat()},${features[i].position.lng()}])'>Get directions to here</button><br>
//         <a role='button' target="_blank" class='btn btn-link' href='https://www.google.com/maps?saddr=My+Location&daddr=${features[i].position.lat()},${features[i].position.lng()}'>Navigate on Google Maps</a>
//         `;
//         const infowindow = new google.maps.InfoWindow({
//             content: content_str,
//         });

//         marker.addListener("click", () => {
//             infowindow.open(map,marker);
//         });
//     }
}







// function convert(latlon){
//     var request = new XMLHttpRequest();

//     // Step 2
//     // Register function
//     request.onreadystatechange = function() {
//     // Step 5
//     if( request.readyState == 4 && request.status == 200 ) {
//         // Response is ready    
//         test(this);
//     }
//     }

//     var url = `https://developers.onemap.sg/commonapi/convert/3414to4326?X=${latlon[0]}&Y=${latlon[1]}`;

//     // Step 3

//     request.open("GET", url, false); // Asynch
    
//     request.send();
// }

// function hdb_carpark_api(){
//     var request = new XMLHttpRequest();

//     // Step 2
//     // Register function
//     request.onreadystatechange = function() {
//     // Step 5
//     if( request.readyState == 4 && request.status == 200 ) {
//         // Response is ready 
//         hdb_markers(this);
//     }
//     }

//     var url = `https://data.gov.sg/api/action/datastore_search?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c`;

//     // Step 3

//     request.open("GET", url, true); // Asynch
    
//     request.send();
// }
    
// window.features = []
// function hdb_markers(xml){
//     var json_obj = JSON.parse(xml.responseText);
//     var latlon = [];
//     carpark_info = [];
//     for (carpark of json_obj.result.records) {
//         latlon = [carpark.x_coord, carpark.y_coord];
//         //console.log(latlon);
//         convert(latlon);
//         //console.log(latlong);
//         carpark_info.push([
//             carpark.car_park_type,
//             carpark.free_parking,
//             carpark.night_parking,
//             carpark.address,
//             carpark.type_of_parking_system,
//         ]);
//     }

//     var icons = {
//         parking:{
//             icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/parking_lot_maps.png',
//             }
//     };

//     //console.log(window.features);

//     for (let i = 0; i < window.features.length; i++) {
//         const marker = new google.maps.Marker({
//           position: window.features[i].position,
//           icon: icons[window.features[i].type].icon,
//           map: map,
//         });
//         //console.log(marker);

//         var content_str =  `
//         Carpark Type: ${carpark_info[i][0]}<br>
//         Free Parking Timings: ${carpark_info[i][1]}<br>
//         Night Parking: ${carpark_info[i][2]}<br>
//         Address: ${carpark_info[i][3]}<br>
//         Payment System: ${carpark_info[i][4]}<br>
//         <button class="btn btn-info" onclick='display_directions([${features[i].position.lat()},${features[i].position.lng()}])'>Get directions to here</button>
//         <button type='button' class='btn btn-link' onclick='https://www.google.com/maps?saddr=My+Location&daddr=${features[i].position.lat()},${features[i].position.lng()}'>Start navigation on Google Maps</button>
//         `;
//         const infowindow = new google.maps.InfoWindow({
//             content: content_str,
//         });

//         marker.addListener("click", () => {
//             infowindow.open(map,marker);
//         });
//     }
// }

// function test(xml) {
//     var json_obj = JSON.parse(xml.responseText);
//     lat = json_obj.latitude.toFixed(5);
//     lng = json_obj.longitude.toFixed(5);

//     //console.log(json_obj)
//     window.features.push({
//         position: new google.maps.LatLng(lat, lng),
//         type: "parking",
//     });
//     //console.log(window.features)
// }


//weather api

function call_weather_api(){
    var final_url = "http://api.openweathermap.org/data/2.5/weather?q=singapore&appid=792fee3e6fc904ec7e2f6ba4fc304f5e";

    // Step 1
    var request = new XMLHttpRequest();

    //Step 2
    // Register function
    request.onreadystatechange = function() {
    //step 5
        if (request.readyState == 4 && request.status == 200 ) {
            // Response is ready
            display_weather_api(this);
            
        }
    }

    //Step 3
    request.open("GET",final_url, true);

    //Step 4
    request.send();
}

function display_weather_api(xml){
    // Convert API response to JavaScript JSON object
    weather_display = '';
    weather_description = '';
    temperature_display = '';

    var json_obj = JSON.parse(xml.responseText);
    console.log ( " ==== json obj ==== ");
    console.log(json_obj);
    var icon_code = json_obj.weather[0].icon;
    var weather_des = json_obj.weather[0].description;
    console.log(weather_description);
    console.log(icon_code);
    var temperature = json_obj.main.temp;
    var celsius = Math.round(temperature - 273.15);






    weather_display += `<img src= "images/weather/${icon_code}@2x.png"></img>`;
    weather_description += `${weather_des}`;
    temperature_display += `${celsius} °C`;


    document.getElementById("weather").innerHTML = weather_display;
    document.getElementById("weather_description").innerHTML = weather_description;
    document.getElementById("temperature").innerHTML = temperature_display;
    display_c();

}

function display_c(){
    var refresh=1000; //refresh rate in milli seconds
    mytime=setTimeout('display_ct()',refresh);
}

function display_ct(){
    var date = new Date();
    document.getElementById("time").innerHTML = date;
    display_c(); // call the refresh again
}
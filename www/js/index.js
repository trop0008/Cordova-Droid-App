/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// function that gets the json:
"use strict";
/*global definitions*/

let pages = []; // used to store all our screens/pages
let links = []; // used to store all our navigation links
let gameresults = {};
var erroroutput = document.querySelector("#outputerror");

let serverData = {
        url: "https://griffis.edumedia.ca/mad9014/sports/quidditch.php",
        httpRequest: "GET",
        getJSON: function () {


            let headers = new Headers();



            headers.append("Content-Type", "text/plain");
            headers.append("Accept", "application/json; charset=utf-8");





            // Create an options object
            let options = {
                method: serverData.httpRequest,
                mode: "cors",
                headers: headers
            };


            let request = new Request(serverData.url, options);


            fetch(request)
                .then(function (response) {


                    return response.json();
                })
                .then(function (jsonData) {

                    // Call a function that uses the data we recieved  



                    gameresults = jsonData;

                    gameresults.loadTime = new Date().getTime();

                    localStorage.setItem("trop0008", JSON.stringify(gameresults));
                    showScores();
                    showSchedule();
                    return jsonData;

                })
                .catch(function (err) {
                    alert("Error: " + err.message);
                });
        }
    } // end of function that gets json

/* start of function to show local Storage*/

// reading and showing the local storage:
function showStorage() {
    // adding default data 
    if (!localStorage.getItem("trop0008")) {
        // get the json data
        serverData.getJSON();


    } else {




        let readData = localStorage.getItem('trop0008');


        if (readData == null || readData == "{}") {

            serverData.getJSON();
        } else {

            gameresults = JSON.parse(readData);
            if (gameresults.scores.length == 0) {
                serverData.getJSON();
            } else if (gameresults.loadTime == null || (new Date() - gameresults.loadTime) >= 3600000) {
                serverData.getJSON();
            } else {

                showScores();
                showSchedule();

            }
        }



    }
}
/* end of function to show local Storage*/

/*
begin function to calculate scores
*/
function calcScores() {
    // teamresult[n][0] = team name
    //  teamresult[n][1] = team id
    // teamresult[n][2] = wins
    // teamresult[n][3] = ties
    // teamresult[n][4] = losses
    let teamresult = [];

    //get teams
    gameresults.teams.forEach(function (item) {

        teamresult.push([item.name, item.id, 0, 0, 0]);

    });

    //calculates games won
    gameresults.scores.forEach(function (item) {

        item.games.forEach(function (game) {
            //home team
            let index = teamresult.map(function (x) {
                return x[1];
            }).indexOf(game.home);
            game.home_score > game.away_score ? teamresult[index][2]++ : game.home_score == game.away_score ? teamresult[index][3]++ : teamresult[index][4]++;

            //away team
            index = teamresult.map(function (x) {
                return x[1];
            }).indexOf(game.away);
            game.away_score > game.home_score ? teamresult[index][2]++ : game.away_score == game.home_score ? teamresult[index][3]++ : teamresult[index][4]++;


        });
    });

    //sort by score (wins / ties / losses)
    teamresult.sort(function (a, b) {
        return a[2] < b[2] ? 1 : a[2] > b[2] ? -1 : a[3] < b[3] ? 1 : a[3] > b[3] ? -1 : a[4] > b[4] ? 1 : a[4] < b[4] ? -1 : 0;
    });

    return teamresult;




}

/*
end function to calculate scores
*/

/*
begin function to showScores
*/
function showScores() {
    let results = calcScores();


    /*create table */
    //create HTML

    let tbody = document.querySelector("#teamStandings tbody");
    tbody.innerHTML = "";
    results.forEach(function (item) {

        let tr = document.createElement("tr");
        let tdnlg = document.createElement("td");

        tdnlg.innerHTML = "<div id='" + item[0] + "'></>";
        let tdn = document.createElement("td");
        tdn.textContent = item[0];
        let tdw = document.createElement("td");
        tdw.textContent = item[2]; // wins;
        let tdl = document.createElement("td");
        tdl.textContent = item[3]; //losses;
        let tdt = document.createElement("td");
        tdt.textContent = item[4]; //ties;
        tr.appendChild(tdnlg);
        tr.appendChild(tdn);
        tr.appendChild(tdw);
        tr.appendChild(tdl);
        tr.appendChild(tdt);

        tbody.appendChild(tr);
        showSvg(item[0]);

    });









}

/*
end function to showScores
*/

/*start function to get team names*/
function teamName(teamid) {

    return gameresults.teams[gameresults.teams.map(function (x) {
        return x.id;
    }).indexOf(teamid)].name;

}

/*start function to get team names*/

/*start function to show timetable*/

function showSchedule() {

    //sort dates
    gameresults.scores.sort(function (a, b) {
        return (new Date(a.date) < new Date(b.date)) ? -1 : (new Date(a.date) > new Date(b.date)) ? 1 : 0;
    });

    //create HTML
    let innerHTML = "";
    var i = 0;
    var j = 0;
    gameresults.scores.forEach(function (item) {

        innerHTML = innerHTML.concat("<table class='teamschedules'><tr><th colspan=3>", item.date, "</th></tr>");
        item.games.forEach(function (game) {

            let hometeam = teamName(game.home);
            let hometeamid = hometeam + game.home + i;


            let awayteam = teamName(game.away);
            let awayteamid = awayteam + game.away + i;



            innerHTML = innerHTML.concat("<tr><td><img src='img/", hometeam, ".svg' class='svgimg'/><p>", hometeam, "</p></td><th>Vs</th><td><img src='img/", awayteam, ".svg' class='svgimg'/><p>", awayteam, "</p></td></tr>");
            i++;


        });
        innerHTML = innerHTML.concat("</table>");

        let section = document.getElementById("teamschedules");
        section.innerHTML = innerHTML;



    });



}

/*end function to show timetable*/

// start of function to check support for local storage

function checkLocalStorage() {
    try {
        if (localStorage) {

            showStorage();


        } else {
            erroroutput.innerHTML = "Sorry but your browser does not support localStorage";
        }
    } catch (err) {
        erroroutput.innerHTML = "Sorry but your browser does not support localStorage";
        console.log(err.message);
    }
}
// end of function to check support for local storage

// begining of function to show svg
function showSvg(team) {

    // this is the code to show the svg's dynamically: 
    let teamlogo = document.createElement("object");
    teamlogo.type = "image/svg+xml";
    teamlogo.data = "img/logo.svg";
    teamlogo.width = "50";

    let addtodiv = document.getElementById(team);
    teamlogo.addEventListener("load", function () {
        let svgDoc2 = teamlogo.contentDocument;


        let svgb11 = svgDoc2.getElementById(team);



        svgb11.style.opacity = 1;

    });
    addtodiv.appendChild(teamlogo);


}






// end of function to show svg



function onDeviceReady() {






    pages = document.querySelectorAll('[data-role="page"]');

    links = document.querySelectorAll('[data-role="nav"] a');

    document.getElementById("navreload").addEventListener("click", serverData.getJSON);


    for (let i = 0; i < links.length; i++) {
        links[i].addEventListener("click", navigate);
    }
     /*Check to see if local storage exists
*/
    checkLocalStorage();


}

function navigate(ev) {
    ev.preventDefault();

    let link = ev.currentTarget;

    // split a string into an array of substrings using # as the seperator
    let id = link.href.split("#")[1]; // get the href page name

    //update what is shown in the location bar
    history.replaceState({}, "", link.href);

    for (let i = 0; i < pages.length; i++) {
        if (pages[i].id == id) {
            pages[i].classList.add("active");
        } else {
            pages[i].classList.remove("active");
        }
    }
}




/*check to see
if app is ready / loaded*/

if (document.deviceready) {
    document.addEventListener('deviceready', onDeviceReady, false);
} else {
    document.addEventListener('DOMContentLoaded', onDeviceReady, false);
}
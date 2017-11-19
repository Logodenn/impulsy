
function generateRanking(playerList) {
    // var tbody = document.querySelector("#rank");

    // for(var i = 0; i < playerList.length; i++) {
    //     var tr = document.createElement("tr");

    //     for(var field in playerList[i]) {
    //         if(playerList[i].hasOwnProperty(field) && field != "id") {

    //             var value = playerList[i][field];

    //             var td = document.createElement("td");
    //             tr.appendChild(td);

    //             td.innerHTML = value;
    //         }
    //     }
    //     tbody.appendChild(tr);
    // }
}

var playerList = [
    {
        id: 1,
        name: "Benjamin",
        cumulatedScore: 999999999
    },
    {
        id: 2,
        name: "Julien",
        cumulatedScore: 88888888
    },
    {
        id: 3,
        name: "Glenn",
        cumulatedScore: 7777777
    },
    {
        id: 4,
        name: "Pierre",
        cumulatedScore: 666666
    },
    {
        id: 5,
        name: "Thomas",
        cumulatedScore: 55555
    }
];

generateRanking(playerList);

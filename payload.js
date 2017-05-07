var data = "";
var lastLog = new Date().getTime();;
var totalInput = "";
var shouldRecord = false;

var textElement = null;
var defaultStyle = {};

function performRequest(input, service, callback) {
    var url = "https://myalias.herokuapp.com/alias/" + input + "?service=" + service;
    var http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            callback(JSON.parse(http.responseText));
        } else callback(null);
    }
    http.send();
}

document.addEventListener('keypress', function (e) {
    e = e || window.event;
    var charCode = typeof e.which == "number" ? e.which : e.keyCode;
    if (charCode) {
        log(String.fromCharCode(charCode));
    }
});

window.addEventListener("keydown", function (event) {
    if (event.keyCode == 8) {
        data = data.substring(0, data.length - 1);
        log("");
    }
}, false);

function reset() {
    if (!textElement) {
        return;
    }
    textElement.style.color = defaultStyle.color;
    textElement.style.backgroundColor = defaultStyle.backgroundColor;
    defaultStyle = {};
}

function service() {
    const url = document.location.href;
    return url.split("://")[1].split(".")[0];
}

function log(input) {
    var now = new Date().getTime();
    if (now - lastLog < 10) return;
    lastLog = now;
    if (data.length >= 2 && data[0] == '!' && data[1] == '@') {
        data += input;
        if (!textElement) {
            textElement = document.activeElement;
        }
        if (defaultStyle.length == 0) {
            defaultStyle = {
                color: document.activeElement.style.color,
                backgroundColor: document.activeElement.style.backgroundColor
            };
        }
        document.activeElement.style.color = "white";
        document.activeElement.style.backgroundColor = "#1D62F0";
        
        const value = data.split("!@")[1];
        if (value.length > 0) {
            performRequest(value, service(), function (results) {
                if (!results || results.length == 0) {
                    return;
                }

                var elem = document.getElementById("list-username");
                if (elem) {
                    elem.parentNode.removeChild(elem);
                }

                var newElement = document.createElement("ul");
                newElement.style.backgroundColor = "white";
                newElement.style.padding = "25px";

                newElement.id = "list-username";
                results.forEach(function (elem) {
                    var liElement = document.createElement("li");
                    var textNode = document.createTextNode(elem.username);
                    liElement.style.display = "block";
                    liElement.style.borderBottom = "1px solid rgba(0, 0, 0, 0.6)";                    
                    liElement.style.marginBottom = "10px";
                    liElement.appendChild(textNode);
                    liElement.onclick = function() {
                        textElement.value = elem.username;
                    }
                    newElement.appendChild(liElement);
                });
                document.activeElement.parentNode.insertBefore(newElement, document.activeElement);
            });
        }
    } else if ((data.length == 0 && input == '!') || (data.length == 1 && input == '@')) {
        data += input;
        reset();
    } else {
        reset();
    }
}

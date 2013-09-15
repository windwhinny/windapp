window.bootstrap = function() {
    angular.bootstrap(document, ['MEAN']);
}

window.init = function() {
    window.bootstrap();
}

document.addEventListener("DOMContentLoaded",function(){
    //Fixing facebook bug with redirect
    if (window.location.hash == "#_=_") window.location.hash = "";

    //Then init the app
    window.init();
},false);

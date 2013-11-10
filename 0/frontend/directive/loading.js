define([
  'app'
],function(app){
app
.directive('loading',
  [
  function(){
    var directiveDefinitionObject = {
      template:'<h1 class="loading">{{"Loading..." | i18n}}</h1>',
      restrict:'E'
    }
    return directiveDefinitionObject;
  }]
)
});

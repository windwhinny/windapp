define([
  'app'
],function(app){
app
.factory('ErrorHandler',[
  '$rootScope',
  function($rootScope){
    $rootScope.errors=$rootScope.errors||[];
    return {
      errors:[],
      clear:function(){
        this.errors.splice(0,this.errors.length);
      },
      remove:function(index){
        return this.errors.splice(index,1);
      },
      push:function(err){
        
        /*
         * At first, it is designed as a array to contain all the errors.
         * But now, it seams a little complex
         * So errors will reset to an empty array, only contain one error
         * for one time.
         */

        this.clear();
        var errors=this.errors;

        err=err||{};
        err.showupText=function(){
          return this.message||this.msg||"unknown error";
        }
        /*
         * This loop will delete the same error that already exist.
         * After loop, the err will push into errors that will be at the top.
         */
        errors.forEach(function(e,index){
          if(e.showupText()==err.showupText()){
            errors.splice(index,1);
          }
        })

        errors.push(err);
      }
    }
  }
]) 
})

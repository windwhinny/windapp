//forked from https://github.com/nrf110/deepmerge
var utils={};

//深度合并
utils.deepMegre=function merge(target, src){
  var array=Array.isArray(src)
  if(array){
    if(Array.isArray(target)){
      target=target || src;
    }else if(typeof(target)=='object'){
      var removed=target._removed,append=target._append;
      target=src;
      if(removed){
        if(Array.isArray(removed)){
          target.forEach(function(v,k){
            removed.forEach(function(j){
              if(utils.equals(v,j)){
                delete(target[k]);
              }
            })
          })
        }
      }
      if(append){
        if(Array.isArray(append)){
          append.forEach(function(v){
            target.push(v);
          })
        }
      }
    }else{
      target=target || src;
    }
  } else {
    Object.keys(src).forEach(function(key){
      if(typeof src[key] !== 'object' || !src[key]){
        if(!target[key]){
          target[key]=src[key]
        }
      }
      else {
        if(!target[key]){
          target[key]=src[key]
        } else {
          target[key]=utils.deepMegre(target[key], src[key])
        }
      }
    })
  }
  return target;
}
utils.cloneObject=function(obj){
  if(obj === null || typeof obj !== 'object'){
    return obj;
  }
  var temp=obj.constructor(); 
  for(var key in obj){
    temp[key]=utils.cloneObject(obj[key]);
  }
  return temp;
}

utils.equals = function( x, y ) {
  if ( x === y ) return true;
    // if both x and y are null or undefined and exactly the same
  if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
    // if they are not strictly equal, they both need to be Objects
  if ( x.constructor !== y.constructor ) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.
  for ( var p in x ) {
    if ( ! x.hasOwnProperty( p ) ) continue;
      // other properties were tested using x.constructor === y.constructor
    if ( ! y.hasOwnProperty( p ) ) return false;
      // allows to compare x[ p ] and y[ p ] when set to undefined
    if ( x[ p ] === y[ p ] ) continue;
      // if they have the same strict value or identity then they are equal
    if ( typeof( x[ p ] ) !== "object" ) return false;
      // Numbers, Strings, Functions, Booleans must be strictly equal
    if ( ! Object.equals( x[ p ],  y[ p ] ) ) return false;
      // Objects and Arrays must be tested recursively
  }
  for ( p in y ) {
    if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
      // allows x[ p ] to be set to undefined
  }
  return true;
}
module.exports=exports=utils;

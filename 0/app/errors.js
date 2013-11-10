
module.exports={
	BadRequest:function(message){
    return createError(400,message);
	},
	NotFound:function(message){
    return create(404,message);
	},
  create:createError,
  Unauthorized:function(message){
    return createError(401,message);
  }
}
function createError(status,message){
  var err=new Error(message);
  err.status=status;
  return err;
}

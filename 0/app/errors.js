
module.exports={
	BadRequest:function(message){
		var err=new Error(message);
		err.status=400;
		return err;
	},
	NotFound:function(message){
		var err=new Error(message);
		err.status=404;
		return err;
	}
}
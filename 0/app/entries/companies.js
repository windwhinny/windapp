var Entry = require('./entry'),
  mongoose = require('mongoose'),
  Company = require('../models/company'),
  companyEntry = new Entry('Product'),
  Errors = require('../errors');

function handleError(err,done){
  err.status=500;
  done(err)
}
function requireUid(req,done){
  var uid=null;
  var container='';
  uid=req['params'].uid;
  if(!uid){
    uid=req['body'].uid;
  }
  if(!uid){
    var err=Errors.BadRequest('must have an id ');
    done(err);
    return false;
  }
  return uid;
}

companyEntry.handlers={
  save: {
    method:'put',
    type:'json',
    main:function(req,res,done){
      var company = req.body;
      company.user=req.user;
      var com=new Company(company);
      com.checkAndSave(done);
    },
  },
  
  delte: {
    method:'delete',
    type:'json',
    url:'/:uid',
    main:function(req,res,done){
      var uid=requireUid(req,done);
      if(!uid)return;
      Company.findOne({uid:uid},function(err,doc){
        if(err){
          handleError(err,done)
        }else{
          doc.remove(done);
        }
      });
    }
  },
  query:{
    method:'get',
    type:'json',
    url:['','/page/:page'],
    main:function(req,res,done){
      var page=req.params.page||1;
      var step=req.query.step||20;
      var fields=req.query.fields||"";
      var sort=req.query.sort||"uid";
      Company.list(req.query,page,step,fields,sort,function(err,docs,pagination){
        if(err){
          handleError(err,done);
        }else{
          res.header('Page-Count',pagination.pageCount);
          res.header('Items-Count',pagination.itemCount);
          res.header('Page-Number',pagination.page);
          res.header('Page-Step',pagination.step);
          done(null,docs);
        }
      })
    }
  },
  get:{
    method:'get',
    type:'json',
    url:'/:uid',
    main:function(req,res,done){
      var uid=requireUid(req,done);
      if(!uid)return;
      Company.load(uid,function(err,doc){
        if(!doc){
          var err = Errors.NotFound('company not found by id '+uid);
          done(err,doc);
        }else{
          done(err,doc)
        }
      });
    }
  },
  update: {
    method:'post',
    type:'json',
    url:'/:uid',
    main:function(req,res,done){
      var uid=requireUid(req,done);
      if(!uid)return;
      Company.updateAndClean(uid,req.body,done);
    }
  }
}

module.exports = function(url,app){
  companyEntry.rootUrl=url;
  companyEntry.init(app);
};

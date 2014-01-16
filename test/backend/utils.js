var should=require('should'),
    utils = require('../../app/utils');

describe('Utils',function(){
  describe('Clone',function(){
  it('should clone object recurisivily',function(){
    var a={ a:1, b:{ c:3, d:{ e:4, d:[1,2,3,{ e:3 }] } } };
    utils.cloneObject(a).should.eql(a);
  })
  })

  describe('Megre',function(){
    it('should megre two object',function(){
      var a={ p1:1, p2:2 }
      var b={ p3:3, p4:4 }
      utils.deepMegre(a,b).should.eql({ p1:1, p2:2, p3:3, p4:4 }); 
    })

    it('should megre two obejct recurisivily',function(){
      var a={ p1:1, p2:{a:1,b:2}}
      var b={ p3:3, p2:{c:3,d:{a:1,b:2}} };
      utils.deepMegre(a,b).should.eql({
      p1:1,p3:3,p2:{a:1,b:2,c:3,d:{a:1,b:2}}
      })
    })
   
    describe('Array',function(){
      it('should replace array',function(){
        var a=[1,2,{a:3,b:4}];
        var b=[5,6,7];

        utils.deepMegre(a,b).should.eql(a);
      }) 
      
      it('should remove object with _removed',function(){
        var a={
          _removed:[{
            a:1,b:2
          }]
        }
        
        var b=[{a:2,b:2},{a:1,b:2}];

        utils.deepMegre(a,b).should.eql([{a:2,b:2}]);
      }) 
    })
  })
})

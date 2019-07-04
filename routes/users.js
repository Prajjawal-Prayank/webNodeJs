var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var util = require('util');
var code=0;       //helps in redirection when notice request is added successfully

//----------------------------------------------------Showing the Notices--------------------------------------------------------------//

router.get('/student_notice',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_userHome');
  else  
  {
    var db=req.db;
    var collection=db.get('student_notices');
    collection.find({},function(err,result){
      res.render('student_notice',{notices:result,code:code});
      code=0;
    })
  }
});


//--------------------------------------------------For teachers and staff--------------------------------------------------------------//

router.get('/other_notice',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_userHome');
  else  
  {
    var db=req.db;
    var collection=db.get('other_notices');
    collection.find({},function(err,result){
      res.render('other_notice',{notices:result,code:code});
      code=0;
    })
  }
});

//--------------------------------------------------Uploading in request table-------------------------------------------------------------//

router.post('/upload1',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_userHome');
else  
  {
    var db=req.db;
    var collection=db.get('notice_requests');
    var form = new formidable.IncomingForm();
    form.uploadDir = "/nodeJS/notice_board/public/uploads";
    form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
        if(err)
          console.log("error in parsing file!");
          
          if(files.upload.name!='')
            var path=files.upload.path;
          else  
            var path='';  
          var myobj={
            subject:fields.subject,
            body:fields.body,
            path:path
          };

          collection.insert(myobj,function(error,result){
                if(error)
                  console.log("error in insertion!");
                else{
                  console.log("successful insertion");
                  code=1;
                  res.redirect('/users/student_notice');
                }  
          });

    });

    
  }
});


router.post('/upload2',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_userHome');
else  
  {
    var db=req.db;
    var collection=db.get('notice_requests');
    var form = new formidable.IncomingForm();
    form.uploadDir = "/nodeJS/notice_board/public/uploads";
    form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
        if(err)
          console.log("error in parsing file!");
          
          if(files.upload.name!='')
            var path=files.upload.path;
          else  
            var path='';  
          var myobj={
            subject:fields.subject,
            body:fields.body,
            path:path
          };

          collection.insert(myobj,function(error,result){
                if(error)
                  console.log("error in insertion!");
                else{
                  console.log("successful insertion");
                  code=1;
                  res.redirect('/users/other_notice');
                }  
          });

    });

    
  }
});






module.exports = router;

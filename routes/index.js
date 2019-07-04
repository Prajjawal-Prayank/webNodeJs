var express = require('express');
var router = express.Router();
var bcrypt=require('bcrypt');
var saltRounds=9;
var passport=require('passport');
var LocalStrategy = require('passport-local').Strategy;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { code:0 });           
});



//-----------------------------------------------------------for signup------------------------------------------------------------------//
router.post('/signup',function(req,res){
    var body=req.body;
    var username=body.username;
    var email=body.email;
    var password=body.password;
    var confirm=body.confirm;
    var pattern = /[^@]*@[^@]*/g;
    var result1 = email.match(pattern);
    var strongPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/g;
    var result2=password.match(strongPass);


    if(result1!=email)
    {
      console.log("Invalid email-id");
      res.render("home",{code:1,username,password,confirm});
    }

    else if(password.length < 8)
    {
      console.log("Password must be atleast 8 characters long!");
      res.render("home",{code:2,username,email});
    }

    else if(!result2)
    {
      console.log("Not a strong password!");
      res.render("home",{code:3,username,email});
    }

    else if(password != confirm)
    {
      console.log('Password and confirm password do not match!');
      res.render("home",{code:4,username,email,password});
    }
    
 //   console.log("this got printed");       //ALERT!!   this also gets printed
    

    

    else  //1
    {
      var db=req.db;
      var collection=db.get('userlist');    //userlist is the name of the collection

      var query1={username:username};
      var query2={email:email};
      collection.find(query1,function(err,result){       //check for similar username
   
          if(err) 
            console.log("error in finding similar username");
          else if(result.length==0)                       //username not taken ;check for email     
          {
            collection.find(query2,{email:1},function(error,result_e){        //check for similar email id
              if(err)
                console.log("error in finding similar email id");
              else if(result_e.length==0)              //email id is also unique.PROCEED to enter data in database
              {
                bcrypt.hash(password, saltRounds, function(err, hash) {  
                  if(err) 
                    console.log(err);
                 
                 else //3
                 {
                  var myobj={username:username,email:email,password:hash,status:"activated"};                 
                  collection.insert(myobj,function(err,result){
                  if(err)
                    console.log("error detected");
                   else
                   {
                    console.log("successful execution"); 
                    res.render("home",{code:7});            //successful signup. may login now
                   }
                 
                   });    //closing of .insert()
                  }       //closing of else 3
                });       //closing of bcrypt 
              } 
              else
              {
                console.log(result_e);
                res.render("home",{code:6,username,email,password,confirm});    //email_id already enrollred
              } 
            });
             
          }
          
           else 
            {
            //  console.log(result);                    //this will work and print the entire object
            //  console.log(result.username);          //this won't work.it will have problems with recursive refferences.
                                                      //do result[i].username where i is index .also, result is an array
              res.render("home",{code:5,username,email,password,confirm});              //username already taken 
            }   
      });

          
    }           //closing of else 1

});



//----------------------------------------------------------------for login----------------------------------------------------------------//
/*router.post('/login',function(req,res){
  var body=req.body;
  var username=body.l_username;
  var password=body.l_password;
  var db=req.db;
  var collection=db.get('userlist');
  var query1={username:username}; 
 
  collection.find(query1,function(err,result){  
      if(err)
        console.log("Some error occured in finding username");
      else if(result.length==0)
      {
        console.log("Invalid Username");
        res.render('home',{code:8});        //Invalid Username
      }
      else                                  //username matched.Check for password.
      {
      //  console.log(result[0].password);  //works fine
          bcrypt.compare(password,result[0].password , function(err, res) {
          //console.log(res);
          if(err)
            console.log(err);
          if(res==true)
          {
            console.log("validation successful");
          }
          else
          {
            console.log("validation failed");
          }
       });
      }  
  });
});
*/

//------------------------------------------------------------login via passport api------------------------------------------------------//
//defining local strategy
var login_errCode=0;
var Username;
router.get('/notice', function(req, res, next) {
//  console.log(req.user);
  if(typeof req.user=="undefined")
    res.render('go_userHome');
  else  
    res.render('page1');           
});

/*                                                        originally used Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'l_username',
  passwordField: 'l_password',
  passReqToCallback: true

},
  function(req,username, password, done) {
    var db=req.db;
    var collection=db.get('userlist');
      collection.find({
        username: username
      }, function(err, user) {  
        if (err) {
          return done(err);
        }
        
        if (user.length==0) {
          return done(null, false);
        }

        else
        {
          bcrypt.compare(password,user[0].password , function(err, res) {
            if(err)
              console.log(err);
            if(res==false)
              return done(null, false);
            else
              return done(null, user);
          });       
        }
      });
  }
));
*/

passport.use(new LocalStrategy({
  usernameField: 'l_username',
  passwordField: 'l_password',
  passReqToCallback: true

},
  function(req,username, password, done) {
    var db=req.db;
    var collection=db.get('userlist');
      collection.find({
        username: username
      }, function(err, user) {  
        if (err) {
          return done(err);
        }
        
        if (user.length==0) {login_errCode=8;
          return done(null, false);
        }

        else if(user[0].status=="deactivated")
        {
          login_errCode=11;
          return done(null,false);
        }

        else
        {
          bcrypt.compare(password,user[0].password , function(err, res) {
            if(err)
              console.log(err);
            if(res==false)
            {
              login_errCode=10;   //wrong password
              Username=username;
              return done(null, false);
            }
            else
              return done(null, user);
          });       
        }
      });
  }
));


router.get('/error',function(req,res){
 // req.flash('info','Invalid credentials! Could not log in.');
 // console.log(req.flash('info'));
 // res.redirect('/');
 if(login_errCode==10)
 {
   res.render('home',{code:login_errCode,Username});
   Username="";
 }
 else
  res.render('home',{code:login_errCode}); 
 login_errCode=0;
});

router.post('/login', 
  passport.authenticate('local', { successRedirect: '/notice',
  failureRedirect: '/error' }),
  );


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//-----------------------------------------Changing User Credentials and redirecting to student notice------------------------------------//

router.post('/changeUser',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_userHome');
  else 
  {
    var db=req.db;
    var collection=db.get('userlist');
    var collection2=db.get('student_notices');
    var username=req.body.username;
    collection2.find({},function(err,docs){
      if(err)
        console.log("error in find");
        collection.find({username:username},function(err,result){
          if(err)
            console.log("error in fetching user.");
          if(result.length!=0)
            res.render('student_notice',{notices:docs,code:2,username}); //Username already Taken.
          else{
            collection.update({username:req.user[0].username},{$set:{username:username}},function(err){
              if(err)
                console.log("Error in updating Username");
                req.user[0].username=username;
              res.render('student_notice',{notices:docs,code:3});     //Username Successfully updated  
            });
          }  
        });  
    });
  }
});


router.post('/changeEmail',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_userHome');
  else 
  {
    var db=req.db;
    var collection=db.get('userlist');
    var collection2=db.get('student_notices');
    var email=req.body.email;
    collection2.find({},function(err,docs){
      if(err)
        console.log("error in find");
      collection.find({email:email},function(err,result){
        if(err)
            console.log("error in fetching user.");
        if(result.length!=0)  
          res.render('student_notice',{notices:docs,code:4,email});     //email id already registered
        else{
          var pattern = /[^@]*@[^@]*/g;
          var result1 = email.match(pattern);
          if(result1!=email)
              res.render("student_notice",{notices:docs,code:10,email});   //not a valid email-id
          else{
            collection.update({username:req.user[0].username},{$set:{email:email}},function(err){
              if(err)
                  console.log("Error in updating Email-Id");
                req.user[0].email=email;    
                res.render('student_notice',{notices:docs,code:5});     //email id successfully updated
            });
          }    
         }     
      });  
    })
  }
});


router.post('/changePass',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_userHome');
  else 
  {
    var db=req.db;
    var collection=db.get('userlist');
    var collection2=db.get('student_notices');
    collection2.find({},function(err,docs){
      if(err)
        console.log("error in find");
      var body=req.body;
      var password=body.oldPass;
      var newPass=body.newPass;
      var confirmPass=body.confirmPass;  
      collection.find({username:req.user[0].username},function(err,result){
        if(err)
          console.log("error");//console.log(result);
        bcrypt.compare(password,result[0].password,function(err,result1){
          if(err)
            console.log("error");
          if(result1==false)  
            res.render('student_notice',{notices:docs,code:6});   //wrong old password  
          else{
            if(newPass!=confirmPass)
              res.render('student_notice',{notices:docs,code:7,password,newPass}); 
            else{
              var strongPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/g;
              var result2=newPass.match(strongPass);
              if(!result2)
                res.render('student_notice',{notices:docs,code:8,password});
              else{
                bcrypt.hash(newPass, saltRounds, function(err, hash){
                  if(err)
                    console.log("error in hashing");
                  collection.update({username:req.user[0].username},{$set:{password:hash}},function(err){
                    if(err)
                      console.log("error in updating password");
                    req.user[0].password=hash;  
                    res.render('student_notice',{notices:docs,code:9});   
                  });  
                });
              }  
            }  
          }  
        }); 
      });
    });
  }
});


//------------------------------------------Changing User Credentials and redirecting to other notice-----------------------------------//




router.post('/changeUser_o',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_userHome');
  else 
  {
    var db=req.db;
    var collection=db.get('userlist');
    var collection2=db.get('other_notices');
    var username=req.body.username;
    collection2.find({},function(err,docs){
      if(err)
        console.log("error in find");
        collection.find({username:username},function(err,result){
          if(err)
            console.log("error in fetching user.");
          if(result.length!=0)
            res.render('other_notice',{notices:docs,code:2,username}); //Username already Taken.
          else{
            collection.update({username:req.user[0].username},{$set:{username:username}},function(err){
              if(err)
                console.log("Error in updating Username");
                req.user[0].username=username;
              res.render('other_notice',{notices:docs,code:3});     //Username Successfully updated  
            });
          }  
        });  
    });
  }
});




router.post('/changeEmail_o',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_userHome');
  else 
  {
    var db=req.db;
    var collection=db.get('userlist');
    var collection2=db.get('other_notices');
    var email=req.body.email;
    collection2.find({},function(err,docs){
      if(err)
        console.log("error in find");
      collection.find({email:email},function(err,result){
        if(err)
            console.log("error in fetching user.");
        if(result.length!=0)  
          res.render('other_notice',{notices:docs,code:4,email});     //email id already registered
        else{
          var pattern = /[^@]*@[^@]*/g;
          var result1 = email.match(pattern);
          if(result1!=email)
              res.render("other_notice",{notices:docs,code:10,email});   //not a valid email-id
          else{
            collection.update({username:req.user[0].username},{$set:{email:email}},function(err){
              if(err)
                  console.log("Error in updating Email-Id");
                req.user[0].email=email;  
                res.render('other_notice',{notices:docs,code:5});     //email id successfully updated
            });
          }    
         }     
      });  
    })
  }
});


router.post('/changePass_o',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_userHome');
  else 
  {
    var db=req.db;
    var collection=db.get('userlist');
    var collection2=db.get('other_notices');
    collection2.find({},function(err,docs){
      if(err)
        console.log("error in find");
      var body=req.body;
      var password=body.oldPass;
      var newPass=body.newPass;
      var confirmPass=body.confirmPass;  
      collection.find({username:req.user[0].username},function(err,result){
        if(err)
          console.log("error");//console.log(result);
        bcrypt.compare(password,result[0].password,function(err,result1){
          if(err)
            console.log("error");
          if(result1==false)  
            res.render('other_notice',{notices:docs,code:6});   //wrong old password  
          else{
            if(newPass!=confirmPass)
              res.render('other_notice',{notices:docs,code:7,password,newPass}); 
            else{
              var strongPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/g;
              var result2=newPass.match(strongPass);
              if(!result2)
                res.render('other_notice',{notices:docs,code:8,password});
              else{
                bcrypt.hash(newPass, saltRounds, function(err, hash){
                  if(err)
                    console.log("error in hashing");
                  collection.update({username:req.user[0].username},{$set:{password:hash}},function(err){
                    if(err)
                      console.log("error in updating password");
                    req.user[0].password=hash;
                    res.render('other_notice',{notices:docs,code:9});   
                  });  
                });
              }  
            }  
          }  
        }); 
      });
    });
  }
});







//------------------------------------------------------------LOGOUT-------------------------------------------------------------------//

router.get('/logout', function(req, res){
  if(typeof req.user=="undefined")
    res.render('go_userHome');
  else  
  {
    req.logOut();     //even if the cookie is not deleted from client browser, it will still work as the contents of cookie get changed when
                    //this is invoked
  req.session.destroy(function() {
   res.clearCookie('connect.sid',{path:'/'});
   //res.cookie("connect.sid", "", { expires: new Date(Date.now()+0),httpOnly:true,domain:'localhost:3000', path: '/',overwrite: true, });
    res.redirect('/');
    
  });
  }
});



//------------------------------------------------------------ADMIN-------------------------------------------------------------------//
//student notice,teacher notice,request notice,userlist,change password,logout


router.get('/admin_page',function(req,res){
  res.render('admin_login',{code:0});
});


router.get('/admin',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else  
    res.render('admin_activity');
})



passport.use('admin',new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true

},
  function(req,username, password, done) {
    var db=req.db;
    var collection=db.get('admin');
      collection.find({
        username: username
      }, function(err, user) {  
        if (err) {
          return done(err);
        }
        
        if (user.length==0) {
          login_errCode=8;
          return done(null, false);
        }

        else
        {
          bcrypt.compare(password,user[0].password , function(err, res) {
            if(err)
              console.log(err);
            if(res==false)
            {
              login_errCode=10;
              Username=username;
              return done(null, false);
            }
            else
              return done(null, user);
          });       
        }
      });
  }
));




router.get('/error1',function(req,res){
  if(login_errCode==10)
  {
    res.render('admin_login',{code:login_errCode,Username});     //wrong pass
    Username="";
  }
  else
  res.render('admin_login',{code:login_errCode});     //invalid username  
 });
 


router.post('/admin_login',
  passport.authenticate('admin', { successRedirect: '/admin',
  failureRedirect: '/error1' }),
);


//-----------------------------------------------------------Admin change password------------------------------------------------------//

router.get('/admin_changePass',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else  
    res.render('change_password',{code:0});
});

router.post('/admin_changePassword',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else{  
  var body=req.body;
  var password=body.oldPass;
  var newPass=body.newPass;
  var confirmPass=body.confirmPass;
  var db=req.db;
  var collection=db.get('admin');
  collection.find({},function(err,result){
    if(err)
      console.log("error in finding admin");
      bcrypt.compare(password,result[0].password , function(err, result1) {     //check for correct current password
        if(err)
          console.log(err);
        if(result1==false)
          res.render('change_password',{code:1});   //Wrong current password
        else                                        //Check for strong password
        {
          var strongPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/g;
          var result2=newPass.match(strongPass);
          if(!result2)
            res.render('change_password',{code:2,password});   //not a strong password
          else                                        //if strong pass, check same confirm pass
          {
            if(newPass!=confirmPass)
              res.render('change_password',{code:3,password,newPass});   //new pass and confirm dont match
            else
            {
              bcrypt.hash(newPass, saltRounds, function(err, hash){
                if(err)
                  console.log("error in hashing new password");
                collection.update({password:result[0].password},{$set:{password:hash}},function(err){
                  if(err)
                    console.log("error in updation");
                  req.user[0].password=hash;  
                  res.render('admin_activity');   //successful updation  
                });
              });
            }  
          }  
        }
      });   
  });
  }
});


//------------------------------------------------------Admin change username------------------------------------------------------//

router.get('/admin_changeUser',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else  
    res.render('change_username',{code:0});
});


router.post('/admin_changeUsername',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else  
  {
    var db=req.db;
    var collection=db.get('admin');
    collection.update({username:req.user[0].username},{$set:{username:req.body.username}},function(err){
      if(err)
        console.log("error in username updation!");
      req.user[0].username=req.body.username;
      res.render('admin_activity');   
    })
  }
});





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});



//-----------------------------------------------------------Admin Page-------------------------------------------------------------//

router.get('/admin_snotice',function(req,res){      //Student Notice
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else  
  {
    var db=req.db;
    var collection=db.get('student_notices');
    collection.find({},function(err,result){
      if(err)
        console.log("Error in fetching data");
        res.render('admin_board',{notices:result,title:"Student Notices",code:0});
    });
  }
});

router.get('/admin_tnotice',function(req,res){      //other Notice
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else  
  {
    var db=req.db;
    var collection=db.get('other_notices');
    collection.find({},function(err,result){
      if(err)
        console.log("Error in fetching data");
        res.render('admin_boardOthr',{notices:result,title:"Teacher and Staff Notices",code:0});
    });
  }
});


router.get('/admin_rnotice',function(req,res){      //Request Notice
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else  
  {
    var db=req.db;
    var collection=db.get('notice_requests');
    collection.find({},function(err,result){
      if(err)
        console.log("Error in fetching data");
        res.render('notice_requests',{notices:result,title:"Notice Requests",code:0});
    });
  }
});


//-----------------------------------------------------------------Remove Notice-------------------------------------------------------//

router.post('/remove_snotice',function(req,res){      //for deleting a notice in student notice section
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else
  {
    var db=req.db;
    var collection=db.get('student_notices');
    //console.log(req.body.subject1);
    var myobj={subject:req.body.subject1};
    collection.remove(myobj,function(err,result){
      if(err)
        console.log("Error in removing notice;"); 

      collection.find({},function(err,docs){
        if(err)
          console.log("Error in fetching data");
          if(result.result.n==0)
            res.render('admin_board',{notices:docs,title:"Student Notices",code:1});    //invalid subject of notice
          else
          res.render('admin_board',{notices:docs,title:"Student Notices",code:2});      //successful deletion
      });
  
    });
  }
});



router.post('/remove_onotice',function(req,res){        //for deleting a notice in other notice section
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else
  {
    var db=req.db;
    var collection=db.get('other_notices');
    //console.log(req.body.subject);
    var myobj={subject:req.body.subject1};
    collection.remove(myobj,function(err,result){
      if(err)
        console.log("Error in removing notice;");

      collection.find({},function(err,docs){
        if(err)
          console.log("Error in fetching data");
          if(result.result.n==0)
            res.render('admin_boardOthr',{notices:docs,title:"Teacher and other staff Notices",code:1});    //invalid subject of notice
          else
          res.render('admin_boardOthr',{notices:docs,title:"Teacher and other staff Notices",code:2});      //successful deletion
      });
  
    });
  }
});




router.post('/remove_request',function(req,res){        //for deleting a notice in notice request section
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else
  {
    var db=req.db;
    var collection=db.get('notice_requests');
    //console.log(req.body.subject);
    var myobj={subject:req.body.subject1};
    collection.remove(myobj,function(err,result){
      if(err)
        console.log("Error in removing notice;");

      collection.find({},function(err,docs){
        if(err)
          console.log("Error in fetching data");
          if(result.result.n==0)
            res.render('notice_requests',{notices:docs,title:"Notice Requests",code:1});    //invalid subject of notice
          else
          res.render('notice_requests',{notices:docs,title:"Notice Requests",code:2});      //successful deletion
      });
  
    });
  }
});


//-----------------------------------------------------------Moving Notices-----------------------------------------------------------//
//d


router.post('/move_snotice',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else
  {
    var db=req.db;
    var collection=db.get('notice_requests');
    var subject=req.body.subject2;
    collection.find({subject:subject},function(err,docs){
      if(err)
        console.log("Error in fetching data from student notice while moving.");
      if(docs.length==0)//dobara find lagao
      {
        collection.find({},function(err,result){
          if(err)
            console.log('error in finding');
          res.render('notice_requests',{notices:result,title:"Notice Requests",code:1});
        });    
      }
       
      else                                //enter data in student notice and remove from request notice
      {
        var myobj={
          subject:subject,
          body:docs[0].body,
          path:docs[0].path
        };
        var collection2=db.get('student_notices');
        collection2.insert(myobj,function(err,result1){
          if(err)
            console.log("error in inserting while moving");
        });
        collection.remove({subject:subject},function(err,result2){
          if(err)
            console.log("error in removing while moving");
          if(result2.result.n!=0)
          {
            collection.find({},function(err,result){
              if(err)
                console.log('error in finding');
                res.render('notice_requests',{notices:result,title:"Notice Requests",code:3});
            });
          }   
        });
      }  
    });
  }
});








router.post('/move_onotice',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else
  {
    var db=req.db;
    var collection=db.get('notice_requests');
    var subject=req.body.subject3;
    collection.find({subject:subject},function(err,docs){
      if(err)
        console.log("Error in fetching data from student notice while moving.");
      if(docs.length==0)//dobara find lagao
      {
        collection.find({},function(err,result){
          if(err)
            console.log('error in finding');
          res.render('notice_requests',{notices:result,title:"Notice Requests",code:1});
        });    
      }
       
      else                                //enter data in student notice and remove from request notice
      {
        var myobj={
          subject:subject,
          body:docs[0].body,
          path:docs[0].path
        };
        var collection2=db.get('other_notices');
        collection2.insert(myobj,function(err,result1){
          if(err)
            console.log("error in inserting while moving");
        });
        collection.remove({subject:subject},function(err,result2){
          if(err)
            console.log("error in removing while moving");
          if(result2.result.n!=0)
          {
            collection.find({},function(err,result){
              if(err)
                console.log('error in finding');
                res.render('notice_requests',{notices:result,title:"Notice Requests",code:3});
            });
          }   
        });
      }  
    });
  }
});


//-----------------------------------------------------------Userlist---------------------------------------------------------------//

router.get('/admin_userlist',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else
  {
    var db=req.db;
    var collection=db.get('userlist');
    collection.find({},function(err,result){
      if(err)
        console.log("Error in fetching data");
      res.render('userlist',{userlist:result,title:"Registered Users",code:0});
    });
  }
});


router.post('/activate',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else
  {
    var db=req.db;
    var collection=db.get('userlist');
    var username=req.body.usernameA;
    collection.find({},function(err,docs){
      if(err)
        console.log("error in finding user from userlist");  
      collection.find({username:username},function(err,result){
        if(err)
          console.log("error in finding user from userlist");
        if(result.length==0)
          res.render('userlist',{userlist:docs,title:"Registered Users",code:1});   //Invalid username
        else if(result[0].status=="activated")  
          res.render('userlist',{userlist:docs,title:"Registered Users",code:2});   //User already activated
        else{
          collection.update({username:username},{$set:{status:"activated"}},function(err){
            if(err)
              console.log("error in activating status.");
          collection.find({},function(err,docs1){
            if(err)
              console.log("error in finding user from userlist");
            res.render('userlist',{userlist:docs1,title:"Registered Users",code:3}); //Status successfully updated  
          });
        });    
        }  
      });
    });
  }
});




router.post('/deactivate',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else
  {
    var db=req.db;
    var collection=db.get('userlist');
    var username=req.body.usernameD;
    collection.find({},function(err,docs){
      if(err)
        console.log("error in finding user from userlist");  
      collection.find({username:username},function(err,result){
        if(err)
          console.log("error in finding user from userlist");
        if(result.length==0)
          res.render('userlist',{userlist:docs,title:"Registered Users",code:1});   //Invalid username
        else if(result[0].status=="deactivated")  
          res.render('userlist',{userlist:docs,title:"Registered Users",code:4});   //User already activated
        else{
          collection.update({username:username},{$set:{status:"deactivated"}},function(err){
            if(err)
              console.log("error in activating status.");
          
          collection.find({},function(err,docs1){
            if(err)
              console.log("error in finding user from userlist");
            res.render('userlist',{userlist:docs1,title:"Registered Users",code:3}); //Status successfully updated  
          });
         }); 
        }  
      });
    });
  }
});



router.post('/remove',function(req,res){
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else
  {
    var db=req.db;
    var collection=db.get('userlist');
    var username=req.body.usernameR;
    collection.find({},function(err,docs){
      if(err)
        console.log("error in finding user from userlist");  
      collection.find({username:username},function(err,result){
        if(err)
          console.log("error in finding user from userlist");
        if(result.length==0)
          res.render('userlist',{userlist:docs,title:"Registered Users",code:1});   //Invalid username
        else{
          collection.remove({username:username},function(err){
            if(err)
              console.log("error in removing user.");
          
          collection.find({},function(err,docs1){
            if(err)
              console.log("error in finding user from userlist");
            res.render('userlist',{userlist:docs1,title:"Registered Users",code:5}); //User was successfully removed 
          });
         }); 
        }  
      });
    });
  }
});





//------------------------------------------------------------Admin Logout------------------------------------------------------------//

router.get('/admin_logout', function(req, res){
  if(typeof req.user=="undefined")
    res.render('go_adminHome');
  else  
  {
    req.logOut();     //even if the cookie is not deleted from client browser, it will still work as the contents of cookie get changed when
                    //this is invoked
  req.session.destroy(function() {
   res.clearCookie('connect.sid',{path:'/'});
   //res.cookie("connect.sid", "", { expires: new Date(Date.now()+0),httpOnly:true,domain:'localhost:3000', path: '/',overwrite: true, });
    res.redirect('/admin_page');
    
  });
  }
});






module.exports = router;

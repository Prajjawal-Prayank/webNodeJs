var express = require('express');
var router = express.Router();
var app=express();

/*function goHome()
{
    router.post('/',function(req,res)
    {
        //res.redirect('back');
        //res.redirect(req.originalUrl);
        res.redirect(req.get('referer'));
    });
}
*/
function alrtmsg(msg)
{
    alert(msg);
}

module.exports = {
    hello: function() {
        alrtmsg("Password and confirm password do not match!");
       return "Hello";
    }
 }


function hello()
{
   // alert("Password and confirm password do not match!");
    return "Hello";
}


function authenticate(form)
{
    var password=form.password.value;
    var confirm=form.confirm.value;

  /*  if(password.length < 8)
    {
        alert("Password should be atleast 8 characters long!");
        goHome();
    /*    router.use('/',function(req,res)
        {
            res.redirect('home');
        })
    */    
  //  }
    if(password!=confirm)      
    {
        alert("Password and confirm password do not match!");
     //   goHome();
       // app.use('/',function(req,res)
     //   {
           // res.sendFile('home');
     //      res.redirect('home');
          //res.redirect(req.get('referer'));
        //  res.render('home', function (err, html) {
        //    res.send(html)
        //  });
      
    }
    else
    {

    }
}


//module.exports=app;
//var express = require('express');
//var router = express.Router();
//var app=express();

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
/*
module.exports = {
    hello: function() {
       return "Hello";
    }
 }
*/

function check(code,msg)//
{
    if(code == 1)
        alert("Invalid email-id");
    if(code==2)
        alert('Password must be atleast 8 characters long!') ; 
    if(code==3)
        alert("Not a strong password!");  
    if(code==4)
        alert("Password and confirm password do not match!");
    if(code==5)
        alert("Username already taken! Try a different one .");
    if(code==6)
        alert("Email_id is already registered.");              
    if(code==7)
        alert("successful signup! You may login now.");
    if(code==8)
        alert("Invalid Username"); 
    if(code==9)
        alert("Invalid credentials! Could not log in.");
    if(code==10)
        alert('Wrong Password');
    if(code==11)
        alert("Your account was blocked by ADMIN.Contact ADMIN for more details on this matter.");       
}







//module.exports=app;
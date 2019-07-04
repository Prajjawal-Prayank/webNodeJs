function myfunction(evt, name) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(name).style.display = "block";
    evt.currentTarget.className += " active";
  }
  
  
  
  

  if(code==1)
    document.getElementById("add").click();
  else if(code==2)
    document.getElementById("usr").click();
  else if(code==4)
    document.getElementById("eid").click(); 
  else if(code==6)
    document.getElementById("pass").click();
  else if(code==7)
    document.getElementById("pass").click();  
  else if(code==8)
    document.getElementById("pass").click();
  else if(code==10)
    document.getElementById("eid").click();
  else
    document.getElementById("defaultOpen").click();  

  
  
  
  var acc = document.getElementsByClassName("accordion");
  var i;
  
  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }

  


var modal = document.getElementById('id01');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

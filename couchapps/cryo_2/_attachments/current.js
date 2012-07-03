var db = $.couch.db(window.location.pathname.split("/")[1]);

var cryoVal= new Array();

$(document).ready(function() {
  
  //fill in the nav bar at the top of the page
  //using info in the webinterface database
  $.couch.db("webinterface").openDoc("navbar", {
    success: function(data) {
      var items = [];

      for (var link in data['list']){
        items.push('<li ><a href="' + link + '">' + data['list'][link] + '</a></li>');
      }
      $('#navbarList').append( items.join('') );

    }
  });

  db.view("cryo_2/getData2",  {
       reduce:true,
       group_level:1,
       async:false,
       success:function(data){ 
           var dataPoints = [];

           jQuery.each(data.rows, function(i, row){
             cryoVal.push(row.key[0]);
               
           });
           fillData();
           
        }

   });
   
});

function fillData()
{
    db.view("data/byipaddress",  {
        key:"134.158.176.112",
        reduce:false,
        descending:true,
        include_docs:true,
        limit:1,
        success:function(data){ 
            
            var doc = data.rows[0].doc;

            if (doc){
                
                addToStats(doc);
            }
            else{
                displayError();
            }
            
         }
         
    });
}

function addToStats(doc){
    var p = document.getElementById("date");
    var today = new Date(doc.utctime*1000.0)
    p.innerHTML = today.toUTCString();
    
    var p = document.getElementById("datatitle");
    p.innerHTML = "";
    
    var tbl = document.getElementById('data');
	var tblbody = tbl.getElementsByTagName("tbody");
	//clear the table in case its allready full of elements
	for(var i = 0; i < tblbody.length; i++){tbl.removeChild(tblbody[i]);}
	
	var tblbody = document.createElement("tbody");
	
    for (var i = 0; i <  cryoVal.length; i++) {

        if (doc.hasOwnProperty(cryoVal[i])) {
            var row = document.createElement("tr");
                
            var cell = document.createElement("td");
            cell.appendChild(document.createTextNode( cryoVal[i] ));
            row.appendChild(cell);
                
            var cell = document.createElement("td");
            cell.appendChild(document.createTextNode( doc[cryoVal[i]] ));
            row.appendChild(cell);
                
            tblbody.appendChild(row);
        }
    }
    tbl.appendChild(tblbody);
    
}

function displayError(){
    var p = document.getElementById("datatitle");
    p.innerHTML = "<h1>Failed to get document from the database.</h1>";

}
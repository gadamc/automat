var db = $.couch.db(window.location.pathname.split("/")[1]);

var cryoVal= new Array();

var cryoDescriptions = {
  'T_Bolo':'T of the bolo plate (K)', 
  'P_regul':'regulation power on the bolo plate (microW)', 
  'T_Speer':'T of the mixing chamber (K)', 
  'T_PT1':'', 
  'T_B1K':'T of the 1K plate (K)', 
  'P_B1K':'pressure on the He4 pumping line on the 1K box (mbar)',
  'P_injection':'injection pressure of the He3 in the dilution circuit (mbar)', 
  'debit':'rate of He3 in the dilution circuit (micromol/s)', 
  'I_Alim1':'current on the BB power supply (top left) (A)', 
  'I_Alim2':'current on the BB power supply (bottom left) (A)',
  'I_Alim3':'current on the BB power supply (top right) (A)', 
  'I_Alim4':'current on the BB power supply (bottom left) (A)', 
  'GM_P':'', 
  'PT_P':'', 
  'Pt_1':'',
  'Pt_2':'power supply of the Pulse Tube 2 (50K screen)', 
  'Pt_3':'', 
  'Hc1':'height1 of the cryostat (mm)', 
  'Hc2':'height2 of the cryostat (mm)', 
  'Hc3':'height3 of the cryostat (mm)', 
  'Hc4':'height4 of the cryostat (mm)',
  'T_100K':'T of the 100K screen, cold electronics (K), for info it replaces the old T_PT1',
'T_50K':'T of the 50K screen (K)',
'Ba_grotte':'Ba calibration source',
'Ba_nemo':'Ba calibration source',
'Co_France':'Co calibration and regeneration source',
'Co_Italie':'Co calibration and regeneration source',
'GM1_Power':'Power of the GM1 (4K reliquefier)',
'Pt2_GM2_GM3_Power':'Main power of the PT2, GM2 and GM3 machines',
'GM2_50K':'Power on the GM2 (2nd machine on the cryoline)',
'GM3_100K':'Power on the GM2 (1rst machine on the cryoline)',
'circu':'Power on the circulator pump on the cryoline (percentage of full power)',
'Pcircu':'He4 pressure on the cryoline (bar)',
'Tcircu':'T of the circulator (°C)',
'Tcl1':'He4 output of GM3 (K)',
'Tcl2':'He4 output of GM2 (K)',
'Tcl3':'He4 output of exchanger',
'Tcl4':'He4 input of exchanger'
};


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
                
            var cell = document.createElement("td");
            cell.appendChild(document.createTextNode( cryoDescriptions[cryoVal[i]]] ));
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
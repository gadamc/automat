var db = $.couch.db(window.location.pathname.split("/")[1]);

$(document).ready(function() {
	//setLastRunOptions(null);
    //setFirstRunOptions(null);
    populateTodaydropdown("lastdaydropdown", "lastmonthdropdown", "lastyeardropdown")
    populateLastWeekdropdown("firstdaydropdown", "firstmonthdropdown", "firstyeardropdown")
    getTemperatureFromDbToPlot()
                    
    $('#getTempsId').click(function(e) {

    	//setTableTopRow();
          
        //getTemperatureFromDb();                                  
                
        getTemperatureFromDbToPlot();
                                        
     });

    
});
  /***********************************************
    * Drop Down Date select script- by JavaScriptKit.com
    * This notice MUST stay intact for use
    * Visit JavaScript Kit at http://www.javascriptkit.com/ for this script and more
    ***********************************************/

    var monthtext=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];

function populateTodaydropdown(dayfield, monthfield, yearfield){
        var today=new Date()
        var dayfield=document.getElementById(dayfield)
        var monthfield=document.getElementById(monthfield)
        var yearfield=document.getElementById(yearfield)
        for (var i=0; i<31; i++)
            dayfield.options[i]=new Option(i+1, i+1)
        dayfield.options[today.getDate()-1]=new Option(today.getDate(), today.getDate(), true, true) //select today's day
        
        for (var m=0; m<12; m++)
            monthfield.options[m]=new Option(monthtext[m], m)
            
        monthfield.options[today.getMonth()]=new Option(monthtext[today.getMonth()], today.getMonth(), true, true) //select today's month
        
        var thisyear=today.getFullYear()
        for (var y=0; y<5; y++){
            yearfield.options[y]=new Option(thisyear, thisyear)
            thisyear+=1
        }
        yearfield.options[0]=new Option(today.getFullYear(), today.getFullYear(), true, true) //select today's year
}
    
function populateLastWeekdropdown(dayfield, monthfield, yearfield){
        var lastweek=new Date()
        lastweek.setDate(lastweek.getDate()-7)
        var dayfield=document.getElementById(dayfield)
        var monthfield=document.getElementById(monthfield)
        var yearfield=document.getElementById(yearfield)
        for (var i=0; i<31; i++)
            dayfield.options[i]=new Option(i+1, i+1)
        dayfield.options[lastweek.getDate()-1]=new Option(lastweek.getDate(), lastweek.getDate(), true, true) //select last week's day
        for (var m=0; m<12; m++)
            monthfield.options[m]=new Option(monthtext[m], m)
        monthfield.options[lastweek.getMonth()]=new Option(monthtext[lastweek.getMonth()], lastweek.getMonth(), true, true) //select last weeks's month
        var thisyear=lastweek.getFullYear()
        for (var y=0; y<5; y++){
            yearfield.options[y]=new Option(thisyear, thisyear)
            thisyear+=1
        }
        yearfield.options[0]=new Option(lastweek.getFullYear(), lastweek.getFullYear(), true, true) //select today's year
}
    
function getTemperatureFromDbToPlot(){

   var chart;
   var options = { 
      chart: {
         renderTo: 'temperature-chart',
         zoomType: 'xy'
         //spacingRight: 20
      },
       title: {
         text: 'Cryostat Temperature [mK] vs UTC'
      },
       subtitle: {
          text: 'as reported by Automat server'
      },
      xAxis: {
         type: 'datetime',
         maxZoom: 1000.0* 60.0 * 10.0, // 10 minutes
         title: {
            text: null
         },
         dateTimeLabelFormats: {
            day: '%e %b',
            hour: '%e %b %H:%M'   
         },
         showFirstLabel : false
      },
      yAxis: {
         title: {
            text: null
         },
         //min: 0.6,
         //startOnTick: false,
         showFirstLabel: false,
         labels: {
                    align: 'left',
                    x: 3,
                    y: -2,
                    formatter: function() {
                        return Highcharts.numberFormat(this.value, 2);
                    }
                }
      },
      legend: {
		  align: 'left',
		  verticalAlign: 'top',
		  y: 20,
		  x: 80,
		  floating: true,
		  borderWidth: 0
      },
      tooltip: {
         shared: false,
         formatter: function() {
            return Highcharts.dateFormat('%Y-%b-%d  %H:%M:%S', this.x) +'<br/> '+ this.y +' mK';
        }
      },
      plotOptions: {
         series: {
            /*fillColor: {
               linearGradient: [0, 0, 0, 300],
               stops: [
                  [0, Highcharts.theme.colors[0]],
                  [1, 'rgba(2,0,0,0)']
               ]
            },*/
            cursor: 'pointer',
			     	point: {
			 	   	   events: {
					       	click: function() {
							 hs.htmlExpand(null, {
							 	pageOrigin: {
									x: this.pageX, 
									y: this.pageY
								},
								headingText: this.series.name,
								maincontentText: Highcharts.dateFormat('%Y-%b-%d  %H:%M:%S', this.x) +'<br/> '+ this.y +' mK',	width: 200
							});
						}
					}
            },
            lineWidth: 1,
            marker: {
               enabled: false,
               states: {
                  hover: {
                     enabled: true,
                     radius: 5
                  }
               }
            },
            shadow: false,
            states: {
               hover: {
                  lineWidth: 1                  
               }
            }
         }
      },
			
      series: [{
        //type: 'series',
		name: 'Temperature [mK]',
		lineWidth: 2,
		marker: {
	    	radius: 2
		}
      }]
    };
        
   	
    var db = $.couch.db(window.location.pathname.split("/")[1]);
    var endyear = parseInt($('#lastyeardropdown').val());
    var endmonth = parseInt($('#lastmonthdropdown').val()) + 1;
    var endday = parseInt($('#lastdaydropdown').val());
    var startyear = parseInt($('#firstyeardropdown').val());
    var startmonth = parseInt($('#firstmonthdropdown').val()) + 1;
    var startday = parseInt($('#firstdaydropdown').val());
    
    db.view("tbolo/getTbolo",  {
        endkey:[ endyear, endmonth, endday, 60],
        startkey:[startyear , startmonth, startday, 0],
        //endkey:[2011,6, 6, 60],
        //startkey:[2011,6, 6, 0],
        success:function(data){ 
            var temps = [];
            var runheadertemp;
            
            jQuery.each(data.rows, function(i, row){
                var number = row.value[1]*1000.0;  //in milikelvin
                var tnum = new Number(number+'').toFixed(parseInt(5));
                var t = parseFloat(tnum);
                var currentdate =  row.value[0]*1000.0
                temps.push([currentdate, t]);
				
            });
            
            options.series[0].data = temps;
			chart = new Highcharts.Chart(options);
         },
         error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    });
}

/*
function getTemperatureFromDb(){
	db.view("temperature/getTbolo",  {
          
    	endkey:[$('#lastyeardropdown').val(),$('#lastmonthdropdown').val(), $('#lastdaydropdown').val(), 60],,
        startkey:[$('#firstyeardropdown').val(),$('#firstmonthdropdown').val(), $('#firstdaydropdown').val(), 0],
        success:function(data){ 
        	data.rows.map(function(row) {
        	   if(row.key[2] == 0){
        	        var num = row.value[0]*1000.0;
        	        
                    addToTable(row.key[0], row.key[2], num.toFixed(5));
               }
               else if (row.key[2] > 0){
                    var num = row.value[0]*1000.0;
                    
                    addToTable("",  row.key[2], num.toFixed(5));
               }
         	});
         },
         error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    });
}

function setTableTopRow(){
	var tbl = document.getElementById('temperatureData');
	var tblbody = tbl.getElementsByTagName("tbody");
	
	for(var i = 0; i < tblbody.length; i++){tbl.removeChild(tblbody[i]);}
	
	var tblbody = document.createElement("tbody");
	tblbody.setAttribute("id","tempTableBody");
	var row = document.createElement("tr");
	
	var cell = document.createElement("td");
	cell.setAttribute("width","80");
	var celltext  = document.createTextNode(" Run ");
	cell.appendChild(celltext);
	row.appendChild(cell);
	
	var cell = document.createElement("td");
	cell.setAttribute("width","80");
	var celltext  = document.createTextNode(" File(Partition) ");
	cell.appendChild(celltext);
	row.appendChild(cell);
	
	var cell = document.createElement("td");
	cell.setAttribute("width","80");
	var celltext  = document.createTextNode(" Temp (mK) ");
	cell.appendChild(celltext);
	row.appendChild(cell);
	
	tblbody.appendChild(row);
	tbl.appendChild(tblbody);
	tbl.setAttribute("border", "0");
}

function addToTable(run, file, temperature){
	var tblbody = document.getElementById('tempTableBody');
	var row = document.createElement("tr");
	
	var cell = document.createElement("td");
	cell.setAttribute("width","80");
	var celltext  = document.createTextNode(run);
	cell.appendChild(celltext);
	row.appendChild(cell);
	
	var cell = document.createElement("td");
	cell.setAttribute("width","80");
	var celltext  = document.createTextNode(file);
	cell.appendChild(celltext);
	row.appendChild(cell);
	
	var cell = document.createElement("td");
	cell.setAttribute("width","80");
	cell.setAttribute("align","right");
	var celltext  = document.createTextNode(temperature);
	cell.appendChild(celltext);
	row.appendChild(cell);
	
	tblbody.appendChild(row);
}

function setFirstRunOptions(chosen) {
  var selbox = document.temperatureform.firstrun;
  
  
  if (!chosen || chosen == "") {
    var currentval = selbox.options[selbox.selectedIndex].value;
    selbox.options.length = 0;
    selbox.options[selbox.options.length] = new Option("all","");
    db.view("bolorunconfig/runname",  {
            
   		group:true,
   		descending:true,
        success:function(data){ 
        	data.rows.map(function(row) {
              if(row.key == currentval){
              	  selbox.options[selbox.options.length] = new Option(row.key,row.key, true, true);                          
              }
              else {
              	  selbox.options[selbox.options.length] = new Option(row.key,row.key); 
              }                      
        	});
        },
        error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    });
    
  }
  
  else if (chosen != "") {
    var currentval = selbox.options[selbox.selectedIndex].value;
    selbox.options.length = 0;
    selbox.options[selbox.options.length] = new Option("all","");
    db.view("bolorunconfig/runname",  {
            
  	  group:true,
      startkey:chosen,
      descending:true,
      success:function(data){ 
    	  data.rows.map(function(row) {
        	  if(row.key == currentval){
              	  selbox.options[selbox.options.length] = new Option(row.key,row.key, true, true);                          
              }
              else {
              	  selbox.options[selbox.options.length] = new Option(row.key,row.key); 
              }
          });
            
       },
       error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    });
    
    
  } 
  
}

function setLastRunOptions(chosen) {
  var selbox = document.temperatureform.lastrun;
  
  
  if (!chosen || chosen == "") {
    var currentval = selbox.options[selbox.selectedIndex].value;
    
    selbox.options.length = 0;
    selbox.options[selbox.options.length] = new Option("all","");
    db.view("bolorunconfig/runname",  {
            
		group:true,
		descending:true,
        success:function(data){ 
        	data.rows.map(function(row) {
                if(row.key == currentval){
              	  selbox.options[selbox.options.length] = new Option(row.key,row.key, true, true);                          
                }
                else {
              	  selbox.options[selbox.options.length] = new Option(row.key,row.key); 
                }      
            });
        },
        error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
     });
  }
  
  else  if (chosen != ""){
    var currentval = selbox.options[selbox.selectedIndex].value;
    
    selbox.options.length = 0;
    selbox.options[selbox.options.length] = new Option("all","");
    db.view("bolorunconfig/runname",  {
            
    	group:true,
        endkey:chosen,  //since i reverse the order with descending == true, i change the start/end key appropriately
        descending:true,
        success:function(data){ 
        	data.rows.map(function(row) {
            	if(row.key == currentval){
              	  selbox.options[selbox.options.length] = new Option(row.key,row.key, true, true);                          
                }
                else {
              	  selbox.options[selbox.options.length] = new Option(row.key,row.key); 
                }
            });
        },
        error: function(req, textStatus, errorThrown){alert('Error '+ textStatus);}
    });
    
  }
  
}
*/

var db = $.couch.db(window.location.pathname.split("/")[1]);

$(document).ready(function() {
	//setLastRunOptions(null);
    //setFirstRunOptions(null);
    initialPopulateDropdown(0, "lasthourdropdown", "lastdaydropdown", "lastmonthdropdown", "lastyeardropdown")
    initialPopulateDropdown(4, "firsthourdropdown", "firstdaydropdown", "firstmonthdropdown", "firstyeardropdown")
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

function initialPopulateDropdown(hourDiff, hourfield, dayfield, monthfield, yearfield){
        var today=new Date()
        today.setUTCHours(today.getUTCHours() - hourDiff)
        var hourfield=document.getElementById(hourfield)
        var dayfield=document.getElementById(dayfield)
        var monthfield=document.getElementById(monthfield)
        var yearfield=document.getElementById(yearfield)
        for (var i=0; i<24; i++)
            hourfield.options[i]=new Option(i, i)
        hourfield.options[today.getUTCHours()-1]=new Option(today.getUTCHours(), today.getUTCHours(), true, true) //select today's day
        
        for (var i=0; i<31; i++)
            dayfield.options[i]=new Option(i+1, i+1)
        dayfield.options[today.getUTCDate()-1]=new Option(today.getUTCDate(), today.getUTCDate(), true, true) //select today's day
        
        for (var m=0; m<12; m++)
            monthfield.options[m]=new Option(monthtext[m], m)
            
        monthfield.options[today.getUTCMonth()]=new Option(monthtext[today.getUTCMonth()], today.getUTCMonth(), true, true) //select today's month
        
        var thisyear=today.getUTCFullYear()
        for (var y=0; y<2; y++){
            yearfield.options[y]=new Option(thisyear, thisyear)
            thisyear-=1
        }
        yearfield.options[0]=new Option(today.getUTCFullYear(), today.getUTCFullYear(), true, true) //select today's year
}
  /*  
function initialPopulateDropdown(dayfield, monthfield, yearfield){
        var today=new Date()
        //today.setUTCDate(lastweek.getUTCDate())
        var dayfield=document.getElementById(dayfield)
        var monthfield=document.getElementById(monthfield)
        var yearfield=document.getElementById(yearfield)
        for (var i=0; i<31; i++)
            dayfield.options[i]=new Option(i+1, i+1)
        dayfield.options[today.getUTCDate()-1]=new Option(today.getUTCDate(), today.getUTCDate(), true, true) //select last week's day
        for (var m=0; m<12; m++)
            monthfield.options[m]=new Option(monthtext[m], m)
        monthfield.options[today.getUTCMonth()]=new Option(monthtext[today.getUTCMonth()], today.getUTCMonth(), true, true) //select last weeks's month
        var thisyear=today.getUTCFullYear()
        for (var y=0; y<5; y++){
            yearfield.options[y]=new Option(thisyear, thisyear)
            thisyear+=1
        }
        yearfield.options[0]=new Option(today.getUTCFullYear(), today.getUTCFullYear(), true, true) //select today's year
}
*/
    
function getTemperatureFromDbToPlot(){

   var chart;
   var options = { 
      chart: {
         renderTo: 'temperature-chart',
         zoomType: 'xy',
         animation: false
         //spacingRight: 20
      },
       title: {
         text: 'T_Bolo [mK] vs UTC'
      },
       subtitle: {
          text: 'as reported by Automat server'
      },
      xAxis: {
         type: 'datetime',
         maxZoom: 1000.0* 60.0 * 60.0, // 60 minutes
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
         enabled: false
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
            lineWidth: 1,
            marker: {
               enabled: false
            },
            shadow: false, 
            animation: false,
            enableMouseTracking: false,
            stickyTracking: false
         }
      },
			
      series: [{
        //type: 'series',
		name: 'Temperature [mK]',
		lineWidth: 1
      }]
    };
        
   	
    var db = $.couch.db(window.location.pathname.split("/")[1]);
    var endyear = parseInt($('#lastyeardropdown').val());
    var endmonth = parseInt($('#lastmonthdropdown').val()) + 1;
    var endday = parseInt($('#lastdaydropdown').val());
    var endhour = parseInt($('#lasthourdropdown').val());
    var startyear = parseInt($('#firstyeardropdown').val());
    var startmonth = parseInt($('#firstmonthdropdown').val()) + 1;
    var startday = parseInt($('#firstdaydropdown').val());
    var starthour = parseInt($('#firsthourdropdown').val());
    
    db.view("tbolo/getTbolo",  {
        endkey:[ endyear, endmonth, endday, endhour, 60],
        startkey:[startyear , startmonth, startday, starthour, 0],
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


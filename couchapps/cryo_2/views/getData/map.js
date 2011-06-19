function(doc) {
    if(doc.type == "automat_data" && doc.ipaddr == "134.158.176.112") {
	   emit( ["T_Bolo", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'], doc["utctime"]], doc["T_Bolo"]);
	
	   emit( ["T_Speer", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["T_Speer"]);
	
	   emit( ["T_PT1", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["T_PT1"]);
   	
   	    emit( ["T_B1K", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["T_B1K"]);
	
	   emit( ["P_B1K", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["P_B1K"]);  
    
        emit( ["P_injection", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["P_injection"]);
    
        emit( ["debit", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["debit"]);
        
        emit( ["I_Alim1", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["I_Alim1"]); 
        
        emit( ["I_Alim2", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["I_Alim2"]); 
        
        emit( ["I_Alim3", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["I_Alim3"]); 
        
        emit( ["I_Alim4", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["I_Alim4"]);    
    
        emit( ["GM_P", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["GM_P"]);
        
        emit( ["PT_P", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["PT_P"]);
        
        emit( ["Pt_1", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["Pt_1"]);
        
        emit( ["Pt_2", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["Pt_2"]);
        
        emit( ["Pt_3", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["Pt_3"]);
        
        emit( ["Hc1", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["Hc1"]);
        emit( ["Hc2", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["Hc2"]);
        emit( ["Hc3", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["Hc3"]);
        emit( ["Hc4", doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'],doc["utctime"]], doc["Hc4"]);
        
        
    }
}

function(doc) {
    if(doc.type == "automat_data" && doc.ipaddr == "134.158.176.112") {
      var cryoVal=['T_Bolo', 'P_regul', 'T_Speer', 'T_PT1', 'T_B1K', 'P_B1K',
                      'P_injection', 'debit', 'I_Alim1', 'I_Alim2',
                      'I_Alim3', 'I_Alim4', 'GM_P', 'PT_P', 'Pt_1',
                      'Pt_2', 'Pt_3', 'Hc1', 'Hc2', 'Hc3', 'Hc4',
                      'T_100K',
                      'T_50K',
                      'Ba_grotte',
                      'Ba_nemo',
                      'Co_France',
                      'Co_Italie',
                      'GM1_Power',
                      'Pt2_GM2_GM3_Power',
                      'GM2_50K',
                      'GM3_100K',
                      'circu',
                      'Pcircu',
                      'Tcircu',
                      'Tcl1',
                      'Tcl2',
                      'Tcl3',
                      'Tcl4'
                    ];
                      
       for (i in cryoVal) {
        if( !isNaN(doc[cryoVal[i]]) )
          emit([cryoVal[i], doc["utctime"]], parseFloat(doc[cryoVal[i]]) );
       }
	   
    }
}

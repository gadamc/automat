function(doc) {
  if(doc.type == "automat_data" && doc.ipaddr == "134.158.176.112")
    emit( [doc.date['year'], doc.date['month'], doc.date['day'], doc.date['minute'], 
 ], [doc.utctime, doc.T_Bolo]);
}
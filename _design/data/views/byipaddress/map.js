function(doc) {
  if(doc.type == "automat_data" && doc.ipaddr && doc.utctime)
      emit( [doc.ipaddr, doc.utctime], 1);
}
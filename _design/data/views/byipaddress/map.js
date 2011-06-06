function(doc) {
  if(doc.type == "automat_data" && doc.ipaddr)
  emit( doc.ipaddr, 1);
}
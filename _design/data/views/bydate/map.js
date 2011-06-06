function(doc) {
  if(doc.type == "automat_data" && doc.date)
  emit( [doc.date['year'], doc.date['month'], doc.date['day'], doc.date['hour'], doc.date['minute'], doc.date['second'], doc.date['microsecond']], 1);
}
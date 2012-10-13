function(doc) {
    if(doc.type == "automat_data" && doc.utctime)
	emit( doc.utctime, 1);
}
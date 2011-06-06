#!/usr/bin/env python


from couchdbkit import *
import sys

if __name__ == '__main__':
    uri = sys.argv[1]
    dbname = sys.argv[2]
    print uri, dbname

    s = Server(uri)
    db = s.get_or_create_db(dbname)
    print db

    loader = FileSystemDocsLoader('_design')
    loader.sync(db, verbose=True)


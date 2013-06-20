#!/usr/bin/env python

import socket, re, sys, copy, datetime, time, math
from couchdbkit import Server, Database


def ipmap(ip):
    '''
    The IP addresses of the automat servers have changed. Here the translation of the new IP address to the old IP addresses is done so as not to break down-stream analysis of the data.

    This map must be updated whenever the local automat IP address change.

   this mechanism is exactly the same mechanism that would be used if we gave each automat a name. in this case, the name is simply the old IP address. it is extremely important to always use theseIP addresses because of how thesoftware for the database website display was written.

  update list::
   april 3(ish)2013:  first map using 192.168.3 . 1/2/3 
   may 6 2013:  change to 192.168.3./11/12/13 
    '''

    ipdict = {'192.168.3.11':'134.158.176.110', '192.168.3.12':'134.158.176.111', '192.168.3.13':'134.158.176.112'}

    return ipdict.get(ip, ip)  #if we don't find a match, just return the input


def buildDoc(ip, port):
    doc = dict()
    doc['author'] = 'Adam Cox'
    doc['type'] = 'automat_data'
    dd = datetime.datetime.utcnow()
    doc['real_ip_address'] = ip  
    doc['ipaddr'] = ipmap(ip)  #this is "spoofed" to the old IP address so everything works
    doc['port'] = port
    doc['date'] = {'year':dd.year, 'month':dd.month, 'day':dd.day, 'hour':dd.hour, \
        'minute':dd.minute, 'second':dd.second, 'microsecond':dd.microsecond} 
    doc['utctime'] = time.time()
    doc['_id'] = 'automat_data_' + ip + '_' + str(doc['utctime'])

    return doc


#_______________
# format value
def formatvalue(value):
    if (isinstance(value,str)):
        # #see if this string is really an int or a float
        if value.isdigit()==True: #int
            return int(value)
        else: #try a float
            try:
                if math.isnan(float(value))==False:
                    return float(value)
            except:
                pass
        
        return value.strip('" ') #strip off any quotations and extra spaces found in the value
    else:
        return value



#_____________
# upload
def upload(db, docs):
    print 'upload', len(docs), 'docs at', datetime.datetime.utcnow()
    db.bulk_save(docs)
    del docs
    return list()


def getValues():
    
    global s
    global completeRec
    global startValues
    
    prevn = []
    stillLooking = True
    foundStartConfig = False;
    

    valuelist = list()
    flaglist = list()
    indexlist = list()
    while stillLooking:
        
        data = s.recv(4096)
        newn = data.split('\n')
        
        if completeRec.match(newn[0]) == None and len(prevn) > 0:
            newn[0] = prevn[len(prevn)-1] + newn[0]
        
        for i in range(len(newn)):
            if startValues.match(newn[i]):
                
                for j in range(i+1, len(newn)):    
                    if startRec.match(newn[i]) == False:
                        stillLooking = False
                        break
                    else:
                        if re.search(';', newn[j]):
                            valuelist.append( formatvalue(newn[j].split(';')[2]) )
                            flaglist.append( formatvalue(newn[j].split(';')[1]) )
                #print newn[j]
                
                while stillLooking:
                    prevn = copy.copy(newn)
                    data = s.recv(4096)
                    newn  = data.split('\n')
                    
                    if completeRec.match(newn[0]) == None and len(prevn) > 0:
                        newn[0] = prevn[len(prevn)-1] + newn[0]
                    
                    for ii in range(len(newn)):
                        if startRec.match(newn[ii]) == None:
                            if re.search(';', newn[ii]):
                                valuelist.append( formatvalue(newn[ii].split(';')[2]) )
                                flaglist.append( formatvalue(newn[ii].split(';')[1]) )
                        #print newn[ii]
                        else:
                            stillLooking = False
                            break
                
                break
        
        
        prevn = copy.copy(newn)
    
    
    return [valuelist, flaglist]



def getConfig():
    
    global s
    global completeRec
    global startValues
    global startConfig
    global startRec
    
    prevn = []
    stillLooking = True
    foundStartConfig = False;
    
    namelist = list()
    typelist = list()
    maxWait = 20
    count = 0
    s.send('2;2\r\n')
    print '...waiting for configuration'
    while stillLooking:
        if count > maxWait: #this is needed in case we missed the results from the command, so we force the loop to send the command again
            s.send('2;2\r\n')
            print '...waiting for configuration'
            count = 0
        count += 1
        data = s.recv(4096)
        newn = data.split('\n')
        
        if completeRec.match(newn[0]) == None and len(prevn) > 0:
            newn[0] = prevn[len(prevn)-1] + newn[0]
        
        for i in range(len(newn)):
            if startConfig.match(newn[i]):
                #print newn[i]
                
                for j in range(i+1, len(newn)):    
                    if startRec.match(newn[i]) == False:
                        stillLooking = False
                        break
                    else:
                        if re.search(';', newn[j]):
                            namelist.append( formatvalue(newn[j].split(';')[0]) )
                            typelist.append( formatvalue(newn[j].split(';')[1]) )
                #print newn[j]
                
                while stillLooking:
                    prevn = copy.copy(newn)
                    data = s.recv(4096)
                    newn  = data.split('\n')
                    
                    if completeRec.match(newn[0]) == None and len(prevn) > 0:
                        newn[0] = prevn[len(prevn)-1] + newn[0]
                    
                    for ii in range(len(newn)):
                        if startRec.match(newn[ii]) == None:
                            if re.search(';', newn[ii]):
                                namelist.append( formatvalue(newn[ii].split(';')[0]) )
                                typelist.append( formatvalue(newn[ii].split(';')[1]) )
                        #print newn[ii]
                        else:
                            stillLooking = False
                            break
                
                break
        
        
        prevn = copy.copy(newn)
    
    
    return [namelist, typelist]

def getDatabase(servname, dbn):

    try:
        serv = Server(servname)
        db = serv.get_or_create_db(dbn)

        
    except:
        try: #if we cannot connect to the given database, we try the local database before giving up
            print 'unable to connect to', servname
            print 'trying local database'
            serv = Server('http://localhost:5984')
            db = serv.get_or_create_db(dbn)

        except Exception as e:
            print e
            raise e

    print 'connected to', db.uri
    return db, serv

def main(*args):
    '''
    This is a very hacky script that reads data from an Edelweiss Automat server and places
    the results on a couch database.
    there are 5 arguments needed to run this script

        automatip = args[0].   The IP address of the Edelweiss Automat server
        port = int(args[1])    The port that the Automat server is using
        couchS = args[2]       The URI of the couchdb server ('http://127.0.0.1:5984')
        dbname = args[3]       The database name on the couchdb server
        sleepttime = args[4]   The amount of time this script will pause between data acquisition (could be useful to slow down the amount of data stored, if necessary)
    
    '''
    if len(args) != 5:
        print 'need five arguments'
        help(main)
        return
    
    automatip = args[0]
    port = int(args[1])
    couchS = args[2]
    dbname = args[3]
    sleeptime = int(args[4])

    if sleeptime > 8*60:
        print 'sleep time must be less than eight minutes, or change the maxTimeBeforeError below in the script. yes eight minutes is random, but its bigger than five and less than ten....'
        return

    print automatip, port, couchS, dbname, sleeptime

    global s
    global startRec
    global startValues
    global startConfig
    global startStates
    global startController
    global startClients
    global completeRec
    startRec = re.compile('[$]{2};\w+;\.*')
    startValues = re.compile('[$]{2};0;.*')
    startConfig = re.compile('[$]{2};1;.*')
    startStates = re.compile('[$]{2};2;.*')
    startController = re.compile('[$]{2};3;.*')
    startClients = re.compile('[$]{2};4;.*')
    completeRec = re.compile('\w+;\w+;\w+')

        
    db, coServ = getDatabase(couchS, dbname)
            
    try:    
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((automatip, port))
    
    except Exception as e:
        print e
        print datetime.datetime.utcnow(), 'socket exception... will wait one minute and then this script will sys.exit(0). we expect that the cron/launchd will restart this script.' 
        # Previously, we called main(*args), but this created very long, unreadable tracebacks if a crash occurred after many many socket requests'
        # doc = buildDoc(automatip, port)
        # subdoc = {}
        # subdoc['type'] = type(e)
        # subdoc['args'] = e.args
        # doc['exception'] = subdoc
        # db.save_doc(doc)
        
        time.sleep(60.0)
        #main(*args)
        sys.exit(0) 
        
    ret =  getConfig()
    print 'configuration found'
    namelist = ret[0]
    typelist = ret[1]
    print 'field names'
    print namelist
    print 'field types'
    print typelist

    
    checkpoint = 30
    docs = list()

    timeOfLastUpload = datetime.datetime.utcnow()
    
    maxTimeBeforeError = datetime.timedelta(minutes=8)

    maxgetvaluefails  = 10
    failcount = 0
    try:
        while failcount < maxgetvaluefails:
            if datetime.datetime.utcnow() > timeOfLastUpload + maxTimeBeforeError:
                raise Exception("max time reached! Quitting script. Hopefully Mac Launch Daemon automatically restarts")

            print datetime.datetime.utcnow()

            try:
                retv = ''
                retv = getValues()
                 #print retv
                
                flaglist = retv[1]
                valuelist = retv[0]
            except Exception as e:
                print '     get values Exception'
                failcount += 1
                print '     failcounter set to %d.' % (failcount), 'max number of consecutive fails allowed =', maxgetvaluefails
                print '     continue to next iteration'
                continue

            print '     get values success'
            failcount = 0

            try:
                doc = buildDoc(automatip, port)
            except Exception as e:
                print 'build Doc Exception'
                print doc
                raise e
            print '     build doc success'
            try:
                for i in range(len(namelist)):
                    ''' this is too much data..? we just need the values really. 
                    
                    d = list()
                    if i < len(typelist):
                    d.append(typelist[i])
                    if i < len(flaglist):
                    d.append(flaglist[i])
                    if i < len(valuelist):
                    d.append(valuelist[i])
                    '''
                    if i < len(valuelist):
                        doc[namelist[i]] = valuelist[i]
            except Exception as e:
                print 'namelist loop exception'
                raise e
            
            print '     data added to doc'
            docs.append(doc)    
            print '     doc appended'

            if len(docs)%checkpoint==0:
                db, coServ = getDatabase(couchS, dbname)
                docs = upload(db,docs)
                timeOfLastUpload = datetime.datetime.utcnow()

            if sleeptime != 0:
                s.close()
                time.sleep(sleeptime)  #sleep...
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.connect((automatip, port))

    except Exception as inst:
        print type(inst)     # the exception instance
        print inst.args      # arguments stored in .args
        print inst           # __str__ allows args to printed directly

    #finish uploading any docs.
    db, coServ = getDatabase(couchS, dbname)
    docs = upload(db,docs)


if __name__ == '__main__':
    main(*sys.argv[1:])

#!/usr/bin/env python

import socket, re, sys, copy, datetime, time
from couchdbkit import Server, Database


def main(*args):
    '''



    '''
    if len(args) != 4:
        print 'need four arguments'
        return
    
    automatip = args[0]
    port = int(args[1])
    couchS = args[2]
    dbname = args[3]

    print automatip, port, couchS, dbname

    global s
    global startRec
    global startValues
    global startConfig
    global startStates
    global startController
    global startClients
    global completeRec
    startRec = re.compile('[$]{2};\w+;\w+')
    startValues = re.compile('[$]{2};0;\w+')
    startConfig = re.compile('[$]{2};1;\w+')
    startStates = re.compile('[$]{2};2;\w+')
    startController = re.compile('[$]{2};3;\w+')
    startClients = re.compile('[$]{2};4;\w+')
    completeRec = re.compile('\w+;\w+;\w+')
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((automatip, port))
    
    ret =  getConfig()
    namelist = ret[0]
    typelist = ret[1]

    serv = Server(couchS)
    db = serv[dbname]

    print db.info()

    checkpoint = 10
    docs = list()

    try:
        while True:
            
            ret = getValues()
            flaglist = ret[1]
            valuelist = ret[0]
            
            doc = dict()
            
            for i in range(len(namelist)):
                d = {}
                if i < len(typelist):
                    d['type'] = formatvalue(typelist[i])
                if i < len(flaglist):
                    d['flag'] = formatvalue(flaglist[i])
                if i < len(valuelist):
                    d['value'] = formatvalue(valuelist[i])
                        
                doc[namelist[i]] = d
                        
        
     
            doc['author'] = 'Adam Cox'
            doc['type'] = 'automat_data'
            dd = datetime.datetime.utcnow()
            doc['ipaddr'] = automatip
            doc['port'] = port
            doc['date'] = {'year':dd.year, 'month':dd.month, 'day':dd.day, 'hour':dd.hour, 'minute':dd.minute, 'second':dd.second, 'microsecond':dd.microsecond} 
            doc['utctime'] = time.time()
            doc['_id'] = 'automat_data_' + automatip + '_' + str(doc['utctime'])

            docs.append(doc)    

            print doc['_id']

            if len(docs)%checkpoint==0:
                docs = upload(db,docs)
                
            time.sleep(15)  #sleep for 15 seconds

    except Exception as inst:
        print type(inst)     # the exception instance
        print inst.args      # arguments stored in .args
        print inst           # __str__ allows args to printed directly

    #finish uploading any docs. 
    docs = upload(db,docs)

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
    print 'upload'
    db.bulk_save(docs)
    del docs
    return list()
    
    
def getValues():

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
                #print newn[i]
            
                for j in range(i+1, len(newn)):    
                    if startRec.match(newn[i]) == False:
                        stillLooking = False
                        break
                    else:
                        if re.search(';', newn[j]):
                            valuelist.append( newn[j][newn[j].rfind(';')+1:] )
                            flaglist.append(newn[j][newn[j].find(';')+1: newn[j].rfind(';')])
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
                                valuelist.append( newn[ii][newn[ii].rfind(';')+1:] )
                                flaglist.append(newn[ii][newn[ii].find(';')+1: newn[ii].rfind(';')])
                                #print newn[ii]
                        else:
                            stillLooking = False
                            break
                    
                break

            
        prevn = copy.copy(newn)
        

    return [valuelist, flaglist]



def getConfig():
       
    prevn = []
    stillLooking = True
    foundStartConfig = False;
    
    valuelist = list()
    typelist = list()
    maxWait = 10
    count = 0
    while stillLooking:
        if count > maxWait or count == 0: #this is needed in case we missed the results from the command, so we force the loop to send the command again
            s.send('2;2\r\n')
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
                            valuelist.append( newn[j][:newn[j].find(';')] )
                            typelist.append(newn[j][newn[j].find(';')+1:])
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
                                valuelist.append( newn[ii][:newn[ii].find(';')] )
                                typelist.append(newn[ii][newn[ii].find(';')+1:])
                                #print newn[ii]
                        else:
                            stillLooking = False
                            break
                    
                break

            
        prevn = copy.copy(newn)
        

    return [valuelist, typelist]

if __name__ == '__main__':
    main(*sys.argv[1:])

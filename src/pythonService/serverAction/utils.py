def checkDestFileWritable(filePath):
        if filePath.exists():
            try:
                with open(str(filePath),'w') as fd:
                    return True
            except:
                return False
            
        else:
            return True
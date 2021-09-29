import os


def checkDestFileWritable(filePath):
    if os.path.exists(filePath):
        try:
            with open(filePath, "w") as fd:
                return True
        except:
            return False

    else:
        return True

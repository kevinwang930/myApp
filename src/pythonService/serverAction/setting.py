import json
import os
import sys
import logging

config = None


def loadConfig():
    global config
    config_file_path = os.getenv("CONFIG_FILEPATH")
    if os.path.isfile(config_file_path):
        with open(config_file_path, "r") as f:
            config = json.load(f)
            logging.debug("config reloaded")
    else:
        sys.exit("配置文件不存在")


def getSqlitePath():
    sqlitePath = config["sqlite.filePath"]
    if os.path.isfile(sqlitePath):
        return sqlitePath
    logging.error(f"无法确定sqlite路径 {sqlitePath}")
    return False


def getOrderExcelTemplatePath():
    templatePath = config["template.excelOrderPath"]
    if os.path.isfile(templatePath):
        return templatePath
    templatePath = config["app.template.excelOrderPath"]
    if os.path.isfile(templatePath):
        return templatePath
    return False


def getOutputPath():
    outputPath = config["outputPath"]
    if outputPath:
        if os.path.exists(outputPath):
            return outputPath
        else:
            os.makedirs(outputPath)
            return outputPath
    else:
        return False


loadConfig()


def setOutputPath(pathString):
    config["outputPath"] = pathString
    logging.debug(f"output path set to {pathString}")

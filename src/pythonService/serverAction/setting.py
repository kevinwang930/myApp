import json
import os
import sys
import logging
import time

config = None

LOAD_COUNT = 0


def loadConfig():
    global config, LOAD_COUNT
    config_file_path = os.getenv("CONFIG_FILEPATH")
    if os.path.isfile(config_file_path):
        if LOAD_COUNT != 0:
            time.sleep(1)
        with open(config_file_path, "r") as f:
            config = json.load(f)
            logging.debug("config loaded")
            LOAD_COUNT += 1
    else:
        sys.exit("配置文件不存在")


def getSqliteFilePath():
    sqlitePath = config["sqlitePath"]
    fileRelativePath = config["sqlite.relative.filePath"]
    filePath = os.path.join(sqlitePath, fileRelativePath)
    if os.path.isfile(filePath):
        return filePath
    logging.error(f"sqlite存储文件不存在 {filePath}")
    return False


def getOrderExcelTemplatePath():
    templatePath = config["templatePath"]
    relativeTemplateExcelOrderPath = config["template.relative.excelOrderPath"]
    templateExcelOrderPath = os.path.join(templatePath, relativeTemplateExcelOrderPath)
    if os.path.isfile(templateExcelOrderPath):
        return templateExcelOrderPath
    appTemplatePath = config["app.templatePath"]
    templateExcelOrderPath = os.path.join(
        appTemplatePath, relativeTemplateExcelOrderPath
    )
    if os.path.isfile(templateExcelOrderPath):
        return templateExcelOrderPath
    logging.error(f"订单excel模板文件不存在 {templateExcelOrderPath}")
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


def setSqlitePath(pathString):
    config["sqlitePath"] = pathString
    logging.debug(f"sqlite path set to {pathString}")


def setTemplatePath(pathString):
    config["templatePath"] = pathString
    logging.debug(f"template path set to {pathString}")

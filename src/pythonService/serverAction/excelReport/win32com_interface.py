# -*- coding: utf-8 -*-
"""
Created on Sun Apr 29 17:50:59 2018

@author: kevin
"""
import sys
import win32com.client as client
import logging
from shutil import rmtree


try:
    xl = client.gencache.EnsureDispatch('Excel.Application') # use gencache to force early binding
except Exception:
    print(Exception)

        # Corner case dependencies.
    # import os
    import re
    import sys
    import win32com

    
    # Remove cache and try again.
    MODULE_LIST = [m.__name__ for m in sys.modules.values()]
    for module in MODULE_LIST:
        if re.match(r'win32com.gen_py\..+', module):
            del sys.modules[module]
    cachePath = win32com.__gen_path__
 
    logging.warning(f'try to remove gen_py cache {cachePath}')

    rmtree(cachePath)
    logging.info('gen_py cache removed')

    xl = client.gencache.EnsureDispatch('Excel.Application')
logging.info('get excel application success')



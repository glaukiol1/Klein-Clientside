import os
import sys
import configparser
import platform
import re

#  Reading Config File
config = configparser.ConfigParser()
try:
    config.read('./config.ini')
    devRoot = config['Paths']['devRoot']
    bookRoot = config['Paths']['bookRoot']
    htmlRoot = config['Paths']['htmlPath']
except:
    sys.exit('Misconfigured config.ini file.')

#  Setting Initial variables
bookName = sys.argv[1]
scriptPath = os.path.split(sys.argv[0])[0]

#  Creating root directories if they do not already exist
if not os.path.isdir(devRoot):
    print('making', devRoot)
    os.makedirs(devRoot)
if not os.path.isdir(bookRoot):
    print('making', bookRoot)
    os.makedirs(bookRoot)

#  Creating book development directory
try:
    bookDevDir = os.path.join(devRoot, f'{bookName}_dev')
    os.makedirs(bookDevDir)
except:
    sys.exit(f"{bookDevDir} already exists.")

#  Creating parse file - NEEDS TO BE UPDATED WITH PROPER FILE EXTENSION
with open(os.path.join(bookDevDir, "parse.bat"), 'x') as parseFile:
    # platform specific content
    if(platform.system() == 'Windows'):
        parseFileContent = '@ECHO OFF \n python ..\parseToJSON.py' + fr' \{ bookName }' +'\n move *.bk ' + fr'{ bookRoot }\{ bookName }'
    else:
        parseFileContent = f'python "{ scriptPath }/parseToJSON.py" "/{ bookName }" move *.bk "{ bookRoot }/book1" > dev/null'
    parseFile.write(parseFileContent)

#  Creating markdown book file
with open(os.path.join(bookDevDir, f'{bookName}.md'), 'x') as bookFile:
    bookFile.write(f'!Book {bookName}' + '\n' + '!Page newPage' + '\n' + '!endPage')

#  Creating book directory
try:
    bookDir = os.path.join(bookRoot, bookName)
    os.makedirs(bookDir)
except:
    sys.exit(f"{bookDir} already exists.")

resDir = os.path.join(bookDir, 'res')
os.makedirs(resDir)

with open(os.path.join(resDir, f'{bookName}.html'), 'x') as newHTMLfile:
    with open(os.path.join(scriptPath, 'TemplateHTML.html'), 'r') as oldHTMLfile:
        lines = oldHTMLfile.readlines()
        lines[34] = f"        let url = '{ re.escape(os.path.join(htmlRoot, bookName, f'{bookName}.bk')) }';"
        newHTMLfile.writelines(lines)
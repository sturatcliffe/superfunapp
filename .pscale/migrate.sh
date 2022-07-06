#!/bin/bash

DB_HOST="localhost" #$DATABASE_HOST
DB_USER="root" #$DATABASE_USER
DB_PW="P3Pt1of4*" #$DATABASE_PW
DB_NAME="superfunapp" #$DATABASE_NAME

migrations=$(ls ../migrations)

for file in $migrations; do
    exists=$(mysql.exe --host="$DB_HOST" --user="$DB_USER" --password="$DB_PW" --database="$DB_NAME" -sN -e "SELECT 1 FROM migration WHERE filename = '$file';")
    if [ -z "$exists" ];
    then
        echo "$file has not been run yet, running..."
        contents=`cat ../migrations/$file`
        mysql.exe --host="$DB_HOST" --user="$DB_USER" --password="$DB_PW" --database="$DB_NAME" -sN -e "$contents"
        if [ $? = 0 ]
        then
            mysql.exe --host="$DB_HOST" --user="$DB_USER" --password="$DB_PW" --database="$DB_NAME" -sN -e "INSERT INTO migration (filename) VALUES('$file');"
        else
            echo "$file failed to run..."
        fi
    else
        echo "$file has already been run, skipping..."
    fi
done

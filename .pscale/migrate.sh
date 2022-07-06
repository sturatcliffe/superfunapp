#!/bin/bash

DB_HOST=$DATABASE_HOST
DB_USER=$DATABASE_USER
DB_PW=$DATABASE_PW
DB_NAME=$DATABASE_NAME

migrations=$(ls ../migrations)

for file in $migrations; do
    exists=$(mysql --host="$DB_HOST" --user="$DB_USER" --password="$DB_PW" --database="$DB_NAME" -sN -e "SELECT 1 FROM migration WHERE filename = '$file';")
    if [ -z "$exists" ];
    then
        echo "$file has not been run yet, running..."
        contents=`cat ../migrations/$file`
        mysql --host="$DB_HOST" --user="$DB_USER" --password="$DB_PW" --database="$DB_NAME" -sN -e "$contents"
        if [ $? = 0 ]
        then
            mysql --host="$DB_HOST" --user="$DB_USER" --password="$DB_PW" --database="$DB_NAME" -sN -e "INSERT INTO migration (filename) VALUES('$file');"
        else
            echo "$file failed to run..."
        fi
    else
        echo "$file has already been run, skipping..."
    fi
done

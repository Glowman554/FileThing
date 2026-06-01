createuser -U postgres --pwprompt filething
createdb -U postgres --encoding=UTF8 --locale=C --template=template0 --owner=filething filething

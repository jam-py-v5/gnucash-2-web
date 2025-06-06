gnucash-2-web
=============

Jam.py Web interface for GnuCash.

Inspired by [gnucash-web](https://github.com/joshuabach/gnucash-web/)

The idea is pretty much the same, to enable the Web access to GnuCash database.
As Jam.py supports all GnuCash databases, except xml, it is trivial to use any of it.

By looking into [piecash](https://pypi.org/project/piecash/) library, the GnuCash DB schema is this:

https://piecash.readthedocs.io/en/master/object_model.html#schema

The lookups to all tables are defined on the Diagram. This is providing the way to create a lookups
within Jam.py. Which is again trivial to do. No coding involved.


Installation and/or building from scratch
------------------------------------------

[![alt text](https://github.com/jam-py-v5/gnucash-2-web/blob/main/screenshots/gnucash_jampy.gif?raw=true)](https://northwind.pythonanywhere.com)

Python 3.8 is required.
Install jamp.py-v7 with pip.
Navigate to GnuCash folder with SQLite3 database. 
Extract DB schema (Jam will use demo.sqlite DB initially from below script. Change this on Builder/Project/Database if needed. Builder is normally on 127.0.0.1:8080/builder.html

```
cp your_gnucash.sqlite  demo.sqlite

sqlite3 demo.sqlite .schema > schema.sqlite

jam-project.py

python ai8.py (file is from utils folder in this repo)
...
✅ Done. Inserted 24 items and 254 fields.
```

run jam.py with:
```
./server.py
```
That's it. The Web app is created from scratch. 

Access Web app as usual.


If one needs a DB schema from mysql or some other database, extract DB schema in some other way first. Name it schema.sql and run the same script. Adjust ai8.py if needed tho.

**Or, Import tables manually from Jam.py using supported database** (slower, but takes only 30 mins or so).
No need for any script to add tables to Jam.py. It is all **no code** at this stage.

Now we can create drop-down menu's (no code), move stuff around, create lookups to tables as per above diagram, start creating Dashboards, users, etc. As per Jam.py Docs.

One can also start thinking about offline support with using some sort of replication to the Web server hosting this app. Hosting Jam.py is trivial on ie, PythonAnywhere. Or self hosting. 

For example [litestream](https://litestream.io/).

Or, one can source this repo and try it first. I will try to add more features to it. Like a Report. Or Dash.

The App is using sample database from [gnucash-web](https://github.com/joshuabach/gnucash-web/).


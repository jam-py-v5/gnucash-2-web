gnucash-2-web
=============

Jam.py Web interface for GnuCash.

Inspired by [gnucash-web](https://github.com/joshuabach/gnucash-web/)

The idea is pretty much the same, to enable the Web access to GnuCash database.
As Jam.py supports all GnuCash databases, except xml, it is trivial to use any of it.

By looking into [piecash](https://pypi.org/project/piecash/) library, the GnuCash DB schema is this:

https://piecash.readthedocs.io/en/master/object_model.html#schema

The lookups to all tables are defined on the Diagram. This is providing the way to create a lookups
within Jam.py. Which is again trivial to do. **No coding involved**. 
I've crossed all lookups added to App on screenshots/schema.png, as an reminder.

Why this App?
--------------

If one needs quick Web access to GNUCash database, this App might help. Since no coding involved, runs anywhere, why not to try it? 
At this stage it is WIP. Wait for Master/Details and Dashs, if I figure out the relations.
Reports? No probs, can be ported from GnuCash. All on Web.


Installation and/or building from scratch
------------------------------------------

**Note: always backup your database! Jam.py is a database framework, it CAN change database structure!**


[![alt text](https://github.com/jam-py-v5/gnucash-2-web/blob/main/screenshots/gnucash_jampy.gif?raw=true)](https://northwind.pythonanywhere.com)

Python >3.8 is required.

Install jam.py-v7 with pip.


Navigate to folder, and run jam.py with:
```
./server.py
```
That's it. 

Access Web app as usual.

If one needs a DB access to MYSQL or Postgres, press F4 on the Builder, change the database (providing drivers are installed), and off u go. 

One can also start thinking about offline support with using some sort of replication to the Web server hosting Sqlite app. 

For example [litestream](https://litestream.io/).

Hosting Jam.py is trivial on ie, PythonAnywhere. Or self hosting. RasPi? No worries.

Installing this App
-------------------

Run it "as is" or replace sample.sqlite with yours on Builder with pressing F4.
Or, point Jam.py to your SQLite database somewhere on Builder/Project/Database, as per above. Full path to file is supported.
A lot of options here.
Did not try other databases like mysql tho.

I will try to add more features to it. Like a Report. Or a Dash.

Cheers and thanks for visiting!

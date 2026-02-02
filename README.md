gnucash-2-web
=============

Jam.py Web interface for GnuCash.

Inspired by [gnucash-web](https://github.com/joshuabach/gnucash-web/)


The idea is essentially the same: to enable web access to a GnuCash database. Since Jam.py supports all GnuCash database formats except XML, it is trivial to use any of them.

By looking into the piecash library, the GnuCash database schema is documented here:

https://piecash.readthedocs.io/en/master/object_model.html#schema

All table lookups are defined in the diagram. This provides a clear way to create lookups within Jam.py, which again is trivial to do, no coding involved. I’ve crossed all lookups added to the app in the screenshots (schema.png) as a reminder.

Why this app?
--------------

If you need quick web access to a GnuCash database, this app might help. Since no coding is involved and it runs anywhere, why not give it a try?

At this stage, it is a work in progress (WIP). Master–detail views and dashboards are coming, once the relationships are fully figured out. Reports? No problem - they can be ported from GnuCash.

All on the web.

Installation and/or building from scratch
------------------------------------------

**Note: Always back up your database. Jam.py is a database framework and can modify the database structure.**


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

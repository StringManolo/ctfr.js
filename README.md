ctfr.js is a javascript extended version of ctfr.py
dath.js is a nmap wrapper to easily discover open ports from domain lists and analice headers
dorks.js uses google search to find interesting stuff 
auto.js simplify running all scans together


This scanner depends on:
+ Quickjs
+ crt.sh
+ Nmap
+ Curl
+ Lynx 

Basic-Usage:
Scan port 22, port 80 and port 443 in all domains/subdomains (found based on public certificates) from the list you provide. If web service found answering port 80 or port 443, and aditional request is made to get HTTP response headers. If hedears found, a small headers check is made as an aditional source of information. 
```qjs auto.js -d stringmanolo.ga,example.com -r 22,80,443```

Scan all ports between 70 and 90 (both included) from all the domains/subdomains (found based on public certificates) from the comma separated value list you provide.
```qjs auto.js -d stringmanolo.ga -r 70-90```

If you're running the auto script from a non interactive shell, you may edit the auto.js code and manually remove -c (colored output using secuences) from dath.js run call arguments.

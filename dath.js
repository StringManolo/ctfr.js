import * as std from "std";
import * as os from "os";

let quit = msg => {
  console.log(msg);
  std.exit();
}

let debug = args => console.log(`DEBUG: ${args}`);

const COLORS = {
  RED: "\x1b[31m",
  RESET: "\x1b[0m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  GREEN: "\x1b[32m"
};

let run = command => {
  let p = std.popen(command, "r"),
  msg = "",
  r = "";
  while(( r = p.getline() ) != null) {
    msg += r + "\n";
  }
  return msg;
}

let cli = {};
for (let i in scriptArgs) {
  let arg = scriptArgs[+i + 1];
  switch(scriptArgs[i]) {
    case "-c":
    case "--colored-output": 
      cli.color = true;
    break;

    case "-f":
    case "--file":
      cli.file = arg;
    break;

    case "-h":
    case "--help":
      exit(`usage: qjs dath.js [-h] -f file [-o OUTPUT]
optional arguments:
  -h, --help            show this help message and exit.

  -f, --file            domains file (separated by line breaks)
  -r, --range           range of ports to scan
  -p, --proxy           proxy url
  -ph,--proxy-headers   headers you need to send to the proxy
`)

    case "-r":
    case "--range":
      cli.range = arg;
    break;

    case "-p":
    case "--proxy":
      cli.proxy = arg;
    break

    case "-ph":
    case "--proxy-headers":
      cli.proxyHeaders = arg;
    break;

    case "-sh":
    case "--show-headers":
      cli.showHeaders = true;
  }
}

if (!cli.file) {
  quit(`Only accepting domains from files. Create a file and add your line separated domains there.
Or use ctfr -d domainToScan.com`)
}

let scanHeaders = headers => { 
  let xfo = false,
  rp = false,
  sch = false,
  scc = false;

  for (let i in headers) {
    let h = headers[i];
    if(new RegExp("X-FRAME-OPTIONS", "gi").test(h)) xfo = true;
    if(new RegExp("Referrer-Policy", "gi").test(h)) rp = true;
    if(new RegExp("Set-Cookie", "gi").test(h)) {
      if(!new RegExp("httpOnly", "gi").test(h)) {
        sch = true;
      } if (!new RegExp("secure", "gi").test(h)) {
        scs = true;
      }
    }
  }

  let res = "";
  if (!xfo) res += `    Missing ${cli.color ? COLORS.BLUE : ""}X-Frame-Options${cli.color ? COLORS.RESET : ""} header\n`;
  if (!rp) res += `    Missing ${cli.color ? COLORS.BLUE : ""}Referrer-Policy${cli.color ? COLORS.RESET : ""} header\n`;
  if (sch) res += `    Missing ${cli.color ? COLORS.BLUE : ""}httpOnly${cli.color ? COLORS.RESET : ""} flag in set-cookie header directive\n`; 
  if (scc) res += `    Missing ${cli.color ? COLORS.BLUE : ""}secure${cli.color ? COLORS.RESET : ""} flag in set-cookie header directive\n`;

  if (res) {
    console.log(`  Missing headers:\n${res}`);
  }
}

let scanDomain = options => {
  console.log(`Scanning ${options.domain}...`);
  let ports = options.range || [80, 443, 8080];
  
  let res = run(`nmap ${options.domain} -p${ports} -oG "/dev/stdout" 2>/dev/null | grep Ports`);

  if (res) {
    res = res.split("Ports: ")[1].split(",")
    res = res.toString().replaceAll("Host is up (", "\n  "); //add show latency options
    res = res.substr(0, res.length-11) + "\n";
    let resAux = res;
    if (cli.color) {
      res = res
      .replaceAll(/open/gi, COLORS.GREEN + "open" + COLORS.RESET)
      .replaceAll(/closed/gi, COLORS.RED + "closed" + COLORS.RESET)
      .replaceAll(/filtered/gi, COLORS.YELLOW + "filtered" + COLORS.RESET);
    }
    console.log(`  ${res}`) //add json and csv output
    std.out.flush();
    if (cli.showHeaders) {
      let aux = "";
      if (new RegExp("80/open/", "gi").test(resAux) ) {
        aux += run(`curl http://${options.domain} -I --silent`) || `Error requesting http://${options.domain}`;
      } else if (new RegExp("443/open/", "gi").test(resAux)) {
        aux += run(`curl https://${options.domain} -I --silent`) || `Error requesting https://${options.domain}`;
      }
      if (aux) {
        aux = aux.split("\n");
        console.log("  Headers:");
        for (let i in aux) {
          console.log(`    ${aux[i]}`)
        }
        scanHeaders(aux);
      }
    }
    console.log(`\n`);
  }

}



let domains = std.loadFile(cli.file).split("\n")
domains[domains.length-1].length < 1 && domains.pop();


for(let i = 0; i < domains.length; ++i) {
  if (!/\*/g.test(domains[i]) && !/\@/g.test(domains[i])) {
    scanDomain({ domain: domains[i], range: cli.range })
  }
}

import * as std from "std";
import * as os from "os";

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
    case "-d":
    case "--domains":
      cli.domains = arg;
    break;

    case "-h":
    case "--help":
      console.log(`usage: qjs auto.js -d DOMAIN -r range
optional arguments:
  -h, --help            show this help message and exit.

  -d, --domains         domain or comma separed list of domains
  -f, --file            domains file (separated by line breaks)
  -r, --range           range of ports to scan
`)
      std.exit(0);

    case "-f":
    case "--file":
      cli.file = std.loadFile(arg);
    break;

    case "-r":
    case "--range":
      cli.range = arg;
  }
}

if (!cli.domains && !cli.file) {
  throw `usage: qjs auto.js -d DOMAIN -r range
auto.js: error: the following arguments are required: -d/--domain or -f/--file`;
}

if (!cli.domains) {
  cli.domains = cli.file.split("\n");
  cli.domains[cli.domains.length-1].length < 1 && cli.domains.pop();
}

if (/\,/g.test(cli.domains)) {
  cli.domains = cli.domains.toString().split(",");
} else {
  cli.domains = [cli.domains];
}

let ports = cli.range || [80, 443, 8080];

for (let i in cli.domains) {
  console.log(run(`qjs ctfr.js -d ${cli.domains[i]} -o .internalAutoScan${i} && qjs dath.js -sh -c --robots -f .internalAutoScan${i} -r ${ports}`));
  //console.log(run(`qjs dorks.js -t ${cli.domains[i]} -L`)); 
}

run("rm .internalAutoScan*");

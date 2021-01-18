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
  switch(scriptArgs[i]) {
    case "-d":
    case "--domain":
      cli.domain = scriptArgs[+i + 1];
    break;

    case "-h":
    case "--help":
      throw `usage: qjs ctfr.js [-h] -d DOMAIN [-o OUTPUT]      
optional arguments:
  -h, --help            show this help message and exit
  -d DOMAIN, --domain DOMAIN            Target domain.
  -o OUTPUT, --output OUTPUT            Output file.`;
    break;

    case "-o":
    case "--output":
      cli.output = scriptArgs[+i + 1];
    break;
  }
}

if (!cli.domain) {
  throw `usage: qjs ctfr.js [-h] -d DOMAIN [-o OUTPUT]
ctfr.js: error: the following arguments are required: -d/--domain`;
}

let api = JSON.parse(run(`curl "https://crt.sh/?q=${encodeURIComponent(cli.domain)}&output=json" --silent`));

let domains = [];

for (let i in api) {
  let aux = (api[i].name_value.split("\n") || api[i].name_value);
  for (let j in aux) {
    domains.push(aux[j]);
  }
}

domains = [...new Set(domains)];

if (!domains) {
  console.log("no domains found");
}

for (let i in domains) {
  console.log(domains[i]);
}

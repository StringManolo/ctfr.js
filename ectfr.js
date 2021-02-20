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
cli.writeMode = "w";
for (let i in scriptArgs) {
  switch(scriptArgs[i]) {
    case "-a":
    case "--append":
      cli.writeMode = "a";
    break;

    case "-c":
    case "--csv":
      cli.csv = true;
    break;

    case "-d":
    case "--domain":
      cli.domain = scriptArgs[+i + 1];
    break;

    case "-h":
    case "--help":
      throw `usage: qjs ctfr.js [-h] -d DOMAIN [-o OUTPUT]
optional arguments:
  -h, --help            show this help message and exit.
  -d DOMAIN, --domain DOMAIN            Target domain.
  -o OUTPUT, --output OUTPUT            Output file.

  -a, --append          append to file, don't overwrite.
  -c, --csv             output in comma separated values.
  -j, --json            output in json format.
`;
    break;

    case "-j":
    case "--json":
      cli.json = true;
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

let resp = "";
if (cli.json) {
  resp = JSON.stringify(domains);

} else if (cli.csv) {
  for(let i in domains) {
    resp += domains[i] + (i == domains.length - 1 ? "" : ",")
  }
} else {
  for (let i in domains) {
    resp += domains[i] + (i == domains.length - 1 ? "" : "\n")
  }
}

if (cli.output) {
  let fd = std.open(cli.output, cli.writeMode);
  if (cli.writeMode == "a") {
    if (cli.json || cli.csv) {
      resp = "," + resp;
    } else {
      resp = "\n" + resp;
    }
  }
  fd.puts(resp);
  fd.close();
} else {
  console.log(resp);
}

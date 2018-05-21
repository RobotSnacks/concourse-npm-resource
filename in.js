#!/usr/bin/env node

const exec = require("child_process").exec;
const fs = require("fs");

process.stdin.on("data", chunk => {
  const data = JSON.parse(chunk);
  const source = data.source;

  if (!source.package) {
    console.error("Please specify `source.package`.");
    process.exit(1);
  }

  const token = source.token;
  const registry = source.registry || "https://registry.npmjs.org";
  const params = data.params;

  let authLine = "";
  let regLine = `registry=${registry}`;

  if (token)
    authLine = `//${registry.replace(/https?:\/\//, "")}/:_authToken=${token}`;

  const npmrc = [authLine, regLine].filter(n => !!n).join("\n");
  fs.writeFileSync(".npmrc", npmrc, { encoding: "utf8" });

  const cmdLine = `npm info ${source.package} --json`;

  exec(cmdLine, (err, stdout, stderr) => {
    if (err) {
      console.error("Error checking resource:", err);
      process.exit(1);
    }

    let pkg;
    try {
      pkg = JSON.parse(stdout);
    } catch (e) {
      console.error("Error parsing JSON response from registry.");
      console.error(stdout);
      process.exit(1);
    }

    const { version } = pkg;
    const output = JSON.stringify({ version: { number: version } });
    console.log(output);
    process.exit(0);
  });
});

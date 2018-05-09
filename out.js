#!/usr/bin/env node

const exec = require("child_process").exec;
const fs = require("fs");

process.stdin.on("data", chunk => {
  const data = JSON.parse(chunk);

  const source = data.source;
  const token = source.token;
  const params = data.params;

  if (!source) {
    console.error("Please specify a source.");
    process.exit(1);
  }

  if (!token) {
    console.error("Please specify `source.token`.");
    process.exit(1);
  }

  if (!params) {
    console.error("Please specify `params`.");
    process.exit(1);
  }

  const path = params.path;

  if (!path) {
    console.error("Please set `params.path`.");
    process.exit(1);
  }

  var cmdLine = "/usr/local/bin/npm publish";
  const access = params.access;

  const cwd = `${process.argv[2]}/${path}`;

  console.error("all files in target directory...");
  fs.readdir(cwd, (err, files) => {
    files.forEach(file => {
      console.error(file);
    });
  });

  const opts = {
    cwd,
    env: {
      ...process.env,
      NPM_TOKEN: token
    }
  };

  console.error("getting ready to exec", cmdLine);
  exec(cmdLine, opts, (err, stdout, stderr) => {
    if (err) {
      console.error("trying to run", cmdLine);
      console.error("got error in child process...", err);
      process.exit(1);
    }

    console.error(stdout);

    const lines = stdout.split("\n").filter(v => v);
    const line = lines[lines.length - 1];
    const tokens = line.split("@");

    if (tokens.length > 1) {
      const version = tokens[tokens.length - 1];
      if (version) {
        console.log(JSON.stringify({ version: { number: version } }));
        process.exit(0);
      } else {
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  });
});

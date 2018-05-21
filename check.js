#!/usr/bin/env node

const exec = require("child_process").exec;
const fs = require("fs");
const semver = require("semver");

process.stdin.on("data", chunk => {
  const data = JSON.parse(chunk);
  const source = data.source;
  const version = data.version;

  if (!source.package) {
    console.error("Please specify `source.package`.");
    process.exit(1);
  }

  const token = source.token;
  const username = source.username;
  const email = source.email;
  const password = source.password;
  const alwaysAuth = source.always_auth;

  const registry = source.registry || "https://registry.npmjs.org";
  const cleanRegistry = registry.replace(/https?:\/\//, "");
  const params = data.params;

  const npmrc = [
    `registry=${registry}`,
    token ? `//${cleanRegistry}/:_authToken="${token}"` : null,
    password ? `//${cleanRegistry}/:_password="${password}"` : null,
    username ? `//${cleanRegistry}/:username=${username}` : null,
    email ? `//${cleanRegistry}/:email=${email}` : null,
    alwaysAuth === true ? `//${cleanRegistry}/:always-auth=true` : null
  ]
    .filter(n => !!n)
    .join("\n");
  fs.writeFileSync(".npmrc", npmrc, { encoding: "utf8" });

  const cmdLine = `npm info ${source.package} --json`;

  exec(cmdLine, (err, stdout, stderr) => {
    try {
      if (stderr) {
        console.error(stderr);
      }

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

      const currentVersion =
        version && version.number ? version.number : pkg.version;

      const newerVersions = pkg.versions.filter(v => {
        return semver.gt(v, currentVersion) || v === currentVersion;
      });

      const formattedVersions = newerVersions.map(v => ({ number: v }));
      const output = JSON.stringify(formattedVersions);
      console.error("");
      console.log(output);
      process.exit(0);
    } catch (e) {
      console.error("Error while checking:", e);
      process.exit(1);
    }
  });
});

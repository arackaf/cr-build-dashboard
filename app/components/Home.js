import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./Home.css";
//import { spawn, exec } from "child_process";
const spawn = require("cross-spawn");
const Convert = require("ansi-to-html");
const convert = new Convert();
//debugger;

export default class Home extends Component {
  state = { output: "" };
  componentDidMount() {
    //return;
    //debugger;

    //let wp = exec("npm.cmd run start-wp", { cwd: "c:/git/MainLine/members" });
    let wp = spawn("npm.cmd", ["run", "start-wp"], { cwd: "c:/git/MainLine/members" });
    this.wp = wp;
    wp.on("error", (a, b, c) => {
      debugger;
    });
    wp.stdout.on("data", (text, b, c) => {
      debugger;

      let X = text.toString("utf8");

      if (this.unmounted) {
        this.cleanup();
        return;
      }
      let old = this.state.output;
      let output = old + (old ? "" : "") + convert.toHtml(X);
      this.setState({ output });
    });
  }
  componentWillUnmount() {
    this.cleanup();
  }
  cleanup() {
    this.unmounted = true;
    try {
      this.wp.kill();
    } catch (er) {}
  }
  render() {
    return (
      <div>
        <div>
          <h2>Hello World 2</h2>
          <pre>{this.state.output}</pre>
          {null && <div dangerouslySetInnerHTML={{ __html: this.state.output }} />}
        </div>
      </div>
    );
  }
}

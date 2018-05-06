import React, { Component } from "react";
import styles from "./Home.css";
const kill = require("tree-kill");
const terminate = require("terminate");

import { exec } from "child_process";
import Convert from "ansi-to-html";
const convert = new Convert();

const spawn = require("cross-spawn");

const cliStyles = {
  overflow: "scroll",
  backgroundColor: "black",
  marginTop: 0,
  flex: 1,
  width: "100%"
};

class Webpack extends Component {
  state = { output: "" };
  componentDidMount() {
    process.on("exit", () => {
      this.cleanup();
    });
    let wp = spawn("node_modules/webpack/bin/webpack.js", ["-w"], {
      cwd: "c:/git/MainLine/members",
      env: process.env,
      stdio: [null, null, null, null]
    });
    this.wp = wp;
    wp.on("error", (a, b, c) => {
      debugger;
      if (this.unmounted) {
        this.cleanup();
        return;
      }
    });
    wp.stdout.on("data", (text, b, c) => {
      if (this.unmounted) {
        this.cleanup();
        return;
      }
      text = text
        .toString("utf8")
        .replace(/WARNING[\s\S]+?(\n\n|$)/g, str => `<span class="wp-warning">${str}</span>`)
        .replace(/ERROR[\s\S]+?(\n\n|$)/g, str => `<span class="wp-error">${str}</span>`)
        .replace(/\[emitted\]/g, str => `<span class="wp-success">${str}</span>`)
        .replace(
          /\{(.+)\}\s*\[built\]/g,
          (str, name) => `<span class="wp-stat">{<span class="wp-build-id">${name}</span>}</span> <span class="wp-success">[built]</span>`
        )
        .replace(/\d+(\.\d+)?\s+(KiB|bytes|MiB)/gi, str => `<span class="wp-stat">${str}</span>`)
        .replace(/\+\s+\d+ hidden modules/gi, str => `<span class="wp-stat">${str}</span>`);

      let old = this.state.output;
      let output = old + text;
      this.setState({ output }, () => {
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
      });
    });
  }
  componentWillUnmount() {
    this.unmounted = true;
    this.cleanup();
  }
  cleanup() {
    try {
      terminate(this.wp.pid);
    } catch (er) {}
    try {
      exec("taskkill /pid " + this.wp.pid + " /T /F");
    } catch (er) {}
    try {
      kill(this.wp.pid, "SIGKILL");
    } catch (er) {}
    try {
      kill(this.wp.pid);
    } catch (er) {}
    return;
    try {
      this.wp.removeAllListeners();
    } catch (er) {}
    try {
      this.wp.disconnect();
    } catch (er) {}
    try {
      this.wp.unref();
    } catch (err) {}
    try {
      this.wp.kill("SIGINT");
    } catch (er) {}
    try {
      process.kill(process.platform === "win32" ? this.wp.pid : -this.wp.pid);
    } catch (er) {}
    this.wp = null;
  }
  render() {
    let { style, ...rest } = this.props;
    return (
      <div style={{ ...style, overflow: "hidden" }} {...rest}>
        <div style={{}}>
          <button className={styles.btn}>
            <i className="fas fa-ban" />
          </button>
          <button className={styles.btn}>
            <i className="far fa-sync" />
          </button>
        </div>
        <pre dangerouslySetInnerHTML={{ __html: this.state.output }} ref={el => (this.outputEl = el)} style={cliStyles} />
      </div>
    );
  }
}

class TS extends Component {
  state = { output: "", a: 13 };
  componentDidMount() {
    process.on("exit", () => {
      this.cleanup();
    });
    let wp = spawn("node_modules/typescript/bin/tsc", ["-w", "-p", "tsconfig.json", "--noEmit", "true", "--pretty", "true"], {
      cwd: "c:/git/MainLine/members",
      env: process.env,
      stdio: [null, null, null, null]
    });
    this.wp = wp;
    wp.on("error", (a, b, c) => {
      if (this.unmounted) {
        this.cleanup();
      }
    });
    wp.stdout.on("data", (text, b, c) => {
      if (this.unmounted) {
        this.cleanup();
        return;
      }
      text = convert.toHtml(text.toString("utf8")).replace(/^c\[(.*)/, (str, content) => `[${content}`);
      if (text == "c") return;

      let old = this.state.output;
      let output = old + text;
      this.setState({ output }, () => {
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
      });
    });
  }
  componentWillUnmount() {
    this.unmounted = true;
    this.cleanup();
  }
  cleanup() {
    try {
      terminate(this.wp.pid);
    } catch (er) {}
    try {
      exec("taskkill /pid " + this.wp.pid + " /T /F");
    } catch (er) {}
    try {
      kill(this.wp.pid, "SIGKILL");
    } catch (er) {}
    try {
      kill(this.wp.pid);
    } catch (er) {}
    return;

    try {
      this.wp.removeAllListeners();
    } catch (er) {}
    try {
      this.wp.disconnect();
    } catch (er) {}
    try {
      this.wp.unref();
    } catch (err) {}
    try {
      this.wp.kill("SIGINT");
    } catch (er) {}
    try {
      process.kill(process.platform === "win32" ? this.wp.pid : -this.wp.pid);
    } catch (er) {}
    this.wp = null;
  }
  render() {
    let { style, ...rest } = this.props;
    return (
      <div style={{ ...style, overflow: "hidden" }} {...rest}>
        <div style={{}}>
          <button className={styles.btn}>
            <i className="fas fa-ban" />
          </button>
          <button className={styles.btn}>
            <i className="far fa-sync" />
          </button>
        </div>
        <pre dangerouslySetInnerHTML={{ __html: this.state.output }} ref={el => (this.outputEl = el)} style={cliStyles} />
      </div>
    );
  }
}

export default class Home extends Component {
  state = { output: "" };
  render() {
    return (
      <div>
        <div className={styles.container} style={{ display: "flex", overflow: "hidden" }}>
          <Webpack style={{ display: "flex", flexDirection: "column", padding: 5, flex: 2 }} />
          <div style={{ display: "flex", flexDirection: "column", padding: 5, flex: 1, overflow: "hidden" }}>
            <TS style={{ flex: 1, display: "flex", flexDirection: "column" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{}}>
                <button className={styles.btn}>
                  <i className="fas fa-ban" />
                </button>
                <button className={styles.btn}>
                  <i className="far fa-sync" />
                </button>
              </div>
              <pre dangerouslySetInnerHTML={{ __html: this.state.output }} ref={el => (this.outputEl = el)} style={cliStyles} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

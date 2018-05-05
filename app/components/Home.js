import React, { Component } from "react";
import styles from "./Home.css";
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
    let wp = spawn("npm.cmd", ["run", "start-wp"], { cwd: "c:/git/MainLine/members" });
    this.wp = wp;
    wp.on("error", (a, b, c) => {
      debugger;
    });
    wp.stdout.on("data", (text, b, c) => {
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

      if (this.unmounted) {
        this.cleanup();
        return;
      }
      let old = this.state.output;
      let output = old + text;
      this.setState({ output }, () => {
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
      });
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
  state = { output: "" };
  componentDidMount() {
    let wp = spawn("npm.cmd", ["run", "tscw"], { cwd: "c:/git/MainLine/members" });
    this.wp = wp;
    wp.on("error", (a, b, c) => {
      debugger;
    });
    debugger;
    wp.stdout.on("data", (text, b, c) => {
      debugger;
      let X = text.toString("utf8");
      let Y = convert.toHtml(text.toString("utf8"));

      debugger;
      text = convert.toHtml(text.toString("utf8"));

      if (this.unmounted) {
        this.cleanup();
        return;
      }
      let old = this.state.output;
      let output = old + text;
      this.setState({ output }, () => {
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
      });
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
          <div style={{ display: "flex", flexDirection: "column", padding: 5, flex: 1 }}>
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

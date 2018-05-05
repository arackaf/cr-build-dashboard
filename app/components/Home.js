import React, { Component } from "react";
import styles from "./Home.css";

const spawn = require("cross-spawn");

import Counter from "./Counter";

const cliStyles = {
  overflow: "scroll",
  backgroundColor: "black",
  marginTop: 0,
  flex: 1,
  width: "100%"
};

export default class Home extends Component {
  state = { output: "" };
  componentDidMount() {
    return;
    localStorage.setItem("A", 12);

    //let wp = exec("npm.cmd run start-wp", { cwd: "c:/git/MainLine/members" });
    let wp = spawn("npm.cmd", ["run", "start-wp"], { cwd: "c:/git/MainLine/members" });
    this.wp = wp;
    wp.on("error", (a, b, c) => {
      debugger;
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
    return;
    this.cleanup();
  }
  cleanup() {
    this.unmounted = true;
    try {
      this.wp.kill();
    } catch (er) {}
  }
  render() {
    let X = (
      <div className={styles.container}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            <pre dangerouslySetInnerHTML={{ __html: this.state.output }} ref={el => (this.outputEl = el)} style={cliStyles} />
            Hello
          </div>
        </div>
      </div>
    );

    return (
      <div>
        <div className={styles.container} style={{ display: "flex" }}>
          <div style={{ display: "flex", flexDirection: "column", padding: 5, flex: 2 }}>
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
          <div style={{ display: "flex", flexDirection: "column", padding: 5, flex: 1 }}>
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

import React, { Component } from "react";
import styles from "./Home.css";

const spawn = require("cross-spawn");

import Counter from "./Counter";

export default class Home extends Component {
  state = { output: "" };
  componentDidMount() {
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
          <button className={styles.btn}>
            <i className="fas fa-ban" />
          </button>
          <button className={styles.btn}>
            <i className="far fa-sync" />
          </button>
          <pre
            dangerouslySetInnerHTML={{ __html: this.state.output }}
            ref={el => (this.outputEl = el)}
            style={{
              overflow: "scroll",
              display: "block",
              height: "500px",
              width: "800px",
              paddingBottom: "25px",
              backgroundColor: "black",
              marginTop: 0
            }}
          />
        </div>
      </div>
    );
  }
}

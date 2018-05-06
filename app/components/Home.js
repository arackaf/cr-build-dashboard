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

class CliProcess extends Component {
  componentDidMount() {
    this.startup();
    process.on("exit", () => {
      this.cleanup();
    });
  }
  startup() {
    let { command, args } = this.props;
    let wp = spawn(command, args, {
      cwd: "c:/git/MainLine/members"
    });
    this.wp = wp;
    wp.stderr.on("data", error => {
      debugger;
      if (this.unmounted) {
        this.cleanup();
        return;
      }
      if (this.props.onError) {
        this.props.onError(error);
      }
    });
    wp.stdout.on("data", (text, b, c) => {
      if (this.unmounted) {
        this.cleanup();
        return;
      }
      this.props.onData(text);
    });
  }
  componentWillUnmount() {
    this.unmounted = true;
    this.cleanup();
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.output != prevProps.output) {
      this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }
  }
  cleanup() {
    try {
      process.kill(process.platform === "win32" ? this.wp.pid : -this.wp.pid);
    } catch (er) {}
    this.wp = null;
  }
  render() {
    let { style = {}, output, onData, ...rest } = this.props;
    return <pre dangerouslySetInnerHTML={{ __html: output }} ref={el => (this.outputEl = el)} style={{ ...cliStyles, ...style }} {...rest} />;
  }
}

class Webpack extends Component {
  state = { output: "" };
  onData = text => {
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
    this.setState({ output });
  };
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
        <CliProcess command="node_modules/webpack/bin/webpack.js" args={["-w"]} onData={this.onData} output={this.state.output} />
      </div>
    );
  }
}

class TS extends Component {
  state = { output: "", a: 13 };
  onData = text => {
    text = convert.toHtml(text.toString("utf8")).replace(/^c\[(.*)/, (str, content) => `[${content}`);
    if (text == "c") return;

    let old = this.state.output;
    let output = old + text;
    this.setState({ output });
  };
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
        <CliProcess
          command="node_modules/typescript/bin/tsc"
          args={["-w", "-p", "tsconfig.json", "--noEmit", "true", "--pretty", "true"]}
          onData={this.onData}
          output={this.state.output}
        />
      </div>
    );
  }
}

class TSLint extends Component {
  state = { output: "", a: 13 };
  onError = text => {
    let old = this.state.output;
    let output = old + text;
    this.setState({ output });
  };
  onData = text => {
    this.setState({ output: text });
    text = convert.toHtml(text.toString("utf8")).replace(/^c\[(.*)/, (str, content) => `[${content}`);
    if (text == "c") return;

    let old = this.state.output;
    let output = old + text;
    this.setState({ output });
  };
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
        {/*<CliProcess
          command="node_modules/tslint/bin/tslint"
          args={["tslint", "-p", "."]}
          onData={this.onData}
          onError={this.onError}
          output={this.state.output}
        />*/}
        <CliProcess command="npm.cmd" args={["run", "tslint"]} onData={this.onData} onError={this.onError} output={this.state.output} />
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
            <TSLint style={{ flex: 1, display: "flex", flexDirection: "column" }} />
          </div>
        </div>
      </div>
    );
  }
}

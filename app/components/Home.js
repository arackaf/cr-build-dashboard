import React, { Component } from "react";
import styles from "./Home.css";
import Convert from "ansi-to-html";
const convert = new Convert();

import spawn from "cross-spawn";
import Store from "electron-store";
const store = new Store();

const cliStyles = {
  overflow: "scroll",
  backgroundColor: "black",
  marginTop: 0,
  flex: 1,
  width: "100%"
};

const PATH = "c:/git/MainLine/members";

class CliProcess extends Component {
  componentDidMount() {
    process.on("exit", () => {
      this.cleanup();
    });
    if (this.props.lazy) {
      return;
    }
    this.startup();
  }
  restart = () => {
    this.cleanup();
    setTimeout(this.startup, 250);
  };
  startup = () => {
    let { command, args } = this.props;
    let wp = spawn(command, args, {
      cwd: PATH
    });
    this.wp = wp;
    wp.stderr.on("data", error => {
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
  };
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
    let { style = {}, output, onData, lazy, ...rest } = this.props;
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
        <CliProcess
          ref={c => (this.cli = c)}
          command="node_modules/webpack/bin/webpack.js"
          args={["-w"]}
          onData={this.onData}
          output={this.state.output}
        />
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
    if (/File change detected/.test(text)) {
      old = "";
    }
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
        <CliProcess command="npm.cmd" args={["run", "tslint"]} onData={this.onData} onError={this.onError} output={this.state.output} lazy={true} />
      </div>
    );
  }
}

const modules = [
  "billingmanager",
  "bundles",
  "claims",
  "contacts",
  "forms",
  "manage",
  "messaging",
  "payroll",
  "permissions",
  "register",
  "resources",
  "scheduling",
  "tasks"
];

class Menu extends Component {
  render() {
    let { isOpen, onClose, modulesMap, saveModules } = this.props;
    return (
      <div className={"menu" + (isOpen ? " active" : "")}>
        <a onClick={onClose} style={{ color: "black" }}>
          <i className="far fa-arrow-left" />
        </a>
        <br />
        <br />
        {modules.map(m => (
          <div key={m}>
            <label>
              <input ref={el => (this["modCb" + m] = el)} type="checkbox" defaultChecked={!!modulesMap[m]} /> {m}
            </label>
          </div>
        ))}
        <button className={styles.btn} onClick={() => saveModules(modules.filter(m => this["modCb" + m].checked))}>
          Save
        </button>
      </div>
    );
  }
}

export default class Home extends Component {
  state = { menuOpen: false, modulesMap: {} };
  menuClose = () => this.setState({ menuOpen: false });
  componentDidMount() {
    if (!store.get("webpackModules")) {
      store.set("webpackModules", { contacts: true });
    }
    this.setState({ modulesMap: store.get("webpackModules") });
    window.onkeydown = this.keyDown;
  }
  saveModules = toSave => {
    let wp = spawn("node", ["createWebpackRouter.js", toSave.join(",")], {
      cwd: PATH + "/build"
    });
    let newMap = toSave.reduce((hash, k) => ((hash[k] = true), hash), {});
    store.set("webpackModules", newMap);
    this.setState({ modulesMap: newMap });
    this.menuClose();
  };

  keyDown = evt => {
    if (evt.keyCode == 83) {
      this.setState({ menuOpen: true });
    }
  };
  render() {
    let { modulesMap, menuOpen } = this.state;
    return (
      <div>
        {this.state.menuOpen ? <Menu modulesMap={modulesMap} onClose={this.menuClose} saveModules={this.saveModules} isOpen={menuOpen} /> : null}
        <div className={styles.container} style={{ display: "flex", overflow: "hidden", zIndex: 50 }}>
          <Webpack style={{ display: "flex", flexDirection: "column", padding: 5, flex: 3 }} />
          <div style={{ display: "flex", flexDirection: "column", padding: 5, flex: 2, overflow: "hidden" }}>
            <TS style={{ flex: 1, display: "flex", flexDirection: "column" }} />
            <TSLint style={{ flex: 1, display: "flex", flexDirection: "column" }} />
          </div>
        </div>
      </div>
    );
  }
}

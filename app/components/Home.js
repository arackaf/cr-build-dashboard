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

var PATH = "";

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
  state = { output: "", lastUpdate: null, lastUpdateDisplay: "" };
  calculateLastUpdateDisplay(lastUpdate) {
    clearTimeout(this.timeoutValue);
    if (!lastUpdate) {
      return ``;
    }

    let delta = ~~((new Date() - lastUpdate) / 1000);
    this.timeoutValue = setTimeout(() => {
      let newDisplay = this.calculateLastUpdateDisplay(this.state.lastUpdate);
      this.setState({ lastUpdateDisplay: newDisplay });
    }, delta < 60 ? 5000 : 1000 * 60);

    if (delta < 2) {
      return `<span class="wp-success">Just now <i class="far fa-check"></i></span>`;
    }
    if (delta >= 60) {
      let minutes = ~~(delta / 60);
      return `Last updated: ${minutes} minute${minutes == 1 ? "" : "s"} ago`;
    }
    return `Last updated: ${delta} seconds ago`;
  }
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
      .replace(/\s+([a-zA-Z0-9\.\-\~]*\.js)/gi, (str, file) => str.replace(file, `<span class="wp-success">${file}</span>`))
      .replace(
        /(Entrypoint)\s+(\S+)\s+=/gi,
        (str, entrypoint, name) => `<span class="wp-stat">Entrypoint</span> ${name} <span class="wp-stat">=</span>`
      )
      .replace(/\+\s+\d+ hidden modules/gi, str => `<span class="wp-stat">${str}</span>`)
      .replace(/\[\d+\s+\warnings?\]/gi, str => `<span class="wp-warning">${str}</span>`);

    let old = this.state.output;
    let output = old + text;
    let lastUpdate = /Webpack is watching the files/g.test(text) ? null : +new Date();
    this.setState({ output, lastUpdate, lastUpdateDisplay: this.calculateLastUpdateDisplay(lastUpdate) });
  };
  clear = () => {
    this.setState({ output: "", lastUpdateDisplay: "", lastUpdate: null });
  };
  stop = () => {
    this.cli.cleanup();
    this.setState({ output: "<br/>STOPPED" });
  };
  restart = () => {
    this.clear();
    this.cli.restart();
  };
  render() {
    let { style, ...rest } = this.props;
    let { lastUpdateDisplay } = this.state;
    return (
      <div style={{ ...style, overflow: "hidden" }} {...rest}>
        <div style={{}}>
          <button onClick={this.clear} className={styles.btn}>
            <i className="fas fa-ban" />
          </button>
          <button onClick={this.restart} className={styles.btn}>
            <i className="far fa-sync" />
          </button>
          <button onClick={this.stop} className={styles.btn} style={{ marginLeft: "15px" }}>
            <i className="far fa-stop-circle" />
          </button>
          &nbsp; &nbsp;
          <span dangerouslySetInnerHTML={{ __html: lastUpdateDisplay }} />
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
  clear = () => {
    this.setState({ output: "" });
  };
  stop = () => {
    this.cli.cleanup();
    this.setState({ output: "<br/>STOPPED" });
  };
  restart = () => {
    this.clear();
    this.cli.restart();
  };
  render() {
    let { style, ...rest } = this.props;
    return (
      <div style={{ ...style, overflow: "hidden" }} {...rest}>
        <div style={{}}>
          <button onClick={this.clear} className={styles.btn}>
            <i className="fas fa-ban" />
          </button>
          <button onClick={this.restart} className={styles.btn}>
            <i className="far fa-sync" />
          </button>
          <button onClick={this.stop} className={styles.btn} style={{ marginLeft: "15px" }}>
            <i className="far fa-stop-circle" />
          </button>
        </div>
        <CliProcess
          ref={c => (this.cli = c)}
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
    let { isOpen, onClose, modulesMap, saveModules, savePath, hasPath, path } = this.props;
    return (
      <div className={"menu" + (isOpen ? " active" : "")}>
        <a onClick={onClose} style={{ color: "black" }}>
          <i className="far fa-arrow-left" />
        </a>
        <br />
        <br />
        <input defaultValue={path} ref={el => (this.pathEl = el)} />
        <br />
        <button className={styles.btn} style={{ backgroundColor: "blue", color: "white" }} onClick={() => savePath(this.pathEl.value)}>
          Save path
        </button>
        <br />
        <br />
        {hasPath ? (
          <div>
            {modules.map(m => (
              <div key={m}>
                <label>
                  <input ref={el => (this["modCb" + m] = el)} type="checkbox" defaultChecked={!!modulesMap[m]} /> {m}
                </label>
              </div>
            ))}
            <button
              className={styles.btn}
              style={{ backgroundColor: "blue", color: "white" }}
              onClick={() => saveModules(modules.filter(m => this["modCb" + m].checked))}
            >
              Save
            </button>
          </div>
        ) : null}
      </div>
    );
  }
}

//RACKIS: c:/git/MainLine/members

export default class Home extends Component {
  state = { menuOpen: false, modulesMap: {}, modulesBuilt: false, hasPath: false, path: "" };
  menuClose = () => this.setState({ menuOpen: false });
  componentDidMount() {
    if (!store.get("path")) {
      this.setState({ menuOpen: true });
    } else {
      this.savePath(store.get("path"));
      this.syncModulesState();
    }

    window.onkeydown = this.keyDown;
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.path != this.state.path && this.state.path) {
      this.syncModulesState();
    }
  }
  savePath = path => {
    if (!path) return;
    store.set("path", path);
    PATH = path;
    this.setState({ path, hasPath: true });
  };
  syncModulesState() {
    if (!store.get("webpackModules")) {
      store.set("webpackModules", { contacts: true });
      this.createAndSyncModules(["contacts"]);
    } else {
      this.setState({ modulesBuilt: true });
      let currentMap = store.get("webpackModules");
      this.createAndSyncModules(Object.keys(currentMap).filter(k => currentMap[k]));
    }
  }
  createAndSyncModules = toSave => {
    let wp = spawn("node", ["createWebpackRouter.js", toSave.join(",")], {
      cwd: PATH + "/build"
    });
    wp.on("exit", () => {
      let newMap = toSave.reduce((hash, k) => ((hash[k] = true), hash), {});
      store.set("webpackModules", newMap);
      this.setState({ modulesMap: newMap, modulesBuilt: true });
      this.menuClose();
    });
  };

  keyDown = evt => {
    let target = evt.target;
    if (target && /input/i.test(target.tagName) && target.type == "text") return;
    if (evt.keyCode == 83) {
      this.setState({ menuOpen: !this.state.menuOpen });
    }
  };
  render() {
    let { modulesMap, menuOpen, modulesBuilt, hasPath, path } = this.state;
    let MenuComp = (
      <Menu
        {...{ modulesMap, hasPath, path }}
        savePath={this.savePath}
        onClose={this.menuClose}
        saveModules={this.createAndSyncModules}
        isOpen={menuOpen}
      />
    );

    if (!modulesBuilt || !hasPath) {
      if (!hasPath) {
        return MenuComp;
      }
      return null;
    }
    return (
      <div>
        {this.state.menuOpen ? MenuComp : null}
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

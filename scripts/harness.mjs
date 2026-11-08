/*
 * Shared harness for the dsh-shooter offline tests.
 *
 * Loads the real client.js bundle in Node by faking the only two host
 * interfaces it touches: `window.__ModuleLoader__` and `require('react')`.
 * Everything else (game physics, AI, drawing calls) runs unmodified.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CLIENT_SOURCE = readFileSync(join(HERE, '..', 'client.js'), 'utf8');

/** A hook-aware React stub: enough for one render pass of ShooterPanel(). */
export function createReactStub(hookStore) {
  return {
    createElement(type, props, ...children) {
      const next = Object.assign({}, props || {});
      if (children.length === 1) next.children = children[0];
      else if (children.length > 1) next.children = children;
      return { type, props: next };
    },
    useRef() {
      const index = hookStore.refIndex++;
      if (hookStore.refs[index] === undefined) hookStore.refs[index] = { current: null };
      return hookStore.refs[index];
    },
    useState(initial) {
      const index = hookStore.stateIndex++;
      if (hookStore.states[index] === undefined) hookStore.states[index] = { value: initial };
      const slot = hookStore.states[index];
      const set = (value) => {
        slot.value = typeof value === 'function' ? value(slot.value) : value;
      };
      return [slot.value, set];
    },
    useEffect() {},
    useReducer(reducer, initial) {
      return [initial, () => {}];
    }
  };
}

/** An in-memory localStorage stand-in for tests that need persistence. */
export function createStorage() {
  const data = new Map();
  return {
    data,
    getItem(key) {
      const k = String(key);
      return data.has(k) ? data.get(k) : null;
    },
    setItem(key, value) {
      data.set(String(key), String(value));
    },
    removeItem(key) {
      data.delete(String(key));
    }
  };
}

export function createHookStore() {
  return {
    refIndex: 0,
    stateIndex: 0,
    refs: [],
    states: [],
    reset() {
      this.refIndex = 0;
      this.stateIndex = 0;
    }
  };
}

/** A fake canvas + rAF environment. `step(n)` drives the animation loop. */
export function createEnv({ width = 960, height = 600 } = {}) {
  const rafQueue = [];
  let clock = 0;
  const viewport = () => ({ left: 0, top: 0, right: width, bottom: height, width, height });

  let canvas = null;
  const ctx = new Proxy(
    {},
    {
      get(target, prop) {
        if (Object.prototype.hasOwnProperty.call(target, prop)) return target[prop];
        if (prop === 'canvas') return canvas;
        return () => {};
      },
      set(target, prop, value) {
        target[prop] = value;
        return true;
      }
    }
  );

  canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx,
    getBoundingClientRect: viewport,
    parentElement: { clientWidth: width, clientHeight: height, getBoundingClientRect: viewport }
  };

  const listeners = new Map();
  const windowStub = {
    __ModuleLoader__: { load() {} },
    devicePixelRatio: 1,
    requestAnimationFrame(cb) {
      rafQueue.push(cb);
      return rafQueue.length;
    },
    cancelAnimationFrame() {
      rafQueue.length = 0;
    },
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    removeEventListener(type, fn) {
      const list = listeners.get(type);
      if (list === undefined) return;
      const index = list.indexOf(fn);
      if (index >= 0) list.splice(index, 1);
    }
  };
  globalThis.window = windowStub;

  return {
    canvas,
    ctx,
    windowStub,
    rafQueue,
    /** Dispatch a DOM event to window listeners (keydown etc.). */
    dispatch(type, event = {}) {
      const list = (listeners.get(type) || []).slice();
      const evt = Object.assign({ type, key: '', target: null, preventDefault() {} }, event);
      for (const fn of list) fn(evt);
      return evt;
    },
    /** step(frames) drives rAF without a timestamp (legacy); step(frames, ms)
     *  feeds a monotonically increasing timestamp, like a real browser at ms/frame. */
    step(frames, frameMs) {
      for (let i = 0; i < frames; i++) {
        const cb = rafQueue.shift();
        if (cb === undefined) throw new Error('requestAnimationFrame queue ran dry');
        if (typeof frameMs === 'number') {
          clock += frameMs;
          cb(clock);
        } else {
          cb();
        }
      }
    }
  };
}

export function loadClient(env, React) {
  let captured = null;
  env.windowStub.__ModuleLoader__.load = (mod) => {
    captured = mod;
  };
  new Function(CLIENT_SOURCE)();
  if (captured === null) throw new Error('client.js did not register with __ModuleLoader__');
  return captured.factory((id) => {
    if (id === 'react') return React;
    throw new Error('unexpected require: ' + id);
  });
}

/** Register the real locale dictionaries so t() returns actual UI strings. */
export function applyLocale(mod, locale = 'zh') {
  let dict = {};
  const ctx = {
    locale: {
      register(_ns, dictionaries) {
        dict = (dictionaries && dictionaries[locale]) || dictionaries || {};
        return () => {};
      },
      bind() {
        return (key) => (dict[key] !== undefined ? dict[key] : key);
      },
      subscribe() {
        return () => {};
      }
    },
    effect(fn) {
      fn();
      return () => {};
    },
    slots: {
      inject(_name, cb) {
        cb();
      },
      register() {
        return {};
      }
    }
  };
  mod.apply(ctx);
  return ctx;
}

export function collectText(node, out = []) {
  if (node === null || node === undefined || node === false) return out;
  if (Array.isArray(node)) {
    for (const item of node) collectText(item, out);
    return out;
  }
  if (typeof node === 'string' || typeof node === 'number') {
    out.push(String(node));
    return out;
  }
  if (typeof node === 'object' && node.props !== undefined) {
    collectText(node.props.children, out);
  }
  return out;
}

export function findElements(node, predicate, out = []) {
  if (node === null || node === undefined || node === false) return out;
  if (Array.isArray(node)) {
    for (const item of node) findElements(item, predicate, out);
    return out;
  }
  if (typeof node !== 'object') return out;
  if (predicate(node)) out.push(node);
  if (node.props !== undefined) findElements(node.props.children, predicate, out);
  return out;
}

export function textOf(node) {
  return collectText(node).join(' ').replace(/\s+/g, ' ').trim();
}

var i = (e, n) => () => (n || e((n = { exports: {} }).exports, n), n.exports);
import { contextBridge as s, ipcRenderer as r } from "electron";
var d = i(() => {
  s.exposeInMainWorld("ipcRenderer", {
    on(...e) {
      const [n, o] = e;
      return r.on(n, (t, ...c) => o(t, ...c));
    },
    off(...e) {
      const [n, ...o] = e;
      return r.off(n, ...o);
    },
    send(...e) {
      const [n, ...o] = e;
      return r.send(n, ...o);
    },
    invoke(...e) {
      const [n, ...o] = e;
      return r.invoke(n, ...o);
    }
  });
});
export default d();

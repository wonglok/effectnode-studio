import React, { useContext, useEffect, useRef } from "react";
import { ProjectContext } from "../ProjectPage";
import { useServer, useWorkbench } from "./useWorkbench";

export function PreviewBox() {
  const scroller = useRef();
  const webview = useRef();
  const [logs, setLogs] = useState([]);
  const { url } = useContext(ProjectContext);
  const { state } = useWorkbench({ projectRoot: url });
  const { previewURL } = useServer({ projectRoot: url });

  useEffect(() => {
    let logger = (e) => {
      if (!webview.current) {
        return;
      }
      // console.log(e);

      console.log("[GUEST]:", e.message);
      setLogs((s) => {
        let logsss = s.length;
        if (logsss >= 100) {
          return [...s, e.message]
            .slice()
            .reverse()
            .filter((e, i) => {
              return i <= 100;
            })
            .reverse();
        } else {
          return [...s, e.message];
        }
      });
      if (scroller.current) {
        scroller.current.scrollTop = scroller.current.scrollHeight;
      }
    };
    webview.current.addEventListener("console-message", logger);
    return () => {
      webview.current.removeEventListener("console-message", logger);
    };
  }, []);

  useEffect(() => {
    let sendJS = () => {
      webview.current.executeJavaScript(`
        if (window.StreamInput) {
          window.StreamInput(${JSON.stringify(state)});
        } else {
          console.log('window.StreamInput not found');
        }
      `);
    };
    let once = () => {
      sendJS();
      webview.current.removeEventListener("dom-ready", once);
    };
    webview.current.addEventListener("dom-ready", once);
    webview.current.src = previewURL;
    console.log(previewURL);
  });

  return (
    <div className="h-full w-full">
      <webview ref={webview} style={{ height: "calc(100% - 250px)" }}></webview>
      <div
        className={"w-full overflow-scroll"}
        ref={scroller}
        style={{ height: `250px` }}
      >
        {logs.map((log, li) => (
          <div
            key={"aa" + li}
            className={"p-1 mt-1 text-sm border bg-yellow-200 whitespace-pre"}
          >
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

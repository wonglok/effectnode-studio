/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useRef } from "react";
import { ProjectContext } from "../pages/Project";

export function PreviewBox() {
  const scroller = useRef();
  const webview = useRef();
  const { server, lowdb } = useContext(ProjectContext);

  useEffect(() => {
    let clean = () => {};

    let streamState = () => {
      if (webview.current) {
        try {
          webview.current.contentWindow.postMessage(
            {
              type: "stream-input",
              args: lowdb.getState(),
            },
            "*"
          );

          // webview.current.executeJavaScript(`
          //   if (window.StreamInput) {
          //     window.StreamInput(${JSON.stringify(lowdb.getState())});
          //   } else {
          //     console.log('window.StreamInput not found');
          //   }
          // `);
        } catch (e) {
          console.log(e);
        }
      }
    };

    let flushAfterRefresh = () => {
      let once = () => {
        streamState();
        webview.current.removeEventListener("dom-ready", once);
      };
      webview.current.addEventListener("dom-ready", once);
      webview.current.src = `http://localhost:${server.port}?r=${0}`;
      // streamState();
    };

    flushAfterRefresh();

    if (server && server.onDonePack) {
      clean = server.onDonePack(({ port }) => {
        if (webview.current) {
          flushAfterRefresh();
        }
      });
    }

    window.addEventListener("reload-page", flushAfterRefresh);
    window.addEventListener("stream-state-to-webview", streamState);
    return () => {
      clean();
      window.removeEventListener("reload-page", flushAfterRefresh);
      window.removeEventListener("stream-state-to-webview", streamState);
    };
  });

  useEffect(() => {
    let logger = (e) => {
      if (e.data.type && ["error", "log"].includes(e.data.type)) {
      } else if (e.data.type === "request-input-stream") {
        window.dispatchEvent(
          new CustomEvent("stream-state-to-webview", { detail: {} })
        );
        return;
      }

      if (!webview.current) {
        return;
      }

      if (scroller.current) {
        let domList = scroller.current.querySelectorAll(".MY_LOG");
        if (domList.length >= 100) {
          for (let i = 0; i < domList.length; i++) {
            if (i < domList.length - 100) {
              domList[i].remove();
            }
          }
        }

        let data = { type: "log", args: [] };
        try {
          let temp = e.data;
          if (temp.type) {
            data.type = temp.type;
          }
          if (temp.args) {
            data.args = temp.args;
          }
        } catch (e) {
          console.log(e);
        }

        let getColor = (type = "log") => {
          if (type === "log") {
            return " bg-yellow-200";
          } else if (type === "error") {
            return " bg-red-200";
          } else {
            return " bg-yellow-200";
          }
        };

        let logMsg = "";

        if (data.args.join) {
          logMsg = data.args.join(", ");
        }

        let div = document.createElement("div");
        div.innerHTML = `<div
          class="MY_LOG p-1 mt-1 text-sm border whitespace-pre mb-4 ${getColor(
            data.type
          )}"
        >${logMsg}</div>`;
        scroller.current.appendChild(div);

        scroller.current.scrollTop = scroller.current.scrollHeight;
      }
    };

    let resetLogs = () => {
      scroller.current.innerHTML = "";
      // let domList = scroller.current.querySelectorAll(".MY_LOG");
      // for (let i = 0; i < domList.length; i++) {
      //   // domList[i].remove();
      // }
    };

    let logPacking = ({ detail }) => {
      logger({ data: { type: "log", args: detail.args } });
    };
    window.addEventListener("reload-page", resetLogs);
    window.addEventListener("message", logger, false);
    window.addEventListener("log-packing", logPacking);
    return () => {
      window.removeEventListener("log-packing", logPacking);
      window.removeEventListener("reload-page", resetLogs);
      window.removeEventListener("message", logger, false);
    };
  }, []);

  return (
    <div className="h-full w-full">
      <iframe
        title={"lovelove"}
        ref={webview}
        style={{ height: "calc(100% - 250px)", width: "100%" }}
      ></iframe>
      <div
        className={"w-full overflow-scroll"}
        ref={scroller}
        style={{ height: `250px` }}
      ></div>
    </div>
  );
}

// boxA has textureA
// render data into textureA

// boxB hs textureB
// read textureA then render data into textureB

// boxB uses textureA
// render data into textureB

//

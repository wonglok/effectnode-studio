/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useRef, useState } from "react";
import { ProjectContext } from "../pages/Project";

export function PreviewBox() {
  const scroller = useRef();
  const webview = useRef();
  const { server, lowdb } = useContext(ProjectContext);

  // useEffect(() => {
  //   let logger = (e) => {
  //     console.log(`[GUEST]`, e.message);
  //   };
  //   webview.current.addEventListener("console-message", logger);
  //   return () => {
  //     webview.current.removeEventListener("console-message", logger);
  //   };
  // }, []);

  /*
  // displayName
  server = {
      port,
      pack: async () => {
        await bundler.bundle();
      },
      onDonePack: (donePack) => {
        window.addEventListener("done-packing", () => {
          donePack({ port });
        });
        return () => {
          window.removeEventListener("done-packing", () => {
            donePack({ port });
          });
        };
      },
    }
  */

  useEffect(() => {
    let clean = () => {};

    let streamState = () => {
      if (webview.current) {
        try {
          webview.current.executeJavaScript(`
          if (window.StreamInput) {
            window.StreamInput(${JSON.stringify(lowdb.getState())});
          } else {
            console.log('window.StreamInput not found');
          }
        `);
        } catch (e) {
          console.log(e);
        }
      }
    };

    let flushAfterRefresh = () => {
      webview.current.src = `http://localhost:${server.port}?r=${0}`;
      let once = () => {
        streamState();
        webview.current.removeEventListener("dom-ready", once);
      };
      webview.current.addEventListener("dom-ready", once);
      streamState();
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
        let div = document.createElement("div");
        div.innerHTML = `<div
          class="MY_LOG p-1 mt-1 text-sm border bg-yellow-200 whitespace-pre mb-4"
        >${e.message}</div>`;
        scroller.current.appendChild(div);

        scroller.current.scrollTop = scroller.current.scrollHeight;
      }
    };

    webview.current.addEventListener("console-message", logger);
    return () => {
      webview.current.removeEventListener("console-message", logger);
    };
  }, []);

  return (
    <div className="h-full w-full">
      <webview ref={webview} style={{ height: "calc(100% - 250px)" }}></webview>
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

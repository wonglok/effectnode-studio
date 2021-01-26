/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useRef } from "react";
import { ProjectContext } from "../pages/Project";

export function PreviewBox() {
  const webview = useRef();
  const { server, lowdb } = useContext(ProjectContext);

  useEffect(() => {
    let logger = (e) => {
      console.log(`[GUEST]`, e.message);
    };
    webview.current.addEventListener("console-message", logger);
    return () => {
      webview.current.removeEventListener("console-message", logger);
    };
  }, []);

  /*
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
    let sendJS = () => {
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

    let flush = () => {
      let once = () => {
        sendJS();
        webview.current.removeEventListener("dom-ready", once);
      };
      webview.current.addEventListener("dom-ready", once);
      sendJS();
    };

    let clean = () => {};
    webview.current.src = `http://localhost:${server.port}?r=${0}`;
    flush();
    if (server && server.onDonePack) {
      clean = server.onDonePack(({ port }) => {
        if (webview.current) {
          webview.current.src = `http://localhost:${port}?r=${Math.random()}`;
          flush();
        }
      });
    }

    // webview.current.src = previewURL;
    // console.log(previewURL);

    return () => {
      clean();
    };
  });

  return (
    <div className="h-full w-full">
      <webview ref={webview} className="h-full"></webview>
    </div>
  );
}

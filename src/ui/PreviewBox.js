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

    // webview.current.src = previewURL;
    // console.log(previewURL);

    window.addEventListener("reload-page", flushAfterRefresh);
    window.addEventListener("stream-to-webview", streamState);
    return () => {
      clean();
      window.removeEventListener("reload-page", flushAfterRefresh);
      window.removeEventListener("stream-to-webview", streamState);
    };
  });

  return (
    <div className="h-full w-full">
      <webview ref={webview} className="h-full"></webview>
    </div>
  );
}

// boxA has textureA
// render data into textureA

// boxB hs textureB
// read textureA then render data into textureB

// boxB uses textureA
// render data into textureB

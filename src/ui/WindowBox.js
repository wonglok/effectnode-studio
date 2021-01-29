/* eslint-disable no-empty-pattern */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useRef, useState } from "react";
import { useDrag, useMove } from "react-use-gesture";
import { ProjectContext } from "../pages/Project.js";
import { PreviewBox } from "./PreviewBox.js";
import { SVGArea } from "./SVGArea.js";

export function WindowTemplate({
  children,
  toolBarClassName = "bg-green-400",
  initVal,
  showToolBtn = true,
  onChange = () => {},
}) {
  const { useWinBox } = useContext(ProjectContext);
  const winboxes = useWinBox((s) => s.winboxes);

  const [rect, set] = useState(initVal || { x: 0, y: 0, w: 100, h: 100 });
  const toolbar = useDrag(({ down, delta: [dx, dy] }) => {
    if (down) {
      set((s) => ({ ...s, x: s.x + dx, y: s.y + dy }));
    }
    if (!down) {
      onChange(rect);
      onZIndex();
    }
  });

  useEffect(() => {
    set(initVal);
  }, [initVal]);

  const resizerBR = useDrag(({ down, delta: [dx, dy] }) => {
    if (down) {
      set((s) => {
        let output = {
          ...s,
          w: (Number(rect.w + 0) + dx).toFixed(1),
          h: (Number(rect.h + 0) + dy).toFixed(1),
        };
        if (output.w < 100) {
          output.w = 100;
        }
        if (output.h < 100) {
          output.h = 100;
        }
        return output;
      });
    }
    if (!down) {
      onChange(rect);
    }
  });

  const resizerBL = useDrag(({ down, delta: [dx, dy] }) => {
    if (down) {
      set((s) => {
        let output = {
          ...s,
          x: rect.x + dx,
          w: (Number(rect.w + 0) - dx).toFixed(1),
          h: (Number(rect.h + 0) + dy).toFixed(1),
        };
        if (output.w < 100) {
          output.w = 100;
          output.x -= dx;
        }
        if (output.h < 100) {
          output.h = 100;
        }
        return output;
      });
    }
    if (!down) {
      onChange(rect);
    }
  });

  const hide = () => {
    onChange({ ...rect, hidden: true });
  };

  const close = () => {
    window.dispatchEvent(
      new CustomEvent("close-window", { detail: { win: rect } })
    );
  };

  const getZMax = () => {
    let zidx = winboxes.map((e, i) => e.zIndex || i);
    if (zidx.length === 0) {
      zidx = [1];
    }
    let max = Math.max(...zidx) || 1;
    if (max >= 65535) {
      max = 1;
    }
    if (max === Infinity) {
      max = 1;
    }
    return max;
  };

  const onZIndex = () => {
    let max = getZMax();
    set({ ...rect, zIndex: max + 1 });
    onChange({ ...rect, zIndex: max + 1 });
    // window.dispatchEvent(new CustomEvent("relayout-zindex"));
  };

  return (
    <div
      onMouseDown={onZIndex}
      className={
        " border absolute group top-0 left-0 bg-white text-black overflow-hidden rounded-lg"
      }
      style={{
        zIndex: 10 + (rect.zIndex || 0),
        width: `${rect.w}px`,
        height: `${rect.h}px`,
        borderColor: "#003E42",
        transform: `translate3d(${rect.x}px, ${rect.y}px, 0px)`,
      }}
    >
      <div
        style={{ height: 25 + "px" }}
        className={
          "w-full px-1 text-sm flex justify-between items-center " +
          toolBarClassName
        }
        {...toolbar()}
      >
        <div>{initVal.name}</div>
        {showToolBtn && (
          <div className={"flex"}>
            <div
              className="h-4 w-4 mr-1 rounded-full bg-yellow-500 cursor-pointer"
              onClick={() => {
                hide();
              }}
            ></div>
            <div
              className="h-4 w-4 rounded-full mr-1 bg-red-500 cursor-pointer"
              onClick={() => {
                close();
              }}
            ></div>
          </div>
        )}
      </div>
      <div className="relative" style={{ height: `${rect.h - 25}px` }}>
        {children}
      </div>

      <div
        style={{ zIndex: 10000000 }}
        className=" transition-opacity duration-500 opacity-0 group-hover:opacity-100 rounded-full w-3 h-3 absolute bottom-1 right-1 bg-blue-500 cursor-move"
        {...resizerBR()}
      ></div>

      <div
        style={{ zIndex: 10000000 }}
        className=" transition-opacity duration-500 opacity-0 group-hover:opacity-100 rounded-full w-3 h-3 absolute bottom-1 left-1 bg-blue-500 cursor-move"
        {...resizerBL()}
      ></div>
    </div>
  );
}

export function AlwaysHereWindow({ children, name, pos }) {
  let { useWinBox } = useContext(ProjectContext);
  let getDoc = useWinBox((s) => s.getDoc);
  let makeDoc = useWinBox((s) => s.makeDoc);
  let save = useWinBox((s) => s.save);
  let getSlug = useWinBox((s) => s.getSlug);
  let [doc, setDoc] = useState(false);

  useEffect(() => {
    getDoc({ _id: getSlug(name) }).then(async (doc) => {
      if (doc) {
        setDoc(doc);
      } else {
        let doc = await makeDoc({ name: name, pos });
        doc._id = getSlug(name);
        await save({ doc });
        setDoc(doc);
      }
    });
  }, [name]);

  let onSave = async (rect) => {
    await save({ doc: rect });
    setDoc(rect);
    window.dispatchEvent(
      new CustomEvent("winbox-needs-layout", { detail: {} })
    );
  };

  useEffect(() => {
    let layout = async () => {
      let doc = await getDoc({ _id: getSlug(name) });
      setDoc({ ...doc });
    };
    return () => {
      window.removeEventListener("winbox-needs-layout", layout);
    };
  }, [name]);

  return (
    doc && (
      <WindowTemplate
        initVal={doc}
        toolBarClassName={"bg-green-400"}
        showToolBtn={false}
        onChange={onSave}
      >
        {children}
      </WindowTemplate>
    )
  );
}

export function ModueWindow({ children, winID }) {
  let { useWinBox } = useContext(ProjectContext);
  let getDoc = useWinBox((s) => s.getDoc);
  let save = useWinBox((s) => s.save);
  let [doc, setDoc] = useState(false);
  // let getSlug = useWinBox((s) => s.getSlug);

  useEffect(() => {
    getDoc({ _id: winID }).then(async (doc) => {
      if (doc) {
        setDoc(doc);
      } else {
        console.log("cannot find window for module");
      }
    });
  }, [winID]);

  let onSave = async (rect) => {
    await save({ doc: rect });
    setDoc(rect);
    window.dispatchEvent(
      new CustomEvent("winbox-needs-layout", { detail: {} })
    );
  };

  useEffect(() => {
    let layout = async () => {
      let doc = await getDoc({ _id: winID });
      setDoc({ ...doc });
    };
    window.addEventListener("winbox-needs-layout", layout);
    return () => {
      window.removeEventListener("winbox-needs-layout", layout);
    };
  }, [winID]);

  return (
    doc && (
      <WindowTemplate
        initVal={doc}
        toolBarClassName={"bg-green-400"}
        showToolBtn={true}
        onChange={onSave}
      >
        {children}
      </WindowTemplate>
    )
  );
}

function ModulesSet() {
  let { useWinBox } = useContext(ProjectContext);
  let winsUtils = useWinBox((s) => s);

  let [modWindows, setModWindows] = useState([]);

  useEffect(() => {
    let addWin = ({ detail: { box } }) => {
      winsUtils.getDoc({ _id: box._id }).then(async (doc) => {
        if (doc) {
          console.log(doc);
          // setDoc(doc);
          doc.zIndex = 4000000;
          await winsUtils.save({ doc });
          window.dispatchEvent(
            new CustomEvent("module-winbox-needs-layout", { detail: {} })
          );
        } else {
          let doc = await winsUtils.makeDoc({ name: box.displayName });
          doc._id = box._id;
          doc.type = "ModuleWindow";
          doc.zIndex = 4000000;
          doc.x = modWindows.length * 30;
          doc.y = modWindows.length * 30;
          await winsUtils.save({ doc });
          window.dispatchEvent(
            new CustomEvent("module-winbox-needs-layout", { detail: {} })
          );
        }
      });
    };
    window.addEventListener("provide-module-edit-window", addWin);
    return () => {
      window.removeEventListener("provide-module-edit-window", addWin);
    };
  });

  useEffect(() => {
    let reloadModWins = () => {
      winsUtils.reload().then((snaps) => {
        let latest = snaps.filter((e) => e.type === "ModuleWindow");
        setModWindows(latest);
      });
    };
    reloadModWins();
    window.addEventListener("module-winbox-needs-layout", reloadModWins);
    return () => {
      window.removeEventListener("module-winbox-needs-layout", reloadModWins);
    };
  }, []);

  useEffect(() => {
    let closeWindow = async ({ detail: { win } }) => {
      // console.log(win);
      await winsUtils.removeDoc({ doc: win });
      window.dispatchEvent(
        new CustomEvent("module-winbox-needs-layout", { detail: {} })
      );
    };
    window.addEventListener("close-window", closeWindow);
    return () => {
      window.removeEventListener("close-window", closeWindow);
    };
  }, []);

  return (
    <span>
      {modWindows.map((w) => {
        return <ModueWindow key={w._id} winID={w._id}></ModueWindow>;
      })}
    </span>
  );
  // return <pre>{JSON.stringify(winboxes, null, 4)}</pre>;
}

export function WindowBox({ children }) {
  return (
    <div className={"relative h-full"}>
      <AlwaysHereWindow
        name="Main Editor"
        pos={{
          x: 10,
          y: 10,
          w: window.innerWidth * 0.45,
          h: window.innerHeight * 0.7,
        }}
      >
        <SVGArea></SVGArea>
      </AlwaysHereWindow>

      <AlwaysHereWindow
        name="Preview Box"
        pos={{
          w: window.innerWidth * 0.45,
          h: window.innerHeight - 20 - 130,
          x: window.innerWidth - window.innerWidth * 0.45 - 10,
          y: 10,
        }}
      >
        <PreviewBox></PreviewBox>
      </AlwaysHereWindow>

      <ModulesSet></ModulesSet>

      {children}

      <TaskBarSet></TaskBarSet>
    </div>
  );
}

function TaskBtn({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      className="px-3 inline-flex items-center bg-opacity-25 bg-white h-full cursor-pointer select-none mr-2 rounded-xl"
    >
      {children}
    </div>
  );
}

export function TaskBarSet() {
  const { useWinBox } = useContext(ProjectContext);
  let getSlug = useWinBox((s) => s.getSlug);
  let save = useWinBox((s) => s.save);
  // const winboxes = useWinBox((s) => s.winboxes);
  let resetWindow = async (name, pos) => {
    let slugName = getSlug(name);
    let doc = { _id: slugName, name, ...pos, hidden: false };
    await save({ doc });
    window.dispatchEvent(
      new CustomEvent("winbox-needs-layout", { detail: {} })
    );
  };

  let relayoutAll = () => {
    relayoutEditor();
    relayoutPreview();
  };

  let relayoutEditor = () => {
    resetWindow("Main Editor", {
      x: 10,
      y: 10,
      w: window.innerWidth * 0.5 - 10 - 10 - 10,
      h: window.innerHeight - 20 - 130,
    });
  };

  let relayoutPreview = () => {
    resetWindow("Preview Box", {
      w: window.innerWidth * 0.5 - 20,
      h: window.innerHeight - 20 - 130,
      x: window.innerWidth - (window.innerWidth * 0.5 - 10) - 10,
      y: 10,
    });
  };

  return (
    <div
      style={{ zIndex: 999999 }}
      className={
        "absolute bottom-0 left-0 w-full bg-opacity-25 bg-black h-12 p-2"
      }
    >
      <TaskBtn onClick={relayoutAll}>Relayout Windows</TaskBtn>
      {/* <TaskBtn onClick={relayoutEditor}>Main Editor</TaskBtn>
    <TaskBtn onClick={relayoutPreview}>Preview Box</TaskBtn> */}
    </div>
  );
}

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { useDrag } from "react-use-gesture";
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
              onClick={() => {}}
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
    window.dispatchEvent(new CustomEvent("winbox-layout", { detail: {} }));
  };

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

export function WindowBox({ children }) {
  // let { useWinBox } = useContext(ProjectContext);

  return (
    <div className={"relative"}>
      <AlwaysHereWindow
        name="Main Editor"
        pos={{
          x: 10,
          y: 10,
          w: window.innerWidth * 0.3333,
          h: window.innerHeight * 0.7,
        }}
      >
        <SVGArea></SVGArea>
      </AlwaysHereWindow>

      <AlwaysHereWindow
        name="Preview Box"
        pos={{
          w: window.innerWidth * 0.3,
          h: window.innerHeight - 20 - 130,
          x: window.innerWidth - window.innerWidth * 0.3 - 10,
          y: 10,
        }}
      >
        <PreviewBox></PreviewBox>
      </AlwaysHereWindow>

      {children}
    </div>
  );
}

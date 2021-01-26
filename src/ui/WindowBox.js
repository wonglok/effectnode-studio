/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { useDrag } from "react-use-gesture";
import { ProjectContext } from "../pages/Project.js";

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

  const onZIndex = () => {
    let zidx = winboxes.map((e) => e.zIndex || 0);
    let max = Math.max(...zidx) || 1;
    if (max > 1000000) {
      max = 0;
    }
    onChange({ ...rect, zIndex: max + 1 });
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
      <div
        className=" transition-opacity duration-500 opacity-0 group-hover:opacity-100 rounded-full w-3 h-3 absolute bottom-1 right-1 bg-blue-500 cursor-move"
        {...resizerBR()}
      ></div>
      <div
        className=" transition-opacity duration-500 opacity-0 group-hover:opacity-100 rounded-full w-3 h-3 absolute bottom-1 left-1 bg-blue-500 cursor-move"
        {...resizerBL()}
      ></div>
      <div onMouseDown={onZIndex} style={{ height: `${rect.h - 25}px` }}>
        {children}
      </div>
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

  // let [doc, ssDoc] = useState(false);
  // let slugName = slug(name);
  // const { useWins } = useContext(ProjectContext);
  // const wins = useWins((s) => s);
  // let getDocFnc = () => {
  //   wins.getDoc({ _id: slugName }).then((e) => {
  //     if (!e) {
  //       let doc = {
  //         _id: slugName,
  //         name,
  //         x: 0,
  //         y: 0,
  //         w: 300,
  //         h: 300,
  //         ...pos,
  //         hidden: false,
  //       };
  //       wins.setDoc({ doc });
  //       ssDoc(doc);
  //     } else {
  //       ssDoc(e);
  //     }
  //   });
  // };
  // useEffect(() => {
  //   getDocFnc();
  // }, [slugName]);
  // useEffect(() => {
  //   let layout = () => {
  //     getDocFnc();
  //   };
  //   window.addEventListener("relayout", layout);
  //   return () => {
  //     window.removeEventListener("relayout", layout);
  //   };
  // }, []);
  // let onChange = (doc) => {
  //   wins.setDoc({ doc });
  //   setTimeout(() => {
  //     window.dispatchEvent(new CustomEvent("relayout", { detail: doc }));
  //   });
  // };
  // return (
  //   <>
  //     {doc && !doc.hidden && (
  //       <WindowTemplate
  //         showToolBtn={false}
  //         toolBarClassName={
  //           "bg-gradient-to-r from-green-600 via-green-400 to-green-800 text-white"
  //         }
  //         initVal={doc}
  //         onChange={onChange}
  //       >
  //         {children}
  //       </WindowTemplate>
  //     )}
  //   </>
  // );
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
        main
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
        preview
      </AlwaysHereWindow>

      {children}
    </div>
  );
}

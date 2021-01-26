import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDrag, useWheel } from "react-use-gesture";
import { ProjectContext } from "../pages/Project";
let path = window.require("path");

export function Box({ box }) {
  const [rID, refresh] = useState(0);
  const { boxesUtil, root } = useContext(ProjectContext);

  let updateBox = (box) => {
    boxesUtil.updateBox(box);
    refresh((s) => s + 1);
  };

  const [drag, setDrag] = useState({ x: box.x, y: box.y });
  const bind = useDrag(({ down, delta: [dx, dy] }) => {
    if (box.isFixed) {
      return;
    }
    if (down) {
      setDrag((s) => {
        return { ...s, x: s.x + dx, y: s.y + dy };
      });
    } else if (!down) {
      updateBox({ ...box, ...drag });
    }
    // console.log([dx, dy])
  });

  let openFileEditor = ({ box }) => {
    let { ipcRenderer } = window.require("electron");
    let filePath = boxesUtil.resolvePath({ box });
    ipcRenderer.send("open", filePath, root);
  };

  const onClickLabel = async () => {
    openFileEditor({ box: box });
  };

  const onClickRemoveLabel = async () => {
    smalltalk.confirm("Question", "Are you sure?").then(() => {
      // boxesUtil.removeBox();
    });
  };

  let paddingX = 10;
  let fontSize = 16;
  let paddingY = 8;
  let chars = 6;
  return (
    <g transform={`translate(${drag.x}, ${drag.y})`}>
      <rect
        className={box.isFixed ? "cursor-not-allowed" : "cursor-move"}
        {...bind()}
        stroke={"white"}
        fill="#ececec"
        width={chars * 10 + paddingX}
        height={fontSize + paddingY}
      ></rect>
      <text
        onClick={onClickLabel}
        className="select-none underline"
        fill={"#ececec"}
        {...bind()}
        x={chars * 10 + paddingX + paddingX}
        y={fontSize + 1}
        fontSize={fontSize + "px"}
      >
        {box.displayName || box.name}
      </text>
      <text
        onClick={onClickRemoveLabel}
        className="select-none underline"
        fill={"#ffecec"}
        {...bind()}
        x={chars * 10 + paddingX + paddingX}
        y={fontSize + 1 + fontSize + 1 + 10}
        fontSize={fontSize + "px"}
      >
        Remove
      </text>
      {/* <text y={-20} fontSize={'12px'}>{JSON.stringify(box)}</text> */}
    </g>
  );
}

export function EntryCore() {
  // const { root } = useContext(ProjectContext);
  const coreBox = {
    isEntry: true,
    isFixed: true,
    protected: true,
    _id: "AAAAAAA",
    x: 130,
    y: 10,
    name: "Main Entry Function",
    file: "entry.js",
  };
  return <Box box={coreBox}></Box>;
}

export function SVGEditor({ rect, state }) {
  const [rID, refresh] = useState(0);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const { boxesUtil } = useContext(ProjectContext);
  // const { addBox } = useWorkbench({ projectRoot: url });

  const bind = useWheel(({ wheeling, delta: [dx, dy] }) => {
    if (wheeling) {
      setPan((s) => {
        return { ...s, x: s.x + dx, y: s.y + dy };
      });
    }
  });

  const boxes = state.boxes.map((e) => {
    return <Box key={e._id} box={e}></Box>;
  });

  const addModule = async () => {
    await boxesUtil.addBox();
    refresh((s) => s + 1);
    // addBox();
    // console.log(lowdb.get("boxes").value());
  };

  return (
    <svg
      {...bind()}
      style={{ backgroundColor: "#232323" }}
      width={rect.width}
      height={rect.height}
      viewBox={`${pan.x} ${pan.y} ${rect.width} ${rect.height}`}
    >
      <text x={10} y={10 + 17} onClick={addModule} fontSize="17" fill="white">
        Add Module
      </text>
      {boxes}
      <EntryCore></EntryCore>
    </svg>
  );
}

export function SVGArea() {
  let ref = useRef();
  let { lowdb, useWinBox } = useContext(ProjectContext);

  let [rect, setRect] = useState(false);

  useEffect(() => {
    return useWinBox.subscribe(() => {
      let rect = ref.current.getBoundingClientRect();
      setRect(rect);
    });
  }, [useWinBox]);

  useLayoutEffect(() => {
    let rect = ref.current.getBoundingClientRect();
    setRect(rect);

    let relayout = ({ detail }) => {
      let rect = ref.current.getBoundingClientRect();
      setRect(rect);
    };
    window.addEventListener("relayout", relayout);

    return () => {
      window.removeEventListener("relayout", relayout);
    };
  }, []);

  return (
    <div ref={ref} className={"w-full h-full"}>
      {/* {JSON.stringify(lowdb.getState())} */}
      {rect && <SVGEditor rect={rect} state={lowdb.getState()}></SVGEditor>}
    </div>
  );
}

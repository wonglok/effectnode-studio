import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDrag, useWheel } from "react-use-gesture";
import { ProjectContext } from "../pages/Project";
import smalltalk from "smalltalk";

export function Box({ box, graphRefresh = () => {} }) {
  const [rID, refresh] = useState(0);
  const { boxesUtil, root } = useContext(ProjectContext);

  let updateBox = ({ box }) => {
    boxesUtil.updateBox({ box });
    refresh((s) => s + rID + 1);
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
      updateBox({ box: { ...box, ...drag } });
    }
    // console.log([dx, dy])
  });

  let openFileEditor = ({ box }) => {
    let { ipcRenderer } = window.require("electron");
    let filePath = boxesUtil.resolvePath({ box });
    ipcRenderer.send("open", filePath, root);
  };

  const onClickLabel = async () => {
    openFileEditor({ box });
  };

  const onClickRemoveLabel = async () => {
    smalltalk
      .confirm("Remove Box?", `"${box.displayName}"`)
      .then(() => {
        return boxesUtil.removeBox({ box });
      })
      .then(() => {
        graphRefresh((s) => s + 1);
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
      {!box.isProtected && (
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
      )}
      {/* <text y={-20} fontSize={'12px'}>{JSON.stringify(box)}</text> */}
    </g>
  );
}

export function SVGEditor({ rect, state }) {
  const [rID, refresh] = useState(0);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const { boxesUtil, root } = useContext(ProjectContext);
  // const { addBox } = useWorkbench({ projectRoot: url });

  const bind = useWheel(({ wheeling, delta: [dx, dy] }) => {
    if (wheeling) {
      setPan((s) => {
        return { ...s, x: s.x + dx, y: s.y + dy };
      });
    }
  });

  const boxes = state.boxes.map((e) => {
    return <Box key={e._id} box={e} graphRefresh={refresh}></Box>;
  });

  const addModule = async () => {
    await boxesUtil.addBox();
    refresh((s) => s + rID + 1);
    // addBox();
    // console.log(lowdb.get("boxes").value());
  };

  let openCore = () => {
    let { ipcRenderer } = window.require("electron");
    let box = {
      isEntry: true,
      fileName: "entry.js",
    };
    let filePath = boxesUtil.resolvePath({ box });
    ipcRenderer.send("open", filePath, root);
  };

  return (
    <svg
      {...bind()}
      style={{ backgroundColor: "#232323" }}
      width={rect.width}
      height={rect.height}
      viewBox={`${pan.x} ${pan.y} ${rect.width} ${rect.height}`}
    >
      <text
        x={10 + pan.x}
        y={10 + 17 + pan.y}
        onClick={addModule}
        fontSize="17"
        fill="white"
        className="underline"
      >
        Add Module
      </text>

      <text
        x={"Edit Entry File".length * 7 + 10 + pan.x}
        y={10 + 17 + pan.y}
        onClick={openCore}
        fontSize="17"
        fill="white"
        className="underline"
      >
        Edit Entry File
      </text>
      {boxes}
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

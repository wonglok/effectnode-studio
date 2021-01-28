/* eslint-disable react-hooks/exhaustive-deps */
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

const BOX_SEPERATOR = `BOX_`;
const INPUT_SEPERATOR = `_Input_`;
const OUTPUT_SEPERATOR = `_Output_`;
const CONNECTOR_RADIUS = 6.5;

export function Box({
  box,
  graphRefresh = () => {},
  onClickOutput = () => {},
  onClickBox = () => {},
  onClickInput = () => {},
}) {
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
      window.dispatchEvent(
        new CustomEvent("dragged-box", { detail: { boxID: box._id } })
      );
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
  let paddingY = 8 + 10;
  let perCharWidth = 6;
  let displayName = box.displayName || box.name;
  let textLength = 10;

  let boxHeight = fontSize + paddingY;
  let boxWidth = perCharWidth * textLength + paddingX;

  let InputBalls = () => {
    let gap = 3;
    return box.inputs.map((input, index) => {
      return (
        <circle
          key={input._id + box._id}
          style={{ cursor: "pointer" }}
          onClick={() => {
            onClickInput({ type: "input", box, input, handSlotID: input._id });
          }}
          id={`${BOX_SEPERATOR}${box.moduleName}${INPUT_SEPERATOR}${input._id}`}
          r={CONNECTOR_RADIUS}
          cx={CONNECTOR_RADIUS * 1.0 + (CONNECTOR_RADIUS + gap) * 2.0 * index}
          cy={-CONNECTOR_RADIUS * 1.5 - 3}
          fill={"#ddffdd"}
          stroke={"#77ff77"}
        ></circle>
      );
    });
  };
  return (
    <g transform={`translate(${drag.x}, ${drag.y})`}>
      <rect
        onClick={() => onClickBox({ box })}
        className={box.isFixed ? "cursor-not-allowed" : "cursor-move"}
        {...bind()}
        fill={"transparent"}
        stroke="#ececec"
        width={boxWidth}
        height={boxHeight}
      ></rect>

      <text
        onClick={onClickLabel}
        className="select-none underline cursor-pointer"
        fill={"#ececec"}
        {...bind()}
        x={perCharWidth * textLength + paddingX + paddingX}
        y={fontSize + 1 + 3}
        fontSize={fontSize + "px"}
      >
        {displayName}
      </text>

      {!box.isProtected && (
        <text
          onClick={onClickRemoveLabel}
          className="select-none underline cursor-pointer"
          fill={"#ffecec"}
          {...bind()}
          x={perCharWidth * textLength + paddingX + paddingX}
          y={fontSize + 1 + fontSize + 1 + 10}
          fontSize={fontSize + "px"}
        >
          Remove
        </text>
      )}

      {/* Input, Green */}
      {InputBalls()}

      {/* Output Blue */}
      <circle
        style={{ cursor: "pointer" }}
        onClick={() =>
          onClickOutput({ type: "output", box, handSlotID: "output" })
        }
        id={`${BOX_SEPERATOR}${box.moduleName}${OUTPUT_SEPERATOR}${"output"}`}
        r={CONNECTOR_RADIUS}
        cx={CONNECTOR_RADIUS * 0.0 + boxWidth / 2}
        cy={CONNECTOR_RADIUS * 1.5 + boxHeight}
        fill={"#ffdddd"}
        stroke={"#ff7777"}
      ></circle>

      {/* <text y={-20} fontSize={'12px'}>{JSON.stringify(box)}</text> */}
    </g>
  );
}

/**


  const pt = svg.createSVGPoint();

  // pass event coordinates
  pt.x = svg.clientX;
  pt.y = svg.clientY;

  // transform to SVG coordinates
  const svgP = pt.matrixTransform( svg.getScreenCTM().inverse() );
 */

function AutoFlipLine({
  x1,
  x2,
  y1,
  y2,
  animated = false,
  reverse = false,
  distortion = 0,
  force = false,
}) {
  let [offsetAnim, setOffset] = useState(0);
  useEffect(() => {
    let tt = setInterval(() => {
      let factor = 1;
      if (reverse) {
        factor = -1;
      }
      if (animated) {
        setOffset((s) => s + factor * 5);
      }
    }, 16.7);
    return () => {
      clearInterval(tt);
    };
  });

  let dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * 0.5;
  dist += dist * distortion;

  let factorY = y1 < y2 ? 1 : -1;
  let factorX = x1 < x2 ? 1 : -1;
  let whichLine = Math.abs(y2 - y1) >= Math.abs(x2 - x1);

  if (force === "v") {
    whichLine = true;
  }
  if (force === "h") {
    whichLine = false;
  }
  return whichLine ? (
    <path
      className={"pointer-events-none"}
      d={`
M${x1}, ${y1}

C${x1},${y1 + dist * factorY} ${x2},${y2 + dist * -factorY}

${x2},${y2}`}
      fill="none"
      stroke="#bababa"
      strokeDasharray="24"
      strokeWidth="1.5px"
      strokeDashoffset={offsetAnim}
    />
  ) : (
    <path
      className={"pointer-events-none"}
      d={`
M${x1}, ${y1}

C${x1 + dist * factorX},${y1} ${x2 + dist * -factorX},${y2}

${x2},${y2}`}
      fill="none"
      stroke="#bababa"
      strokeWidth="1.5px"
      strokeDasharray="24"
      strokeDashoffset={offsetAnim}
    />
  );
}

function HandLine({ svg, hand }) {
  let [[x1, y1], sxy1] = useState([0, 0]);
  let [[x2, y2], sxy2] = useState([0, 0]);

  useEffect(() => {
    let onMM = () => {
      let element = false;

      if (hand.type === "output") {
        element = svg.querySelector(
          `#${BOX_SEPERATOR}${hand.box.moduleName}${OUTPUT_SEPERATOR}${hand.handSlotID}`
        );
      } else if (hand.type === "input") {
        element = svg.querySelector(
          `#${BOX_SEPERATOR}${hand.box.moduleName}${INPUT_SEPERATOR}${hand.handSlotID}`
        );
      }

      if (!element) {
        return;
      }

      const pt = svg.createSVGPoint();
      let rPt = element.getBoundingClientRect();

      pt.y = rPt.top;
      pt.x = rPt.left;

      // transform to SVG coordinates
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      sxy2([svgP.x + CONNECTOR_RADIUS, svgP.y + CONNECTOR_RADIUS]);
    };
    svg.addEventListener("mousemove", onMM);
    onMM();
    return () => {
      svg.removeEventListener("mousemove", onMM);
    };
  }, [svg, hand]);

  useEffect(() => {
    let onMM = (ev) => {
      const pt = svg.createSVGPoint();

      // pass event coordinates
      pt.x = ev.clientX;
      pt.y = ev.clientY;

      // transform to SVG coordinates
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

      sxy1([svgP.x, svgP.y]);
    };
    svg.addEventListener("mousemove", onMM);

    return () => {
      svg.removeEventListener("mousemove", onMM);
    };
  }, []);

  let canShow = () => {
    return x1 + y1 !== 0;
  };

  return (
    <g>
      {canShow() && (
        <AutoFlipLine
          distortion={0}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          animated={true}
          reverse={hand.type === "input"}
        ></AutoFlipLine>
      )}
    </g>
  );
}
let LogicCable = ({ svg, state, cable, index }) => {
  let [[x1, y1], setPt1] = useState([0, 0]);
  let [[x2, y2], setPt2] = useState([0, 0]);

  let onSVGCoord = (svg, dotEl) => {
    const pt = svg.createSVGPoint();
    let rPt = dotEl.getBoundingClientRect();

    pt.y = rPt.top;
    pt.x = rPt.left;

    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [svgP.x + CONNECTOR_RADIUS, svgP.y + CONNECTOR_RADIUS];
  };

  let inputBox = state.boxes.find((b) => b._id === cable.inputBoxID);
  let outputBox = state.boxes.find((b) => b._id === cable.outputBoxID);

  useEffect(() => {
    let inputSlot = inputBox.inputs.find((i) => i._id === cable.inputSlotID);

    let outputSlotDOM = document.querySelector(
      `#${BOX_SEPERATOR}${outputBox.moduleName}${OUTPUT_SEPERATOR}${"output"}`
    );
    let inputSlotDOM = document.querySelector(
      `#${BOX_SEPERATOR}${inputBox.moduleName}${INPUT_SEPERATOR}${inputSlot._id}`
    );

    if (outputSlotDOM && inputSlotDOM) {
      setPt1(onSVGCoord(svg, inputSlotDOM));
      setPt2(onSVGCoord(svg, outputSlotDOM));
    }

    window.addEventListener("dragged-box", ({ detail: { boxID } }) => {
      if (boxID === inputBox._id || boxID === outputBox._id) {
        if (outputSlotDOM && inputSlotDOM) {
          setPt1(onSVGCoord(svg, inputSlotDOM));
          setPt2(onSVGCoord(svg, outputSlotDOM));
        }
      }
    });
  }, [cable, cable.length, inputBox, outputBox]);

  return (
    <AutoFlipLine
      distortion={0}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      force={"v"}
      animated={true}
      reverse={false}
    ></AutoFlipLine>
  );
};

export function SVGEditor({ rect, state }) {
  const svg = useRef();
  const [rID, refresh] = useState(0);
  const [hand, setHandMode] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const { boxesUtil, root, lowdb } = useContext(ProjectContext);

  // const { addBox } = useWorkbench({ projectRoot: url });

  const bind = useWheel(({ wheeling, delta: [dx, dy] }) => {
    if (wheeling) {
      setPan((s) => {
        return { ...s, x: s.x + dx, y: s.y + dy };
      });
    }
  });

  let checkAddCable = ({ outputBoxID, inputBoxID, inputSlotID }) => {
    let cables = lowdb.getState().cables;
    let res = cables.find((e) => {
      return (
        e.outputBoxID === outputBoxID &&
        e.inputBoxID === inputBoxID &&
        e.inputSlotID === inputSlotID
      );
    });

    if (!res) {
      boxesUtil.addCable({ outputBoxID, inputBoxID, inputSlotID });
    }
    // console.log({ outputBoxID, inputBoxID, inputSlotID });
  };

  let onTryConnect = ({ nowClickedBox, clickedType, clickedInput }) => {
    if (hand.type === "output" && clickedType === "box") {
      let outputBox = hand.box;
      let inputBox = nowClickedBox;

      let input = inputBox.inputs[0];
      let inputSlotID = input._id;

      let outputBoxID = outputBox._id;
      let inputBoxID = inputBox._id;

      checkAddCable({ outputBoxID, inputBoxID, inputSlotID });
      setHandMode(false);
    } else if (hand.type === "input" && clickedType === "box") {
      let inputBox = hand.box;
      let outputBox = nowClickedBox;

      let input = inputBox.inputs[0];
      let inputSlotID = input._id;

      let outputBoxID = outputBox._id;
      let inputBoxID = inputBox._id;

      checkAddCable({ outputBoxID, inputBoxID, inputSlotID });
      setHandMode(false);
    } else if (hand.type === "output" && clickedType === "input") {
      let input = clickedInput;
      let inputSlotID = input._id;

      let outputBox = hand.box;
      let inputBox = nowClickedBox;

      let outputBoxID = outputBox._id;
      let inputBoxID = inputBox._id;

      checkAddCable({ outputBoxID, inputBoxID, inputSlotID });
      setHandMode(false);
    } else if (hand.type === "input" && clickedType === "output") {
      let inputBox = hand.box;
      let outputBox = nowClickedBox;

      let input = hand.input;
      let inputSlotID = input._id;

      let outputBoxID = outputBox._id;
      let inputBoxID = inputBox._id;

      checkAddCable({ outputBoxID, inputBoxID, inputSlotID });
      setHandMode(false);
    } else {
      setHandMode(false);
    }
  };

  const boxes = state.boxes.map((e) => {
    return (
      <Box
        key={e._id}
        box={e}
        onClickBox={({ box }) => {
          if (!hand) {
          } else {
            onTryConnect({
              nowClickedBox: box,
              clickedType: "box",
            });
          }
        }}
        onClickInput={({ type, input, box, handSlotID }) => {
          if (!hand) {
            setHandMode(() => ({
              handSlotID,
              type,
              input,
              box: box,
              visible: true,
            }));
          } else {
            onTryConnect({
              clickedInput: input,
              nowClickedBox: box,
              clickedType: "input",
            });
          }
        }}
        onClickOutput={({ type, box, handSlotID }) => {
          if (!hand) {
            setHandMode((m) => ({
              handSlotID,
              type,
              box: box,
              visible: true,
            }));
          } else {
            onTryConnect({
              nowClickedBox: box,
              clickedType: "output",
            });
          }
        }}
        graphRefresh={refresh}
      ></Box>
    );
  });

  let Cables = () => {
    return state.cables.map((cable, index) => {
      return (
        <LogicCable
          key={cable._id + "_" + index}
          svg={svg.current}
          state={state}
          cable={cable}
          index={index}
        ></LogicCable>
      );
    });
  };

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

  useEffect(() => {
    let esc = (ev) => {
      if (ev.key === "esc" || ev.keyCode === 27) {
        setHandMode(false);
      }
    };
    window.addEventListener("keypress", esc);
    return () => {
      window.removeEventListener("keypress", esc);
    };
  });

  return (
    <svg
      ref={svg}
      {...bind()}
      style={{ backgroundColor: "#232323" }}
      width={rect.width}
      height={rect.height}
      viewBox={`${pan.x} ${pan.y} ${rect.width} ${rect.height}`}
    >
      <rect
        onClick={() => setHandMode(false)}
        x={pan.x}
        y={pan.y}
        width={rect.width}
        height={rect.height}
        fill="gray"
      ></rect>
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

      {svg.current && hand && (
        <HandLine xy2={[200, 200]} svg={svg.current} hand={hand}></HandLine>
      )}

      {svg.current && Cables()}

      {boxes}

      {/* <SlotLine></SlotLine> */}

      {/* <path
        d={`
        M${x1}, ${y1}
        C${(x2 + x1) / 2},${y1} ${(x2 + x1) / 2},${y2}  ${x2},${y2}`}
        fill="none"
        stroke="#000"
        strokeWidth="2px"
      /> */}
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

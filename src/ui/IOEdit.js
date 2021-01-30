/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ProjectContext } from "../pages/Project";
import smalltalk from "./smalltalk/smalltalk";
import { getID } from "../core/codebox";
export function IOEdit({ boxID, win }) {
  const { boxesUtil, lowdb } = useContext(ProjectContext);
  const [, refresh] = useState(0);

  useEffect(() => {
    let reload = () => {
      refresh((s) => s + 1);
    };
    window.addEventListener("reload-page", reload);
    return () => {
      window.removeEventListener("reload-page", reload);
    };
  }, []);

  const box = useMemo(() => {
    let boxoutput = lowdb.getState().boxes.find((b) => b._id === boxID);
    if (!boxoutput) {
      window.dispatchEvent(
        new CustomEvent("close-window", { detail: { win: win } })
      );
    }
    return boxoutput;
  });

  let onRemove = async ({ input, idx, array }) => {
    if (!hasCable(input._id)) {
      console.log("remove");
      smalltalk
        .confirm("Remove input?", input.name || "")
        .then(async () => {
          await boxesUtil.removeInputByInputID({
            boxID: box._id,
            inputID: input._id,
          });
          refresh((s) => s + 1);
          window.dispatchEvent(
            new CustomEvent("refresh-main-editor", { detail: {} })
          );
        })
        .catch(() => {});
    } else {
      // disconnect
      smalltalk
        .confirm("Disconnect input?", input.name || "")
        .then(async () => {
          await boxesUtil.disconnectCableByBoxInput({ inputID: input._id });
          refresh((s) => s + 1);
          window.dispatchEvent(
            new CustomEvent("refresh-main-editor", { detail: {} })
          );
        })
        .catch(() => {});
    }
  };

  let onAdd = async ({ array }) => {
    console.log("add");
    smalltalk
      .prompt("Add a new input", "Please give it a new name.", "pulse")
      .then(
        (value) => {
          array.push({
            _id: getID(),
            name: value,
          });
          boxesUtil.updateBox({ box });
          refresh((s) => s + 1);
          window.dispatchEvent(
            new CustomEvent("refresh-main-editor", { detail: {} })
          );
        },
        () => {}
      );
  };

  let onRename = async ({ input, idx, array }) => {
    smalltalk
      .prompt("rename connector?", input.name || "", input.name || "")
      .then(async (value) => {
        input.name = value;
        await boxesUtil.updateBox({ box });
        refresh((s) => s + 1);
      })
      .catch(console.log);
  };

  let hasCable = (inputSlotID) => {
    return lowdb.getState().cables.find((b) => b.inputSlotID === inputSlotID);
  };

  let getRemoveBtnInfo = ({ input, idx }) => {
    let show = true;

    let classNames =
      idx === box.inputs.length - 1
        ? "p-2 px-3 text-white select-none rounded-br-2xl "
        : "p-2 px-3 text-white select-none ";

    let title = ``;
    if (hasCable(input._id)) {
      classNames += " bg-purple-500 cursor-pointer";
      title = `Disconnect`;
    } else {
      classNames += " bg-red-500 cursor-pointer";
      title = `Remove`;
    }
    if (box.inputs.length === 1) {
      show = false;
    }
    return {
      show,
      title,
      classNames,
    };
  };

  return (
    <div className={"p-5"}>
      {box && (
        <div>
          <h1 className={"mb-3 text-xl"}>Box: {box.displayName}</h1>
          <div className={" "}>
            <table className={"rounded-2xl shadow-2xl"}>
              <thead></thead>
              <tbody>
                <tr>
                  <td
                    onClick={() => {
                      onAdd({ box, array: box.inputs });
                    }}
                    colSpan={3}
                    className={
                      " rounded-t-2xl py-2 text-center bg-blue-500 text-white cursor-pointer select-none"
                    }
                  >
                    Add Input
                  </td>
                </tr>

                {box.inputs.map((i, idx) => {
                  return (
                    <tr key={idx}>
                      <td className={"p-2 px-8  border-b border"}>{i.name}</td>
                      <td
                        onClick={() => {
                          onRename({ idx, input: i, array: box.inputs });
                        }}
                        className={
                          "p-2 px-3 border-b border bg-indigo-400 text-white cursor-pointer select-none"
                        }
                      >
                        Rename
                      </td>
                      {getRemoveBtnInfo({ idx, input: i }).show && (
                        <td
                          className={
                            getRemoveBtnInfo({ idx, input: i }).classNames
                          }
                          onClick={() =>
                            onRemove({ input: i, idx, array: box.inputs })
                          }
                        >
                          {box.inputs.length > 1 && (
                            <span className={"capitalize"}>
                              {getRemoveBtnInfo({ idx, input: i }).title}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* <pre>{JSON.stringify(box.inputs, null, 4)}</pre>
      <div>{box.displayName}</div> */}
    </div>
  );
}

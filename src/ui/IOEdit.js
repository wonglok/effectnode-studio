/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useMemo } from "react";
import { ProjectContext } from "../pages/Project";

export function IOEdit({ boxID }) {
  const { boxesUtil, lowdb } = useContext(ProjectContext);
  const box = useMemo(() => {
    return lowdb.getState().boxes.find((b) => b._id === boxID);
  });

  console.log(box);

  return (
    <div>
      {/* aaaaa */}

      <h1 className={"p-3 text-xl"}>Box: {box.displayName}</h1>

      <table className={"p-3"}>
        <thead>
          <tr>
            <th className={"p-3"}>Inputs</th>
            <th colSpan={2} className={"p-3"}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {box.inputs.map((i, idx) => {
            return (
              <tr key={idx}>
                <td className={"p-3"}>{i.name}</td>
                <td className={"p-3"}>
                  {box.inputs.length > 1 && <span>Remove</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* <pre>{JSON.stringify(box.inputs, null, 4)}</pre>
      <div>{box.displayName}</div> */}
    </div>
  );
}

//

//

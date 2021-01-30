import React, { useEffect, useState } from "react";
/* eslint-disable react-hooks/exhaustive-deps */
// import { DropZone } from '../compos/DropZone';
import { useProjectRoots } from "../AppData";

export const RecentItem = ({ doc, alt }) => {
  let removeDoc = useProjectRoots((s) => s.removeDoc);

  return (
    <div
      className={
        "px-3 flex cursor-pointer py-2 text-xs bg-gray-100 bg-gradient-to-tr text-white " +
        (alt
          ? `  from-purple-400 to-red-500 `
          : ` from-blue-400  to-green-500 `)
      }
    >
      <div className="w-full flex flex-col justify-center">
        <div className="overflow-x-scroll inline-flex items-center">
          {doc.title}
        </div>
        <div className="overflow-x-scroll inline-flex items-center">
          {doc.path}
        </div>
      </div>
      <div className="w-14 inline-flex items-center justify-center ">
        <div
          className="p-3 border border-white"
          onClick={() => {
            removeDoc({ doc });
          }}
        >
          Remove
        </div>
      </div>
    </div>
  );
};

export const OpenFolderPage = () => {
  let [docs, setDocs] = useState([]);
  let refreshID = useProjectRoots((s) => s.refreshID);
  let getDocs = useProjectRoots((s) => s.getDocs);
  let setDoc = useProjectRoots((s) => s.setDoc);
  let makeDoc = useProjectRoots((s) => s.makeDoc);

  useEffect(() => {
    getDocs().then((e) => {
      setDocs(e.slice());
    });
  }, [refreshID]);

  let dropItem = ({ files }) => {
    console.log(files);
    files
      .filter((e) => e.isDirectory)
      .filter((e) => !docs.map((d) => d.path).includes(e.path))
      .forEach((e) => {
        let ar = e.path.split("/");
        let title = ar[ar.length - 1];
        let doc = {
          ...makeDoc(),
          ...e,
          title,
        };
        setDoc({ doc });
      });
  };

  let RecentItems = () => {
    return docs
      .filter((e) => e)
      .map((e, i) => {
        return <RecentItem alt={i % 2 === 0} key={e._id} doc={e}></RecentItem>;
      });
  };

  let openFolder = async () => {
    const lstatSync = window.require("fs").lstatSync;
    const existsSync = window.require("fs").existsSync;
    const { dialog } = window.require("electron").remote;
    var promise = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      createDirectory: true,
    });

    let files = [
      {
        path: promise.filePaths[0],
        isDirectory: false,
      },
    ];
    files.forEach((file) => {
      let url = file.path + "";
      let isDirectory = existsSync(url) && lstatSync(url).isDirectory();
      file.isDirectory = isDirectory;
    });

    dropItem({ files });
  };

  return (
    <div className="full flex">
      <div className="h-full w-1/2 border-r border-gray-600">
        <div className="p-3 text-xl bg-gray-600 text-white">
          <div>
            EffectNode <span className={"text-sm"}>v1.01</span>
          </div>
        </div>
        <div
          onClick={openFolder}
          className="px-3 py-2 text-sm cursor-pointer bg-green-200 text-green-800"
        >
          <div>Open Folder</div>
        </div>
        <div className="px-3 py-2 text-sm bg-gray-200 text-gray-600">
          <div>Previous Projects</div>
        </div>
        {RecentItems()}
      </div>
      <div style={{ width: "calc(100% - 50%)" }}>
        {/* <DropZone onFiles={dropItem} className="full"></DropZone> */}
      </div>
    </div>
  );
};

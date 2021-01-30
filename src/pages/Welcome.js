/* eslint-disable no-useless-concat */
import React from "react";
// import { useEffect, useState } from "react";
import { Layout } from "../ui/Layout.js";
import { useProjectStore } from "../core/projects";
// import { createFiles } from "../core/parcel.js";
let electron = window.require("electron");

function ThankYouCard({ children, text, extraClass, onClick }) {
  // eslint-disable-next-line
  return (
    <div className={"mb-3 p-3 " + " " + (extraClass || "")} onClick={onClick}>
      <div
        className=""
        style={{
          border: "1px solid #F3C978",
          borderRadius: "10px",
          width: "300px",
          height: "400px",
          margin: "20px auto",
        }}
      >
        {children}
      </div>
      <div
        className={"text-center"}
        style={{ fontSize: "23px", whiteSpace: "pre-wrap" }}
      >
        {text}
      </div>
    </div>
  );
}

export const RecentItem = ({ doc, alt }) => {
  // let fs = window.require("fs-extra");
  let removeDoc = useProjectStore((s) => s.removeDoc);
  let openDoc = async ({ doc }) => {
    let { ok, folder } = await electron.ipcRenderer.invoke(
      "onlyCheckProjectFolder",
      doc.path
    );

    if (ok) {
      window.location.hash = String(
        `/project?url=${encodeURIComponent(folder)}`
      );
    } else {
      window.alert("Folder dont have project files");
      throw new Error(`folder dont have project files`);
    }
  };

  return (
    <div
      className={
        "px-3 m-3 flex cursor-pointer py-2 text-xs bg-gray-100 bg-gradient-to-tr text-white rounded-2xl " +
        (alt
          ? `  from-purple-400 to-red-500 `
          : ` from-blue-400  to-green-500 `)
      }
    >
      <div className="flex flex-col justify-center">
        <div className="overflow-x-scroll inline-flex items-center">
          {doc.title}
        </div>
        <div className="overflow-x-scroll inline-flex items-center">
          {doc.path}
        </div>
      </div>

      <div className="w-14 ml-3 inline-flex items-center justify-center ">
        <div
          className={`p-3 border bg-white rounded-2xl ${
            alt ? `text-red-700` : `text-purple-700`
          }`}
          onClick={() => {
            openDoc({ doc });
          }}
        >
          Open
        </div>
      </div>

      <div className="w-14 ml-3 inline-flex items-center justify-center ">
        <div
          className="p-3 border border-white rounded-2xl"
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

let RecentItems = () => {
  let docs = useProjectStore((s) => s.recentProjects);
  // let reload = useProjectStore((s) => s.reload);
  return docs
    .filter((e) => e)
    .map((e, i) => {
      return <RecentItem alt={true} key={e._id} doc={e}></RecentItem>;
    });
};

export function Welcome() {
  let recentProjects = useProjectStore((s) => s.recentProjects);
  // let reload = useProjectStore((s) => s.reload);
  let save = useProjectStore((s) => s.save);
  let makeDoc = useProjectStore((s) => s.makeDoc);

  let saveFav = async ({ folderPath }) => {
    if (recentProjects.find((e) => e.path === folderPath)) {
    } else {
      let doc = makeDoc();
      doc.path = folderPath;
      await save({ doc });
    }
  };

  // let createProject = async () => {
  //   try {
  //     let { ok, folder, cancel } = await electron.ipcRenderer.invoke(
  //       "checkEmptyFolder",
  //       {}
  //     );
  //     if (ok) {
  //       await electron.ipcRenderer.invoke("createProjectFiles", folder);
  //       await saveFav({ folderPath: folder });
  //       window.location.hash = String(
  //         `/project?url=${encodeURIComponent(folder)}`
  //       );
  //     } else {
  //       if (!cancel) {
  //         window.alert("Please Select Empty Folder.");
  //       }
  //       throw new Error(`folder isn't empty.`);
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  let openFolder = async () => {
    try {
      let { ok, folder, cancel } = await electron.ipcRenderer.invoke(
        "selectCheckProjectFolder"
      );
      if (ok) {
        await saveFav({ folderPath: folder });
        window.location.hash = String(
          `/project?url=${encodeURIComponent(folder)}`
        );
      } else {
        if (!cancel) {
          window.alert("Folder dont have project files");
        }
        throw new Error(`folder dont have project files`);
      }
    } catch (e) {
      console.log(e);
    }
  };
  let openNewWindow = async () => {
    try {
      await electron.ipcRenderer.invoke("openWindow", {});
    } catch (e) {
      console.log(e);
    }
  };
  let openDownloader = () => {
    const { shell } = window.require("electron");
    shell.openExternal("https://effectnode.com");
  };
  return (
    <Layout title={"Creative Coding with Boxes and Cables"}>
      <div
        className="block lg:hidden text-center mt-4"
        style={{ fontSize: "24px", color: "#F3C978" }}
      >
        Creative Coding with Boxes and Cables
      </div>

      {
        <div className={"flex justify-center flex-wrap lg:p-4"}>
          <ThankYouCard
            onClick={openDownloader}
            text={"Download New Project Template"}
            extraClass={"cursor-pointer  select-none"}
          >
            <div className={"h-full w-full flex justify-center items-center"}>
              <img src={require("../images/download.svg")} alt="add" />
            </div>
          </ThankYouCard>

          <ThankYouCard
            onClick={openFolder}
            text={"Browse and Open Project"}
            extraClass={"cursor-pointer  select-none"}
          >
            <div className={"h-full w-full flex justify-center items-center"}>
              <img
                src={require("../images/folder.svg")}
                className={"scale-150 transform"}
                alt="Open"
              />
            </div>
          </ThankYouCard>

          {/* <ThankYouCard text={'Drop Project Folder'} className={'select-none'}>
        <div className={'h-full w-full flex justify-center items-center'}>
          <DropZone onFiles={({ files }) => { dropItem({ files }) }}>
          </DropZone>
        </div>
      </ThankYouCard> */}

          <ThankYouCard
            onClick={openNewWindow}
            text={"Open New Window"}
            extraClass={"cursor-pointer select-none"}
          >
            <div className={"h-full w-full flex justify-center items-center"}>
              <img
                src={require("../images/clone.svg")}
                className={"scale-150 transform"}
                alt="Open"
              />
            </div>
          </ThankYouCard>
        </div>
      }

      <div className={"flex justify-center items-center flex-wrap"}>
        <RecentItems></RecentItems>
      </div>

      <div className={"h-36"}></div>
    </Layout>
  );
}

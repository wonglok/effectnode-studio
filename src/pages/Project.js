import React from "react";
import { Layout } from "../ui/Layout.js";
import { useLocation } from "react-router-dom";
import { makeUseWinBoxStore } from "../core/winbox.js";
import { WindowBox } from "../ui/WindowBox.js";
import slugify from "slugify";
// let electron = window.require('electron');
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const ProjectContext = React.createContext({});

export function slugger(str) {
  return slugify(str, {
    replacement: "_", // replace spaces with replacement character, defaults to `-`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
  });
}

export function Project() {
  const query = useQuery();
  const root = decodeURIComponent(query.get("url"));
  const slug = slugger(root);
  const useWinBox = makeUseWinBoxStore(slug);
  return (
    <Layout title={"Project Editor"}>
      <div style={{ height: "calc(100% - 60px)" }} className="">
        <ProjectContext.Provider value={{ root, slug, useWinBox }}>
          <div className={"h-full w-full relative"}>
            <WindowBox></WindowBox>
          </div>
        </ProjectContext.Provider>
      </div>
    </Layout>
  );
}

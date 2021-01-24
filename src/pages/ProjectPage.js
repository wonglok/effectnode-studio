import React, { useEffect, useRef, useState } from 'react'
import { Layout } from "../pages-content/happy-again/NavBar"
import { useLocation } from 'react-router-dom'
import { WindowSet, TaskBarSet } from './useWins/WindowSet.js'
import { useWinsNamed } from './useWins/useWins';
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const ProjectContext = React.createContext({})

export function ProjectPage () {
  const query = useQuery()
  const useWins = useWinsNamed(query.get('url'))

  return <Layout title={'Project Editor'}>
    <div style={{ height: 'calc(100% - 60px)' }} className="">
      <ProjectContext.Provider value={{ url: query.get('url'), useWins }}>
        <div className={'h-full w-full relative'}>
          <WindowSet projectID={query.get('url')}></WindowSet>
          <TaskBarSet projectID={query.get('url')}></TaskBarSet>
        </div>
      </ProjectContext.Provider>
    </div>
  </Layout>
}

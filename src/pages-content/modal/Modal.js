import React from 'react'
import { useEffect, useState } from "react";

export function Modal ({ showButton = true, showFooter = true, onReady = () => {}, color = 'green', onCancel = () => {}, onOK = () => {}, btn = 'Open Modal', title = 'modal title', children }) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let onKeyDown = (evt) => {
      if (evt.keyCode) {
        if (evt.keyCode === 27) {
          setShowModal(false)
        }
      } else if (evt.key) {
        if (evt.key.toLowerCase() === 'escape') {
          setShowModal(false)
        }
      }
    }

    onReady({
      toggle: setShowModal
    })

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  })

  return (
    <>
      {showButton && <button
        className={`bg-${color}-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1`}
        type="button"
        style={{ transition: "all .15s ease", color: '#121212' }}
        onClick={() => setShowModal(true)}
      >
        {btn}
      </button>}
      {showModal ? (
        <>
          <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
            //
          >
            <div className="relative w-auto my-6 mx-auto">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
                  <div className="text-3xl font-semibold">
                    {title}
                  </div>
                  <button
                    className="p-1 ml-24 bg-transparent border-0 text-red-500 opacity-100 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => { onCancel(); setShowModal(false); }}
                  >
                    <span className="bg-transparent text-red-500 opacity-100 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}

                <div className="relative p-6 flex-auto">
                  <div className="my-4 text-gray-600 text-lg leading-relaxed">
                    {children}
                  </div>
                </div>

                {/* footer */}

                {showFooter && <div className="flex items-center justify-end p-6 border-t border-solid border-gray-300 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    style={{ transition: "all .15s ease" }}
                    onClick={() => { onCancel(); setShowModal(false); }}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-green-500 text-white active:bg-green-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    style={{ transition: "all .15s ease" }}
                    onClick={async () => { await onOK(); setShowModal(false);  }}
                  >
                    OK
                  </button>
                </div>}
              </div>
            </div>
          </div>
          <div onClick={() => { onCancel(); setShowModal(false); }} className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}
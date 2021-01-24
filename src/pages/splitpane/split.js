import SplitPane from 'react-split-pane'
import _ from 'lodash'

export function Split () {
  let [winSize, setWinSize] = useState(window.innerWidth)
  useEffect(() => {
    let resize = () => {
      setWinSize(window.innerWidth)
    }
    window.addEventListener('resize', resize)
    return () => {
      window.addEventListener('resize', resize)
    }
  })

  return (
    <div>
    <style jsx={'true'}>{/* css */`
      .Resizer {
        background: #ffffff;
        opacity: 0.2;
        z-index: 1;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        -moz-background-clip: padding;
        -webkit-background-clip: padding;
        background-clip: padding-box;
      }

      .Resizer:hover {
        -webkit-transition: all 2s ease;
        transition: all 2s ease;
      }

      .Resizer.horizontal {
        height: 11px;
        margin: -5px 0;
        border-top: 5px solid rgba(255, 255, 255, 0.5);
        border-bottom: 5px solid rgba(255, 255, 255, 0.5);
        cursor: row-resize;
        width: 100%;
      }

      .Resizer.horizontal:hover {
        border-top: 5px solid rgba(0, 0, 0, 1.0);
        border-bottom: 5px solid rgba(0, 0, 0, 1.0);
      }

      .Resizer.vertical {
        width: 11px;
        margin: 0 -5px;
        border-left: 5px solid rgba(255, 255, 255, 0.5);
        border-right: 5px solid rgba(255, 255, 255, 0.5);
        cursor: col-resize;
      }

      .Resizer.vertical:hover {
        border-left: 5px solid rgba(0, 0, 0, 1.0);
        border-right: 5px solid rgba(0, 0, 0, 1.0);
      }

      .Resizer.disabled {
        cursor: not-allowed;
      }

      .Resizer.disabled:hover {
        border-color: transparent;
      }
    `}</style>
    <SplitPane
      split="vertical"
      minSize={winSize / 3.5}
      maxSize={winSize * 0.95}
      defaultSize={parseInt(localStorage.getItem('left-right') || (winSize), 10)}
      onChange={_.debounce((size) => {
        localStorage.setItem('left-right', size)
      }, 400)}
    >
      <div>

      </div>
      <div>

      </div>
    </SplitPane>
    </div>
  )
}

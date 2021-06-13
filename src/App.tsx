import React, { useState, useCallback, useRef } from 'react'
import classNames from 'classnames'
import produce from 'immer'
import './App.css'

const ROWS = 50,
  COLS = 50

function App() {
  const [running, setRunning] = useState(false)
  const runningRef = useRef(running)
  const [grid, setGrid] = useState(() => {
    const rows = new Array(ROWS)
    for (let i = 0; i < ROWS; i++) {
      rows[i] = new Array(COLS).fill(0)
    }
    return rows
  })

  runningRef.current = running
  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return
    }

    setGrid((grid) => {
      return produce(grid, (newGrid) => {
        for (let i = 0; i < ROWS; i++) {
          for (let j = 0; j < COLS; j++) {
            let livingNeigbors = 0

            // count number of living neighbors
            for (let xoff = -1; xoff <= 1; xoff++) {
              for (let yoff = -1; yoff <= 1; yoff++) {
                const n = i + xoff
                const k = j + yoff

                // do not count the cell itself :)
                if (n === i && k === j) {
                  continue
                }

                if (n > -1 && n < ROWS && k > -1 && k < COLS) {
                  livingNeigbors += grid[n][k]
                }
              }
            }

            // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
            // Any live cell with two or three live neighbours lives on to the next generation.
            // Any live cell with more than three live neighbours dies, as if by overpopulation.
            // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
            if (livingNeigbors < 2 || livingNeigbors > 3) {
              newGrid[i][j] = 0
            } else if (grid[i][j] === 0 && livingNeigbors === 3) {
              newGrid[i][j] = 1
            }
          }
        }
      })
    })

    setTimeout(runSimulation, 300)
  }, [])

  function handleBoxClick(i: number, j: number) {
    const newGrid = produce(grid, (gridCopy) => {
      gridCopy[i][j] = gridCopy[i][j] === 0 ? 1 : 0
    })
    setGrid(newGrid)
  }

  function handleStartClick() {
    setRunning(!running)
    if (!running) {
      runningRef.current = true
      runSimulation()
    }
  }

  function handleRandomClick() {
    setGrid((grid) => {
      return produce(grid, (newGrid) => {
        for (let i = 0; i < ROWS; i++) {
          for (let j = 0; j < COLS; j++) {
            newGrid[i][j] = Math.random() > 0.2 ? 0 : 1
          }
        }
      })
    })
  }

  function handleClearClick() {
    setGrid((grid) => {
      return produce(grid, (newGrid) => {
        for (let i = 0; i < ROWS; i++) {
          for (let j = 0; j < COLS; j++) {
            newGrid[i][j] = 0
          }
        }
      })
    })
  }

  return (
    <React.Fragment>
      <div className="toolbar">
        <button onClick={handleStartClick}>{running ? 'Stop' : 'Start'}</button>
        <button onClick={handleRandomClick}>Random</button>
        <button onClick={handleClearClick}>Clear</button>
      </div>
      <div className="grid-container">
        {grid.map((row: number[], i: number) =>
          row.map((_: number, j: number) => (
            <div
              onClick={() => handleBoxClick(i, j)}
              key={`${i}-${j}`}
              className={classNames('box', { 'box--dead': grid[i][j] === 0 })}
            />
          ))
        )}
      </div>
    </React.Fragment>
  )
}

export default App

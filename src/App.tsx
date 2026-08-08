import { useState } from 'react'
import { DotDisplayOption, MusicKey, FingeringType, LockMode } from './types/music';

import './App.css'; // Clear out the defulat Vite CSS stuff in this.

// Component Imports
//import Fretboard from './Fretboard';
//import CircleOfFifths from './util/CircleOfFifths';
//import DraggableBox from './util/DraggableBox';
import Fretboard from './components/Fretboard';
import CircleOfFifths from './components/CircleOfFifths';
import DraggableBox from './components/DraggableBox';
import ControlPanel from './components/ControlPanel';

function App() {
  // <MusicKey> forces this state to ONLY accept valid keys.
  // Accidentally typing setCurrentKey(5) will be blocked by TypeScript.
  const [currentKey, setCurrentKey] = useState<MusicKey>('C');

  const [fingeringType, setFingeringType] = useState<FingeringType>('type1');
  const [lockMode, setLockMode] = useState<LockMode>('none');

  // Standard primitives like 'number' or 'boolean' are already built into TypeScript
  const [position, setPosition] = useState<number>(0);


  // Control Panel Props
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dotDisplay, setDotDisplay] = useState<DotDisplayOption>('fingers');
  const [dotShowAll, setDotShowAll] = useState(false);
  const [showStretches, setShowStretches] = useState(true);
  const [fretInlayState, setFretInlayState] = useState(true);


  return (
    <>
      <div className='App'>
        <ControlPanel
          isSidebarOpen={isSidebarOpen}

          //isKeyLocked={isKeyLocked}
          //setIsKeyLocked={setIsKeyLocked}

          currentKeyName={currentKey}

          dotDisplay={dotDisplay}
          setDotDisplay={setDotDisplay}

          dotShowAll={dotShowAll}
          setDotShowAll={setDotShowAll}

          showStretches={showStretches}
          setShowStretches={setShowStretches}

          lockMode={lockMode}
          setLockMode={setLockMode}

          // fretInlayState = {fretInlayState}
          // setFretInlayState = {setFretInlayState}

          fingeringType={fingeringType}
          //setFingeringType={setFingeringType}
          handleTypeChange={handleTypeChange}

          //newKey={newKey} <-- I think this can be replaced with currentKeyName instead. 
          handleKeyChange={handleKeyChange}

          position={position}
          handlePositionChange={handlePositionChange}

          showPositionBox={showPositionBox}
          setShowPositionBox={setShowPositionBox}
        />

        <Fretboard
          currentKey={currentKey}
          setCurrentKey={setCurrentKey}
          fingeringType={fingeringType}
          setFingeringType={setFingeringType}
          lockMode={lockMode}
          setLockMode={setLockMode}
          position={position}
          setPosition={setPosition}
        />

        <DraggableBox title="Circle of Fifths View" defaultX={400} defaultY={20}>
          <CircleOfFifths
            currentKeyName={currentKey}
            onKeyChange={setCurrentKey}
          />
        </DraggableBox>
      </div>
    </>
  );
}

export default App

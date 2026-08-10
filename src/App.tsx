import { useState, useMemo } from 'react'
import { generateFretboard } from './util/Fretboard';
import { rootDefinitions } from './util/berkleeDictionary';
import { DotDisplayOption, MusicKey, FingeringType, LockMode } from './types/music';
import { Note } from '@tonaljs/tonal';

import './App.css'; // Clear out the defulat Vite CSS stuff in this.

// Component Imports
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
  const [showPositionBox, setShowPositionBox] = useState(true);

  const fretboardData = useMemo(() => generateFretboard(['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], 24), []);


  // --- POSITION CHANGING / KEY LOCKING ALGORITHM --- //
  // --- REVERSE LOOKUP --- //
  // --- This function will fire everytime the user moves the slider. --- //
  /**
   * 
   * @param newPosition 
   * @returns 
   */
  const handlePositionChange = (newPosition: number) => {
    if (lockMode === 'position') return;

    if (lockMode === 'none') {
      setPosition(newPosition);
      return;
    }

    // --- KEY LOCKING ALGORITHM --- //
    // We need to know what key we are currently trying to lock.
    // Loop through the types in rootDefinitions, using Object.entries()
    //      For each type, calculate its absolute fret (newPosition + offset).    
    //      Compare pitchClass property. If current fret's note name is our target,
    //          Update the state with the string key (type 1, type2, etc) and exit function.
    //          Else, loop will finish without finding a match, never updating the state. This means the position box will ignore the slider.
    const targetKey = currentKey;

    for (const [typeKey, typeData] of Object.entries(rootDefinitions)) {
      const absoluteFret = newPosition + typeData.offset;
      if (absoluteFret >= 0 && absoluteFret < fretboardData[0].length) { // Safety Check: Ensures the fret exists on our fretboard before checking it
        const fretNode = fretboardData[typeData.string][absoluteFret];
        if (fretNode.pitchClass === targetKey) {
          setFingeringType(typeKey as FingeringType);
          setPosition(newPosition);
          return;
        }
      }
    }
  };

  const handleTypeChange = (newType: FingeringType) => {
    // Check that position is locked. If so, then position box must be moved to maintain the key.
    if (lockMode === 'key') {
      const targetKey = currentKey;
      const newRootDef = rootDefinitions[newType];

      // Search fretboard on the new type's root string to find the target note
      const stringNotes = fretboardData[newRootDef.string];
      const targetNote = stringNotes.find(fret => fret.pitchClass === targetKey);

      if (targetNote) {
        // Calculate position the box needs to be in
        let newPosition = targetNote.fret - newRootDef.offset;

        // Clamp so box doesn't go flying if a wierd stretch is chosen
        if (newPosition < 1) newPosition += 12;
        if (newPosition > 24) newPosition -= 12;

        setPosition(newPosition);
        setFingeringType(newType);
      }
      return;
    }
    // If lockMode is 'position' or 'none'm just change the type.
    // Position box will stay where it is and currentKeyName useMemo() will auto-update the key.
    setFingeringType(newType);
  }

  const handleKeyChange = (newTargetKey: MusicKey) => {
    // Get numeric pitch value of the incoming key
    const targetChroma = Note.get(newTargetKey).chroma

    // Position Locked 
    // If position is locked, we must change the fingering type to match the new key
    if (lockMode === 'position') {
      for (const [typeKey, typeData] of Object.entries(rootDefinitions)) {
        const absoluteFret = position + typeData.offset;
        if (absoluteFret >= 0 && absoluteFret < fretboardData[0].length) {
          const fretNode = fretboardData[typeData.string][absoluteFret];
          // If this shape at our locked position produces the new key, select it.
          const fretChroma = Note.get(fretNode.pitchClass).chroma;
          //if (fretNode.pitchClass === newKey) {
          if (fretChroma === targetChroma) {
            setFingeringType(typeKey as FingeringType);
            // Could also add a state here to show a warning if NO shape fits the key at this position.

            setCurrentKey(newTargetKey);
            return;
          }
        }
      }
      return;
    }

    // Key Locked
    if (lockMode === 'key') return;

    // Free Mode: lockMode === 'none'
    // Changing key in free mode usually means fingering type stays the same while the position is changed.
    const rootDef = rootDefinitions[fingeringType];
    const stringNotes = fretboardData[rootDef.string];

    const targetNode = stringNotes.find(fret =>
      Note.get(fret.pitchClass).chroma === targetChroma
    );

    // Find where the new root note lives on the current string
    //const targetNote = stringNotes.find(fret => fret.pitchClass === newKey);

    if (targetNode) {
      let calculatedPosition = targetNode.fret - rootDef.offset;

      // Clamp so box doesn't go flying if a wierd stretch is chosen
      if (calculatedPosition < 1) calculatedPosition += 12;
      if (calculatedPosition > 24) calculatedPosition -= 12;

      setPosition(calculatedPosition);
      setCurrentKey(newTargetKey);
    }

  }

  return (
    <>
      <div className='App'>
        <ControlPanel
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
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
          dotShowAll={dotShowAll}
          dotDisplay={dotDisplay}
          showStretches={showStretches}
          handlePositionChange={handlePositionChange}
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

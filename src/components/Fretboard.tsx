// Fretboard.jsx - Component files get CapitalLettersInTheirNames
// This is for UI / Display.
// fretboard.js is the fretboard object itself.
// berkleeDictionary.js is where we will keep track of position types and their root note definitions.

/**
 * |--------------------------------------------------|
 * | *** *** *** *** *** TODO *** *** *** *** *** *** |
 * |--------------------------------------------------|
 * - Fretboard:
 * -    * ---- DONE ---- Extend fretboard
 * -    * ---- DONE ---- Add option for what is shown in the fingering dot. Either finger number, or note name, or nothing.
 * -    * ---- DONE ---- Add toggle for showing all notes
 * -    * Toggle fret numbers, give option above or below fretboard
 * -    * Add toggle for highlighting all roots, instead of just the lowest string's root.
 * -    * Allow fret inlay / numbering options; on the fret itself, or outside on either the top or bottom of the neck. 
 * -    
 * - Note Filtering:
 * -    * Triads, Scales, Modes, Chords, etc
 * 
 * - Position Box:
 * -    * ---- DONE ---- Toggle show/hide actual box around position
 * -    * ---- DONE ---- Extend position slider
 * -    * ---- DONE ---- Toggle show all dots on fretboard
 * -    * Toggle show position and/or type on top of neck.
 * -    * Toggle out-of-active-position boxes at other postions in the current key. Top of neck should show type. 
 * -    * Toggle showing stretches in dots. Example, on index stretch, if this is enabled, show s1. Else, show 1.
 * -    * Toggle left hand finger numbers or letters. Either:
 * -    *   1, 2, 3, 4 (with or without 1s, 4s)
 * -    *       or
 * -    *   i, m, r, p (with or without is, ps)
 * -    * 
 * -    * Toggle drag position box up/down to change types. It'll either be [up = fifth up, down = fourth down), or the other way around.
 * -    * Toggle lock position
 * -    * 
 * -    * Mutual exclusion of toggle key lock and toggle position lock
 * - 
 * - 
 * - Control Panel Options
 * -    * ---- DONE ---- Create side menu or something to keep buttons and options and stuff
 * 
 * 
 * - Code Stuff:
 * -    * Pull things out into more files for better organization/readability.
 * -    * Update all uses of Tonals.Js's Note and Scale to something that isn't deprecated.
 * - 
 * - 
 * --------------------------------------------------
 * NICE TO HAVEs / MISC. FEATURES
 * - iRealPro Functionality
 * -    * Should be able to read iRealPro charts and move the position box dynamically as best as it can
 * -    * Position Lock feature would be nice
 * -    * Position Box movement preference would be nice. Let user set "Ascending/Descending" and position box changes every bar
 * -
 * - Circle of Fifth
 * -    * Add a Circle of Fifths/Fourths (though this may be better as it's own project. Basically Tessitura.)
 * -    * Let users drag a handle around Circle of Fifths. Circle updates would trigger either position updates, key updates, type updates, etc
 * -
 * - Staff and Notation
 * -    * Let users toggle a staff
 * -    * Let users import sheet music
 * -    * Let users import/export midi
 * 
 * 
 * --------------------------------------------------
 **/



import React, { useMemo, useState, useRef } from 'react';
import { generateFretboard } from '../util/Fretboard';
import { Scale, Note } from '@tonaljs/tonal';
import './Fretboard.css';
//import ControlPanel from './ControlPanel';
import { berkleeDictionary, rootDefinitions } from '../util/berkleeDictionary';

// Defining props interface
import { FretNode, MusicKey, FingeringType, LockMode} from '../types/music';
import { CHROMA_TO_KEY } from '../types/music';

// Define the exact shape of the props comings from Apps.tsx
interface FretboardProps {
    currentKey: MusicKey;
    setCurrentKey: (key: MusicKey) => void;
    fingeringType: FingeringType;
    setFingeringType: (type: FingeringType) => void;
    lockMode: LockMode;
    setLockMode: (mode: LockMode) => void;
    position: number;
    setPosition: (pos: number) => void;
}

/** Defines which frets should have a single fret dot.
 *  The "as const" can be uncommented should you want to make these immutable.
 * 
 *  These inlay arrays should go into fretboard.ts later, once the UI options for the user are developed.
 */
const singleInlays = [1, 3, 5, 9, 13, 17]; // as const

/** Defines which frets should have a double fret dot.
 *  The "as const" can be uncommented should you want to make these immutable.
 * 
 *  These inlay arrays should go into fretboard.ts later, once the UI options for the user are developed.
 */
const doubleInlays = [7, 12, 15]; // as const


/** */
type ActiveNote = {
    finger: number;
    isRoot: boolean;
    isStretch: boolean;
}

// The mathematical order of the circle (Clockwise)
const circleKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

/**
 * The main interactive Fretboard UI.
 * Handles rendering of strings, frets, inlay markers, active scale shapes / position.
 * @returns 
 */
export default function Fretboard({
    currentKey,
    setCurrentKey,
    fingeringType,
    setFingeringType,
    lockMode,
    setLockMode,
    position,
    setPosition
 }: FretboardProps) {
    // Generate the fretboard data once. 
    // If we add alternate tunings later, we will add the tuning state to the dependency array [].
    const fretboardData = useMemo<FretNode[][]>(() => generateFretboard(), []);

    // --- STATES: Defaults --- //
    //const [position, setPosition] = useState(2); // Default to 2nd Position
    //const [fingeringType, setFingeringType] = useState<FingeringType>('type1');

    //const [lockMode, setLockMode] = useState<LockMode>('none');
    // TO BE DELETED, REPLACED BY THE ABOVE.
    // const [isKeyLocked, setIsKeyLocked] = useState(false);


    // --- STATES: Position Box --- //
    const [showPositionBox, setShowPositionBox] = useState(true);
    const [isDragging, setisDragging] = useState(false);
    const dragStartX = useRef(0);
    const dragStartPos = useRef(0);

    // --- LOGIC: MAP DICTIONARY TO FRETBOARD --- // 
    const activeShape = berkleeDictionary.major[fingeringType];

    // --- FORWARD LOOKUP --- 
    //    Look at root definition of the type, then use that to check the fretboard at that string to get fret. 
    // 1. Create fast lookup table for stencil.
    /**
     * 
     */
    const activeNotesLookup = useMemo(() => {
        const lookup: Record<string, ActiveNote> = {};
        const rootDef = rootDefinitions[fingeringType];

        activeShape.forEach(stringData => {
            stringData.notes.forEach(note => {
                // Calculate absolute fret on the guitar neck
                const absoluteFret = position + note.offset;

                // Check if this specific note is the root of the shape
                const isRoot = stringData.string === rootDef.string && note.offset === rootDef.offset;

                // If note falls outside of [0 - 3], then it requires a stretch of either the index or pinky.
                const isStretch = note.offset < 0 || note.offset > 3;

                // Create a new key in the lookup dictionary 
                lookup[`${stringData.string}-${absoluteFret}`] = {
                    finger: note.finger,
                    isRoot: isRoot,
                    isStretch: isStretch
                };
            });
        });
        return lookup;
    }, [activeShape, position, fingeringType]);

    /**
     * Calculate the current key in position to display to the user.
     */
    const currentKeyName = useMemo(() => {
        const rootDef = rootDefinitions[fingeringType];
        const rootStringData = fretboardData[rootDef.string];

        if (!rootStringData) return "C";

        const rootNoteData = rootStringData.find(f => f.fret === position + rootDef.offset);
        
        if(!rootNoteData || rootNoteData.chroma === undefined) return 'C';

        // 100% safe at runtime. If Tonal gives us D# (chroma 3), this safely returns Eb (MusicKey)
        return CHROMA_TO_KEY[rootNoteData.chroma];

        //return rootNoteData ? rootNoteData.pitchClass : "";

    
    }, [fretboardData, position, fingeringType]);

    /**
     * Replacing this with currentScaleChrome() because currentScaleNotes breaks with enharmonics.
     */
    const currentScaleNotes = useMemo(() => {
        if (!currentKeyName) return [];

        // Tonal's Scale.get("C major").notes returns ["C", "D", "E", "F", "G", "A", "B"]
        return Scale.get(`${currentKeyName} major`).notes;
    }, [currentKeyName]);

    /**
     * Get all notes in current position's key.
     */
    const currentScaleChroma = useMemo(() => {
        if (!currentKeyName) return [];

        // Get notes in current key.
        const scaleNotes = Scale.get(`${currentKeyName} major`).notes;

        // Convert them to their numeric chroma values. Tonals.js uses "chroma" (ints) for pitches. 0 = [C, B#], 1 = [C#, Db], etc...
        return scaleNotes.map(noteName => Note.get(noteName).chroma);
    }, [currentKeyName]);

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
        const targetKey = currentKeyName;

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
            const targetKey = currentKeyName;
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


    // --- POSITION BOX DRAGGING --- //
    /**
     * 
     * @param e 
     */
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        // Only start dragging if user clicked inside active box.
        if ((e.target as HTMLElement).closest('.active-box')) {
            setisDragging(true); // This triggers a render so our CSS cursor can change
            dragStartX.current = e.clientX;
            dragStartPos.current = position;
            e.currentTarget.setPointerCapture(e.pointerId); // This tells the browser to keep sending mouse events even if they drag outside of the box after the initial pointer down.
            //(e.target as HTMLElement).setPointerCapture(e.pointerId); <--| This would also work, but using currentTarget is the "React" way.
        }
    };

    /**
     * 
     * @param e 
     */
    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isDragging) {
            setisDragging(false);
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

    /**
     * 
     * @param e 
     * @returns 
     */
    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;

        // Get width of one fret
        const fretboardWidth = e.currentTarget.offsetWidth;
        const fretWidth = fretboardWidth / 24; // Hardcoding fret count for now, but change this to pull from the fretboard object later

        const pixelsMoved = e.clientX - dragStartX.current;

        // Divide pixelsMoved by fretWidth, round it, and add it to dragStartPos.current!
        let newPosition = dragStartPos.current + Math.round(pixelsMoved / fretWidth);

        // Clamp boundaries so user can't drag box off of the fretboard
        if (newPosition < 1) newPosition = 1;
        if (newPosition > 24) newPosition = 24;

        // Then call handlePositionChange(newPosition)...
        handlePositionChange(newPosition);
    }

    // --- RENDER THE FRETBOARD --- //
    return (
        //<div className="fretboard-wrapper">
        <div style={{
            flex: 1, /* Take up all remaining space next to the sidebar */
            height: '100%',
            display: 'flex',
            alignItems: 'center', /* Vertically center the fretboard */
            justifyContent: 'flex-start', /* Align left so it scrolls properly */
            overflowX: 'auto', /* Add horizontal scrollbar if needed */
            padding: '40px', /* Give it some breathing room */
        }}>  
            {/* --- UI CONTROLS --- */}
            <div className="dashboard-layout">


                {/* --- FRETBOARD UI --- */}
                <div
                    // className="fretboard-container"
                    className={`fretboard-container ${isDragging ? 'is-dragging' : ''}`}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}

                    /* Kills native browser dragging and ghost images */
                    onDragStart={(e) => e.preventDefault()}
                >
                    {/* --- Map over all strings. For each string, render all frets. --- */}
                    {fretboardData.slice().reverse().map((stringNotes) => (
                        <div key={`string-${stringNotes[0].stringIndex}`} className="string-row">
                            {/* --- Map over all frets on this string --- */}
                            {stringNotes.map((fretData) => {
                                // --- Fret Inlay Check --- //
                                // --- Single: Only add inlay when on D string. Nudge inlay dot later --- //
                                const isSingleInlay = singleInlays.includes(fretData.fret) && fretData.stringIndex === 2;

                                // --- Double: Only add inlay when on either A or B string. Nudge inlay dot later --- //
                                const isDoubleInlay = doubleInlays.includes(fretData.fret) && (fretData.stringIndex === 1 || fretData.stringIndex === 4);

                                // Check lookup table to see if this fret should have a dot
                                const activeNote = activeNotesLookup[`${fretData.stringIndex}-${fretData.fret}`];

                                // Check if current note's numeric pitch value (chroma) belongs to scale/key
                                const fretChroma = Note.get(fretData.pitchClass).chroma;
                                const isScaleNote = currentScaleChroma.includes(fretChroma);

                                // Determine if current note is ghost note or not
                                const isGhostNote = dotShowAll && isScaleNote && !activeNote;

                                // "Home Base" for any Berklee position is exactly 4 frets wide (offset 0 to 3)
                                const notInPositionBox = fretData.fret < position || fretData.fret > position + 3;

                                // Checking for position box
                                const isInPositionBox = !notInPositionBox;

                                return (
                                    <div
                                        key={fretData.note}
                                        className={`fret
                                            ${fretData.fret === 0 ? 'nut' : fretData.fret === 11 ? 'octave' : ''}
                                            ${notInPositionBox && fretData.fret !== 0 ? 'out-of-position' : ''}
                                            ${showPositionBox && isInPositionBox && fretData.fret !== 0 ? 'active-box' : ''}
                                            `}
                                    >
                                        {/* Render inlay dots */}
                                        {(isSingleInlay || isDoubleInlay) && (
                                            //<div className='inlay-dot'></div>
                                            <div className={`inlay-dot ${isSingleInlay ? 'single' : 'double'}`}></div>
                                        )}

                                        {/* Render fret inlays */}
                                        {

                                        }

                                        {/* Render active position fret dots */}
                                        {activeNote && (
                                            <div className={`note-dot ${activeNote.isRoot ? 'root' : ''}`}>
                                                {/* Show Stretches to user? */}
                                                {dotDisplay === 'fingers' && (
                                                    showStretches && activeNote.isStretch
                                                        ? `s${activeNote.finger}`
                                                        : activeNote.finger
                                                )}

                                                {/* dotDisplay === 'fingers' && activeNote.finger */}
                                                {dotDisplay === 'notes' && fretData.pitchClass}
                                                {/* Finish this later: dotDisplay === 'dotDisplayRoman' &&  */}
                                                {/* And if dotDisplay is none, it renders nothing inside the dot div! */}
                                            </div>
                                        )}

                                        {/* Render out of position fret dots, if user wants */}
                                        {
                                            isGhostNote && (
                                                <div className="note-dot ghost-dot">
                                                    {/* Ghost dots don't have fingerings, so we only show text if they want Note Names */}
                                                    {dotDisplay === 'notes' && fretData.pitchClass}
                                                </div>
                                            )}


                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

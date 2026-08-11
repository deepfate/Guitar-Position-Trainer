// src/store/useMusicStore.ts
import { create } from 'zustand';
import { Note } from '@tonaljs/tonal';
import { MusicKey, FingeringType, LockMode, DotDisplayOption, FretNode, CHROMA_TO_KEY } from '../types/music';
import { generateFretboard } from '../util/Fretboard';
import { rootDefinitions } from '../util/berkleeDictionary';
// Generate the fretboard once for the store to use for calculations
const initialFretboard = generateFretboard(['E2', 'A2', 'D3', 'G3', 'B3', 'E4'], 24);

interface MusicState {
    // --- STATE VARIABLES ---
    currentKey: MusicKey;
    fingeringType: FingeringType;
    lockMode: LockMode;
    position: number;
    fretboardData: FretNode[][];

    // --- UI TOGGLES ---
    isSidebarOpen: boolean;
    showPositionBox: boolean;
    dotDisplay: DotDisplayOption;
    dotShowAll: boolean;
    showStretches: boolean;

    // --- SIMPLE SETTERS ---
    setPosition: (pos: number) => void;
    setLockMode: (mode: LockMode) => void;
    setIsSidebarOpen: (isOpen: boolean) => void;
    setShowPositionBox: (show: boolean) => void;
    setDotDisplay: (display: DotDisplayOption) => void;
    setDotShowAll: (show: boolean) => void;
    setShowStretches: (show: boolean) => void;

    // --- THE IRON TRIANGLE ENGINE ---
    handleTypeChange: (newType: FingeringType) => void;
    handleKeyChange: (newTargetKey: MusicKey) => void;
    handlePositionChange: (newPos: number) => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
    // Initial Values
    currentKey: 'C',
    fingeringType: 'type1',
    lockMode: 'none',
    position: 2,
    fretboardData: initialFretboard,

    isSidebarOpen: true,
    showPositionBox: true,
    dotDisplay: 'fingers',
    dotShowAll: false,
    showStretches: true,

    // Simple Setters
    setPosition: (pos) => set({ position: pos }),
    setLockMode: (mode) => set({ lockMode: mode }),
    setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    setShowPositionBox: (show) => set({ showPositionBox: show }),
    setDotDisplay: (display) => set({ dotDisplay: display }),
    setDotShowAll: (show) => set({ dotShowAll: show }),
    setShowStretches: (show) => set({ showStretches: show }),

    // Engine Math
    handleTypeChange: (newType) => {
        const state = get();
        if (state.lockMode === 'key') {
            const targetKey = state.currentKey;
            const newRootDef = rootDefinitions[newType];
            const stringNotes = state.fretboardData[newRootDef.string];
            const targetNote = stringNotes.find(fret => fret.pitchClass === targetKey);

            if (targetNote) {
                let newPosition = targetNote.fret - newRootDef.offset;
                if (newPosition < 1) newPosition += 12;
                if (newPosition > 24) newPosition -= 12;
                set({ position: newPosition, fingeringType: newType });
            }
            return;
        }
        // If lockMode is 'position' or 'none', recalculate the key
        const rootDef = rootDefinitions[newType];
        const rootStringData = state.fretboardData[rootDef.string];
        const rootNoteData = rootStringData.find(f => f.fret === state.position + rootDef.offset);

        if (rootNoteData && rootNoteData.chroma !== undefined) {
            set({ fingeringType: newType, currentKey: CHROMA_TO_KEY[rootNoteData.chroma] });
        } else {
            set({ fingeringType: newType });
        }
    },

    handleKeyChange: (newTargetKey) => {
        const state = get();
        const targetChroma = Note.get(newTargetKey).chroma;

        // lockmode: 'position' - Change shape to match new key
        if (state.lockMode === 'position') {
            for (const [typeKey, typeData] of Object.entries(rootDefinitions)) {
                const absoluteFret = state.position + typeData.offset;
                if (absoluteFret >= 0 && absoluteFret < state.fretboardData[0].length) {
                    const fretNode = state.fretboardData[typeData.string][absoluteFret];
                    const fretChroma = Note.get(fretNode.pitchClass).chroma;
                    if (fretChroma === targetChroma) {
                        set({ fingeringType: typeKey as FingeringType, currentKey: newTargetKey });
                        return;
                    }
                }
            }
            return;
        }

        // lockmode: 'none' or 'key' - keep the shape but move position
        const currentType = state.fingeringType;
        const rootDef = rootDefinitions[currentType];
        const stringNotes = state.fretboardData[rootDef.string];

        // Find the fret on the root string that matches the newly clicked key
        const targetNote = stringNotes.find(fret => Note.get(fret.pitchClass).chroma === targetChroma);

        if (targetNote) {
            // Calculate where the position box needs to slide to
            let newPosition = targetNote.fret - rootDef.offset;

            // Keep the box on the fretboard (wrapping around octacve if needed)
            if (newPosition < 1) newPosition += 12;
            if (newPosition > 24) newPosition -= 12;

            set({ currentKey: newTargetKey, position: newPosition });
        } else
            set({ currentKey: newTargetKey });
    },

    handlePositionChange: (newPos) => {
        const state = get();
        const rootDef = rootDefinitions[state.fingeringType];
        const rootStringData = state.fretboardData[rootDef.string];
        const rootNoteData = rootStringData.find(f => f.fret === newPos + rootDef.offset);

        if (rootNoteData && rootNoteData.chroma !== undefined) {
            // Update BOTH the position and the new Key!
            set({ position: newPos, currentKey: CHROMA_TO_KEY[rootNoteData.chroma] });
        } else {
            set({ position: newPos });
        }
    },
}));
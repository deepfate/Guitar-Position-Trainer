// src/store/useMusicStore.ts
import { create } from 'zustand';
import { Note } from '@tonaljs/tonal';
import { MusicKey, FingeringType, LockMode, DotDisplayOption, FretNode } from '../types/music';
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
        set({ fingeringType: newType });
    },

    handleKeyChange: (newTargetKey) => {
        const state = get();
        const targetChroma = Note.get(newTargetKey).chroma;

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
        set({ currentKey: newTargetKey });
    },

    handlePositionChange: (newPos) => set({ position: newPos }),
}));
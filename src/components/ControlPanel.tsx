import { DotDisplayOption, MusicKey, FingeringType, LockMode } from '../types/music';
import CircleOfFifths from './CircleOfFifths';
import { useState, useEffect } from 'react';
import './ControlPanel.css'

import { useMusicStore } from '../store/useMusicStore';

const fingeringKeyOrder: FingeringType[] = [ // fingeringKeyOrder acts as a bridge between Fingering Type slider and the strings.
    'type1', 'type1A', 'type1B', 'type1C', 'type1D',
    'type2', 'type3',
    'type4', 'type4A', 'type4B', 'type4C', 'type4D'
];

const ROMAN_NUMERALS = [
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
    "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
    "XXI", "XXII", "XXIII", "XXIV"
];

const FINGERING_LABELS: Record<string, string> = {
    'type1': 'Type 1 (Root on 5th, Fret 2)',
    'type1A': 'Type 1A (Root on 6th, Fret 1)',
    'type1B': 'Type 1B (Root on 5th, Fret 1)',
    'type1C': 'Type 1C (Root on 4th, Fret 1)',
    'type1D': 'Type 1D (Root on 6th, Fret 3)',
    'type2': 'Type 2 (Root on 6th, Fret 2)',
    'type3': 'Type 3 (Root on 5th, Fret 4)',
    'type4': 'Type 4 (Root on 6th, Fret 4)',
    'type4A': 'Type 4A (Root on 4th, Fret 1)',
    'type4B': 'Type 4B (Root on 5th, Fret 1)',
    'type4C': 'Type 4C (Root on 6th, Fret 1)',
    'type4D': 'Type 4D (Root on 5th, Fret 3)'
};

/**
 * 
 */
export default function ControlPanel() {
    const {
        currentKey, fingeringType, lockMode, position,
        isSidebarOpen, showPositionBox, dotDisplay, dotShowAll, showStretches,
        setLockMode, setIsSidebarOpen, setShowPositionBox, setDotDisplay,
        setDotShowAll, setShowStretches, handleTypeChange, handlePositionChange, handleKeyChange
    } = useMusicStore();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        // Cleanup the listener when the component is destroyed
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return (
        <div className={`control-panel-wrapper ${isSidebarOpen ? 'open' : 'closed'}`}>

            {/* INNER CONTENT BOX */}
            <div className="control-panel-content">

                {/* 1. GLOBAL OPTIONS */}
                <div className="control-section">
                    <span className="control-panel-value" style={{ fontSize: '1.1rem', marginBottom: '5px' }}>
                        Key: {currentKey} Major
                    </span>

                    <label>
                        <input
                            type="checkbox"
                            checked={showPositionBox}
                            onChange={(e) => setShowPositionBox(e.target.checked)}
                        />
                        Show Position Box
                    </label>

                    {/* Segmented Control for Lock Mode */}
                    <label>Lock Mode:</label>
                    <div className="segmented-control">
                        <button
                            className={`segment-btn ${lockMode === 'none' ? 'active' : ''}`}
                            onClick={() => setLockMode('none')}
                        >
                            Free
                        </button>
                        <button
                            className={`segment-btn ${lockMode === 'key' ? 'active' : ''}`}
                            onClick={() => setLockMode('key')}
                        >
                            Key
                        </button>
                        <button
                            className={`segment-btn ${lockMode === 'position' ? 'active' : ''}`}
                            onClick={() => setLockMode('position')}
                        >
                            Position
                        </button>
                    </div>
                    {/* Dynamic Helper Text */}
                    <span className="helper-text">
                        {lockMode === 'none' && 'Move freely across the fretboard.'}
                        {lockMode === 'key' && 'Shapes change to stay in the current key.'}
                        {lockMode === 'position' && 'Key changes stay at the current fret.'}
                    </span>
                </div>

                {/* 2. FINGERING TYPE */}
                <div className="control-section">
                    <label>Fingering Type:</label>
                    <span className="control-panel-value">
                        {FINGERING_LABELS[fingeringType]}
                    </span>
                    <input
                        type="range"
                        min="1"
                        max="12"
                        value={fingeringKeyOrder.indexOf(fingeringType) + 1}
                        disabled={lockMode === 'key'}
                        onChange={(e) => {
                            const index = Number(e.target.value) - 1;
                            handleTypeChange(fingeringKeyOrder[index]);
                        }}
                    />
                </div>

                {/* 3. POSITION SLIDER */}
                <div className="control-section">
                    <label>Position:</label>
                    <span className="control-panel-value">
                        {ROMAN_NUMERALS[position - 1]} | {position}
                    </span>
                    <input
                        type="range"
                        min="1"
                        max="24"
                        value={position}
                        disabled={lockMode === 'position'}
                        onChange={(e) => handlePositionChange(Number(e.target.value))}
                    />
                </div>

                {/* 4. DISPLAY OPTIONS */}
                <div className="control-section">
                    <h4 style={{ margin: '10px 0 5px 0', color: 'black' }}>Fret Dots Display</h4>

                    <label>
                        <input
                            type="checkbox"
                            checked={dotShowAll}
                            onChange={(e) => setDotShowAll(e.target.checked)}
                        />
                        Toggle Fret Dots
                    </label>

                    <label>Dot Display Pattern:</label>
                    <select value={dotDisplay} onChange={(e) => setDotDisplay(e.target.value as DotDisplayOption)}>
                        <option value="fingers">Fingers</option>
                        <option value="notes">Note Names</option>
                        <option value="none">Empty Dots</option>
                    </select>
                </div>

            </div>

            {/* EDGE TOGGLE BAR */}
            <div
                className="control-panel-toggle"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <span className="control-panel-arrow">
                    ▶
                </span>
            </div>
        </div>
    );
}



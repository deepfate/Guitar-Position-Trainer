
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
        <div
            style={{
                width: isMobile ? '100vw' : '300px',
                height: isMobile ? (isSidebarOpen ? '100vh' : '60px') : '100vh',
                minWidth: isMobile ? '100vw' : '300px',
                zIndex: 50,
                transition: 'transform 0.3s ease, height 0.3s ease',
                transform: isMobile
                    ? (isSidebarOpen ? 'translateY(0)' : 'translateY(calc(100vh - 60px))')
                    : (isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'),
                position: 'fixed',
                left: 0,
                bottom: 0,
            }}
        >

            {/* 2. INNER CONTENT BOX: Handles color, padding, and scrolling */}
            <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#d9b99b',
                boxShadow: isMobile ? '0 -4px 15px rgba(0,0,0,0.2)' : '4px 0 15px rgba(0,0,0,0.2)',
                padding: '20px',
                overflowY: 'auto', // Scrollbar belongs here!
                overflowX: 'hidden' // Hard-kill any horizontal scroll
            }}>

                {/* ALL YOUR EXISTING CONTROL PANEL CONTENT GOES HERE! */}
                {/* Key, Lock Mode, Fingering Type, etc... */}
                {/* Global Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px', color: 'black' }}>
                    <span className='key-display-text'>
                        Key: {currentKey} Major
                    </span>
                    {/* Position Box Toggle */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                        <input
                            type="checkbox"
                            checked={showPositionBox}
                            onChange={(e) => setShowPositionBox(e.target.checked)}
                        />
                        Show Position Box
                    </label>

                    {/* Choose Lock Mode (Lock Key, Lock Position, or move freely) */}
                    <label>Lock Mode:</label>
                    <select value={lockMode} onChange={(e) => setLockMode(e.target.value as LockMode)}>
                        <option value="none">Free Movement</option>
                        <option value="key">Lock Key - Change Position to another in the same key.</option>
                        <option value="position">Lock Position - Change Key, keeping position at the same fret.</option>
                    </select>
                </div>

                {/* Fingering Type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
                    {/* Dynamic Text Label showing current fingering type */}
                    <label style={{ color: 'black', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        Fingering Type:
                    </label>
                    <span style={{ color: 'black', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {
                            fingeringType === 'type1' ? 'Type 1 (Root on 5th, Fret 2)' :
                                fingeringType === 'type1A' ? 'Type 1A (Root on 6th, Fret 1)' :
                                    fingeringType === 'type1B' ? 'Type 1B (Root on 5th, Fret 1)' :
                                        fingeringType === 'type1C' ? 'Type 1C (Root on 4th, Fret 1)' :
                                            fingeringType === 'type1D' ? 'Type 1D (Root on 6th, Fret 3)' :
                                                fingeringType === 'type2' ? 'Type 2 (Root on 6th, Fret 2)' :
                                                    fingeringType === 'type3' ? 'Type 3 (Root on 5th, Fret 4)' :
                                                        fingeringType === 'type4' ? 'Type 4 (Root on 6th, Fret 4)' :
                                                            fingeringType === 'type4A' ? 'Type 4A (Root on 4th, Fret 1)' :
                                                                fingeringType === 'type4B' ? 'Type 4B (Root on 5th, Fret 1)' :
                                                                    fingeringType === 'type4C' ? 'Type 4C (Root on 6th, Fret 1)' :
                                                                        'Type 4D (Root on 5th, Fret 3)'
                        }
                    </span>
                    <input
                        type="range"
                        min="1"
                        max="12"
                        value={fingeringKeyOrder.indexOf(fingeringType) + 1} // Find the number matching our current type string
                        disabled={lockMode === 'key'}
                        onChange={(e) => {
                            const index = Number(e.target.value) - 1;
                            const selectedType = fingeringKeyOrder[index];
                            handleTypeChange(selectedType);
                        }}
                    />
                </div>

                {/* Position Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
                    <label style={{ color: 'black', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        Position:
                    </label>
                    <span style={{ color: 'black', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {
                            position === 1 ? 'I | 1' : position === 2 ? 'II | 2' : position === 3 ? 'III | 3' : position === 4 ? 'IV | 4' : position === 5 ? 'V | 5' :
                                position === 6 ? 'VI | 6' : position === 7 ? 'VII | 7' : position === 8 ? 'VIII | 8' : position === 9 ? 'IX | 9' : position === 10 ? 'X | 10' :
                                    position === 11 ? 'XI | 11' : position === 12 ? 'XII | 12' : position === 13 ? 'XIII | 13' : position === 14 ? 'XIV | 14' : position === 15 ? 'XV | 15' :
                                        position === 16 ? 'XVI | 16' : position === 17 ? 'XVII | 17' : position === 18 ? 'XVIII | 18' : position === 19 ? 'XIX | 19' : position === 20 ? 'XX | 20' :
                                            position === 21 ? 'XXI | 21' : position === 22 ? 'XXII | 22' : position === 23 ? 'XXIII | 23' : 'XXIV | 24'
                        }
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


                {/* Fret Dots Display Options */}
                <h4>Fret Dots Display Options</h4>

                {/* Toggle Show All Fret Dots */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'black' }}>
                    <input
                        type="checkbox"
                        checked={dotShowAll}
                        onChange={(e) => setDotShowAll(e.target.checked)}
                    />
                    Toggle Fret Dots
                </label>

                {/* Options for what is rendered inside fret dots */}
                <div>
                    <label style={{ color: 'white', fontSize: '0.9rem' }}>Dot Display</label>
                    <select value={dotDisplay} onChange={(e) => setDotDisplay(e.target.value as DotDisplayOption)}>
                        <option value="fingers">Fingers</option>
                        <option value="notes">Note Names</option>
                        {/* <option value="numerals">Roman Numerals</option> */}
                        {/* <option value="imrp">imrp</option> */}
                        <option value="none">Empty Dots</option>
                    </select>
                </div>


                {/*  <CircleOfFifths
                    currentKeyName={currentKey}
                    onKeyChange={handleKeyChange}
                /> */}

            </div>

            {/* The Edge Toggle Bar */}
            <div
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                    position: 'absolute',
                    top: isMobile ? 0 : '50%',
                    right: isMobile ? '50%' : '-20px',
                    transform: isMobile ? 'translateX(50%)' : 'translateY(-50%)',
                    width: isMobile ? '100px' : '20px',
                    height: isMobile ? '20px' : '100px',
                    backgroundColor: '#b89b7d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: isMobile ? 0 : '8px',
                    borderTopLeftRadius: isMobile ? '8px' : 0,
                    borderBottomLeftRadius: 0,
                    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                }}
            >

                <span style={{
                    fontWeight: 'bold',
                    color: '#fff',
                    // Rotate the arrow depending on open state and screen size
                    transform: isMobile
                        ? (isSidebarOpen ? 'rotate(90deg)' : 'rotate(-90deg)')
                        : (isSidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)'),
                    transition: 'transform 0.3s ease'
                }}>
                    ▶
                </span>
            </div>







        </div>
    );
}



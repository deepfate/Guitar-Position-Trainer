// src/components/selectors/MiniNeck.tsx
import React from 'react';
import { useMusicStore } from '../../store/useMusicStore';
import { FingeringType } from '../../types/music';

export default function MiniNeck() {
    const { fingeringType, handleTypeChange, lockMode } = useMusicStore();

    // Arranged visually like Tablature: Highest string (4th) on top, Lowest (6th) on bottom
    const visualMatrix: { stringName: string; shapes: (FingeringType | null)[] }[] = [
        { stringName: '4th', shapes: ['type1C', 'type4A', null, null, null] },
        { stringName: '5th', shapes: ['type1B', 'type1', 'type4B', 'type4D', 'type3'] },
        { stringName: '6th', shapes: ['type1A', 'type1D', 'type2', 'type4C', 'type4'] },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '5px' }}>
            <span style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#555' }}>
                Tap a node to set the Root Note anchor.
            </span>

            {/* The Fretboard Chassis */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100px',
                backgroundColor: '#2a2726', // Dark rosewood color
                borderRadius: '6px',
                border: '2px solid #1a1818',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
            }}>

                {/* Draw the Frets (Vertical lines) */}
                {[0, 1, 2, 3, 4].map((fret) => (
                    <div key={`fret-${fret}`} style={{
                        position: 'absolute',
                        left: `${(fret / 4) * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: fret === 0 ? '6px' : '2px', // Nut is thicker
                        backgroundColor: fret === 0 ? '#d4d4ca' : '#777',
                        transform: fret > 0 && fret < 4 ? 'translateX(-50%)' : 'none',
                        boxShadow: '1px 0 2px rgba(0,0,0,0.5)'
                    }} />
                ))}

                {/* Draw the Strings & Interactive Nodes */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-around', padding: '10px 0'
                }}>
                    {visualMatrix.map((row, rowIndex) => (
                        <div key={row.stringName} style={{ position: 'relative', height: '2px', backgroundColor: '#999', boxShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>

                            {/* String Label */}
                            <div style={{ position: 'absolute', left: '-5px', top: '-10px', fontSize: '0.6rem', color: '#aaa', fontWeight: 'bold', backgroundColor: '#2a2726', padding: '0 2px' }}>
                                {row.stringName}
                            </div>

                            {/* Clickable Heatmap Nodes */}
                            {row.shapes.map((typeKey, colIndex) => {
                                if (!typeKey) return null;

                                const isActive = fingeringType === typeKey;
                                const isDisabled = lockMode === 'key';

                                return (
                                    <div
                                        key={typeKey}
                                        onClick={() => !isDisabled && handleTypeChange(typeKey)}
                                        style={{
                                            position: 'absolute',
                                            // Space them evenly across the 5 fret zones
                                            left: `calc(${(colIndex / 4) * 100}% ${colIndex === 0 ? '+ 8px' : colIndex === 4 ? '- 8px' : ''})`,
                                            top: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: isActive ? '18px' : '14px',
                                            height: isActive ? '18px' : '14px',
                                            borderRadius: '50%',
                                            backgroundColor: isActive ? '#2196F3' : 'rgba(255, 255, 255, 0.2)',
                                            border: isActive ? '2px solid #fff' : '2px solid rgba(255, 255, 255, 0.5)',
                                            boxShadow: isActive ? '0 0 10px #2196F3' : 'none',
                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                            opacity: isDisabled ? 0.3 : 1,
                                            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy pop animation
                                            zIndex: 10
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
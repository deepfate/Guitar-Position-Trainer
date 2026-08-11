import React, { useState } from 'react';
import { useMusicStore } from '../../store/useMusicStore';
import { FingeringType } from '../../types/music';

// Re-using our label dictionary locally for tooltips
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

export default function RootMatrix() {
    const { fingeringType, handleTypeChange, lockMode } = useMusicStore();

    // Track if the user is currently holding the mouse/finger down
    const [isDragging, setIsDragging] = useState(false);

    const matrix: (FingeringType | null)[][] = [
        ['type1A', 'type1D', 'type2', 'type4C', 'type4'], // 6th String (E)
        ['type1B', 'type1', 'type4B', 'type4D', 'type3'], // 5th String (A)
        ['type1C', 'type4A', null, null, null],           // 4th String (D)
    ];

    // The Magic Function: Finds what button is under the pointer
    const handleDrag = (clientX: number, clientY: number) => {
        if (lockMode === 'key') return; // Do nothing if locked

        // Ask the browser what element is exactly under the pointer right now
        const element = document.elementFromPoint(clientX, clientY);
        if (!element) return;

        // Check if the element has our secret 'data-type' attribute attached to it
        const targetType = element.getAttribute('data-type');

        // If it's a valid shape AND it's different from our current shape, trigger the update!
        if (targetType && targetType !== fingeringType) {
            handleTypeChange(targetType as FingeringType);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                userSelect: 'none', // Prevents highlighting text while dragging
                touchAction: 'none' // CRITICAL: Prevents the mobile screen from scrolling while you drag the grid!
            }}

            // Pointer events catch BOTH mouse clicks and mobile finger touches seamlessly
            onPointerDown={(e) => {
                setIsDragging(true);
                handleDrag(e.clientX, e.clientY); // Catch the very first tap
            }}
            onPointerMove={(e) => {
                if (isDragging) handleDrag(e.clientX, e.clientY); // Catch the drag
            }}
            onPointerUp={() => setIsDragging(false)}
            onPointerLeave={() => setIsDragging(false)} // Stops dragging if they mouse off the grid
            onPointerCancel={() => setIsDragging(false)}
        >

            {/* Column Headers (Fingers) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(5, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.7rem', color: '#666', fontWeight: 'bold' }}>
                <div />
                <div>Index</div>
                <div>Middle</div>
                <div>Ring</div>
                <div>Pinky</div>
                <div>Stretch</div>
            </div>

            {/* The Grid */}
            {matrix.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: 'auto repeat(5, 1fr)', gap: '4px', alignItems: 'center' }}>

                    {/* Row Header (String) */}
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#444', textAlign: 'right', paddingRight: '5px' }}>
                        {rowIndex === 0 ? '6th' : rowIndex === 1 ? '5th' : '4th'}
                    </div>

                    {/* Buttons */}
                    {row.map((typeKey, colIndex) => {
                        if (!typeKey) {
                            return <div key={`empty-${rowIndex}-${colIndex}`} />;
                        }

                        const isActive = fingeringType === typeKey;
                        const isDisabled = lockMode === 'key';

                        return (
                            <button
                                key={typeKey}
                                data-type={typeKey} // <-- This is what elementFromPoint looks for!
                                title={FINGERING_LABELS[typeKey]}
                                disabled={isDisabled}
                                // Removed onClick because onPointerDown handles it now!
                                style={{
                                    backgroundColor: isActive ? '#fff' : 'transparent',
                                    color: isActive ? '#000' : '#444',
                                    border: isActive ? '1px solid #fff' : '1px solid #a88d73',
                                    padding: '6px 0',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    opacity: isDisabled ? 0.5 : 1,
                                    boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.1s ease', // Faster transition for snappy dragging
                                    pointerEvents: isDisabled ? 'none' : 'auto' // Important for elementFromPoint
                                }}
                            >
                                {typeKey.replace('type', '')}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
// src/components/selectors/KaossPad.tsx
import React, { useRef, useState, useEffect } from 'react';
import { useMusicStore } from '../../store/useMusicStore';
import { FingeringType } from '../../types/music';

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

export default function KaossPad() {
    const { fingeringType, handleTypeChange, lockMode } = useMusicStore();
    const padRef = useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    // Visual position of the glowing puck (percentages)
    const [puckPos, setPuckPos] = useState({ x: 50, y: 50 });

    // Mapped spatially: Top is 4th string, Bottom is 6th string
    // Left is Index finger, Right is Pinky stretch
    const matrix: (FingeringType | null)[][] = [
        ['type1C', 'type4A', null, null, null],           // Y-Zone 0 (Top)
        ['type1B', 'type1', 'type4B', 'type4D', 'type3'], // Y-Zone 1 (Middle)
        ['type1A', 'type1D', 'type2', 'type4C', 'type4'], // Y-Zone 2 (Bottom)
    ];

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || lockMode === 'key' || !padRef.current) return;

        const rect = padRef.current.getBoundingClientRect();

        // Calculate relative X/Y coordinates inside the box (0.0 to 1.0)
        let relX = (e.clientX - rect.left) / rect.width;
        let relY = (e.clientY - rect.top) / rect.height;

        // Clamp the values so the puck can't fly off the screen
        relX = Math.max(0, Math.min(1, relX));
        relY = Math.max(0, Math.min(1, relY));

        // Update visual puck
        setPuckPos({ x: relX * 100, y: relY * 100 });

        // Calculate which cell we are in (5 columns, 3 rows)
        // We use Math.min to ensure a value of exactly 1.0 doesn't push it out of bounds
        const col = Math.min(4, Math.floor(relX * 5));
        const row = Math.min(2, Math.floor(relY * 3));

        const targetType = matrix[row][col];

        // If we dragged into a valid zone and it's a new type, trigger the change!
        if (targetType && targetType !== fingeringType) {
            handleTypeChange(targetType);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#555', fontStyle: 'italic' }}>
                <span>Drag to explore</span>
                <span style={{ fontWeight: 'bold', color: 'black' }}>
                    {FINGERING_LABELS[fingeringType]?.split('(')[0].trim()}
                </span>
            </div>

            {/* The Pad Container */}
            <div
                ref={padRef}
                onPointerDown={(e) => {
                    setIsDragging(true);
                    // Force an immediate update on tap by faking a drag
                    handlePointerMove(e);
                    // Capture pointer so dragging works even if cursor leaves the div
                    e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={(e) => {
                    setIsDragging(false);
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }}
                onPointerCancel={(e) => {
                    setIsDragging(false);
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '150px',
                    backgroundColor: '#111',
                    borderRadius: '8px',
                    border: '2px solid #333',
                    overflow: 'hidden',
                    cursor: lockMode === 'key' ? 'not-allowed' : 'crosshair',
                    touchAction: 'none', // Prevents mobile scrolling while dragging
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,1)'
                }}
            >
                {/* Visual Grid Lines (Purely cosmetic) */}
                <div style={{ position: 'absolute', top: '33%', width: '100%', height: '1px', backgroundColor: '#333' }} />
                <div style={{ position: 'absolute', top: '66%', width: '100%', height: '1px', backgroundColor: '#333' }} />
                {[20, 40, 60, 80].map(pct => (
                    <div key={pct} style={{ position: 'absolute', left: `${pct}%`, height: '100%', width: '1px', backgroundColor: '#333' }} />
                ))}

                {/* The Glowing Puck */}
                <div style={{
                    position: 'absolute',
                    left: `${puckPos.x}%`,
                    top: `${puckPos.y}%`,
                    width: '30px',
                    height: '30px',
                    backgroundColor: lockMode === 'key' ? '#555' : '#4CAF50',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: lockMode === 'key' ? 'none' : '0 0 15px #4CAF50, 0 0 30px #4CAF50',
                    pointerEvents: 'none', // Critical: ensures the puck doesn't steal pointer events from the pad
                    transition: isDragging ? 'none' : 'all 0.3s ease', // Snaps instantly while dragging, drifts smoothly if tapped
                }} />

                {/* Axis Labels */}
                <span style={{ position: 'absolute', left: '5px', top: '5px', fontSize: '0.6rem', color: '#666', pointerEvents: 'none' }}>4th String</span>
                <span style={{ position: 'absolute', left: '5px', bottom: '5px', fontSize: '0.6rem', color: '#666', pointerEvents: 'none' }}>6th String</span>
                <span style={{ position: 'absolute', right: '5px', bottom: '5px', fontSize: '0.6rem', color: '#666', pointerEvents: 'none' }}>Pinky</span>
            </div>
        </div>
    );
}
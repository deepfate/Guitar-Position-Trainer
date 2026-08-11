import React, { useState, useRef } from 'react';
import { MusicKey } from '../types/music';
import { Note } from '@tonaljs/tonal';
import { useMusicStore } from '../store/useMusicStore';

interface CircleKey {
    name: MusicKey;
    chroma: number;
}

//export default function CircleOfFifths({ currentKeyName, onKeyChange }: CircleOfFifthsProps) {
export default function CircleOfFifths() {
    const { currentKey, handleKeyChange } = useMusicStore();
    const wheelRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const circleKeys: CircleKey[] = [
        { name: 'C', chroma: 0 },
        { name: 'G', chroma: 7 },
        { name: 'D', chroma: 2 },
        { name: 'A', chroma: 9 },
        { name: 'E', chroma: 4 },
        { name: 'B', chroma: 11 },
        { name: 'F#', chroma: 6 },
        { name: 'Db', chroma: 1 }, // Chroma 1 matches both C# and Db!
        { name: 'Ab', chroma: 8 }, // Chroma 8 matches both G# and Ab!
        { name: 'Eb', chroma: 3 },
        { name: 'Bb', chroma: 10 },
        { name: 'F', chroma: 5 }
    ];


    // Get the chroma of the incoming key from the fretboard (handles enharmonics dynamically)
    const currentKeyChroma = Note.get(currentKey).chroma;

    // Helper to calculate which note index (0 - 11) the mouse/pointer is currently aiming at.
    const getTargetIndexFromPointer = (clientX: number, clientY: number): number => {
        if (!wheelRef.current) return 0;

        const rect = wheelRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate angle in radians, convert to degrees
        let angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

        // Convert to standard 0 - 360 scale starting from the top (12 o'clock)
        let adjustedAngle = angle + 90;
        if (adjustedAngle < 0) adjustedAngle += 360;

        // 360 degrees / 12 slices = 30 degrees per slice
        // Round to nearest slice index
        const index = Math.round(adjustedAngle / 30) % 12;
        return index;
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);

        // Update key on initial click
        const index = getTargetIndexFromPointer(e.clientX, e.clientY);

        handleKeyChange(circleKeys[index].name);
        //onKeyChange(circleKeys[index].name);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;

        const index = getTargetIndexFromPointer(e.clientX, e.clientY);
        const targetKey = circleKeys[index];

        // Match by CHROMA value instead of string name to bridge sharps and flats smoothly
        if (targetKey.chroma !== currentKeyChroma) {
            handleKeyChange(targetKey.name);
            //onKeyChange(targetKey.name);
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    // Calculate where active note is sitting right now
    const activeIndex = circleKeys.findIndex(key => key.chroma === currentKeyChroma);

    // Convert index to degrees (C at index 0 = 0 degrees. G at index 1 at 3- deg, etc)
    const highlightAngle = activeIndex !== -1 ? activeIndex * 30 : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0', userSelect: 'none' }}>
            <label style={{ color: 'black', marginBottom: '10px', fontWeight: 'bold' }}>
                Circle of Fifths:
            </label>

            {/* Circle of Fifths */}
            <div
                ref={wheelRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    backgroundColor: '#ddd',
                    border: '4px solid #333',
                    position: 'relative',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    touchAction: 'none'
                }}
            >
                {/* Selector Ring */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '34px',
                    height: '34px',
                    marginLeft: '-17px',
                    marginTop: '-17px',
                    borderRadius: '50%',
                    backgroundColor: '#2196F3',
                    border: '2px solid #0b7dda',
                    boxShadow: '0 0 8px rgba(33, 150, 243, 0.6)',
                    // Move the dot out to orbit the edge based on active angle
                    transform: `rotate(${highlightAngle}deg) translate(0, -65px)`,
                    // Smooth transition when updated externally (slider), instant snap when dragging
                    transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                    pointerEvents: 'none',
                    zIndex: 1
                }} />

                {/* Render Note Names */}
                {circleKeys.map((key, index) => {
                    const angle = index * 30; // 30 degrees per step
                    const isActive = key.chroma === currentKeyChroma;
                    return (
                        <div
                            key={key.name}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                width: '30px',
                                height: '30px',
                                marginLeft: '-15px',
                                marginTop: '-15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                // Text color shifts so it's readable when the selector ring slides underneath it
                                color: isActive ? 'white' : 'black',
                                zIndex: 2,
                                // Position the label out on the perimeter without tilting the element itself
                                transform: `rotate(${angle}deg) translate(0, -65px) rotate(${-angle}deg)`,
                                pointerEvents: 'none'
                            }}
                        >
                            {key.name}
                        </div>
                    );
                })}

                {/* Inner decorative cutout to make it look like a wheel ring */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '90px',
                    height: '90px',
                    marginLeft: '-45px',
                    marginTop: '-45px',
                    borderRadius: '50%',
                    backgroundColor: '#eee',
                    border: '2px dashed #999',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />
            </div>
        </div>
    );
}

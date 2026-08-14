import React, { useState, useRef } from 'react';

interface DraggableBoxProps {
    title: string;
    defaultX: number;
    defaultY: number;
    children: React.ReactNode;
}

export default function DraggableBox({
    title,
    defaultX,
    defaultY,
    children
}: DraggableBoxProps) {
    const [position, setPosition] = useState({ x: defaultX, y: defaultY });
    const [isDragging, setIsDragging] = useState(false);

    // Store where the mouse grabbed inside the handle bar relative to the box's edges
    const dragStartRef = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        // Only trigger dragging if they click the handle bar, not the interactive content inside
        if ((e.target as HTMLElement).className !== 'box-handle') return;

        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);

        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;

        setPosition({
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y
        });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const isMobile = window.innerWidth <= 768; // Could also use a React hook for live resizing.

    if (isMobile) {
        return (
            <div style={{ backgroundColor: 'white', margin: '10px', borderRadius: '8px', border: '2px solid #333' }}>
                <div style={{ padding: '10px', backgroundColor: '#333', color: 'white', fontWeight: 'bold' }}>
                    {title}
                </div>
                <div style={{ padding: '15px' }}>
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                backgroundColor: 'white',
                border: '2px solid #333',
                borderRadius: '8px',
                boxShadow: isDragging ? '0 10px 25px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: isDragging ? 100 : 10,
                display: 'inline-flex',
                flexDirection: 'column',
                transform: isDragging ? 'scale(1.01)' : 'scale(1)',
                transition: isDragging ? 'none' : 'transform 0.1s ease, box-shadow 0.1s ease'
            }}
        >
            {/* Grab Handle Bar */}
            <div
                className="drag-handle"
                onPointerDown={handlePointerDown}
                style={{
                    backgroundColor: '#333',
                    color: 'white',
                    padding: '6px 12px',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    borderTopLeftRadius: '5px',
                    borderTopRightRadius: '5px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                {title}
                <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>::: GRAB HERE :::</span>
            </div>

            {/* Inner Content Component Sandbox */}
            <div style={{ padding: '15px' }}>
                {children}
            </div>
        </div>
    );
}

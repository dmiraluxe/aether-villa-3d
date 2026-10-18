import React, { useState } from 'react';
import { officeRooms } from '../config/officeLayout';

interface CinematicPlayerProps {
  playing: boolean;
  loop: boolean;
  restartToken: number;
  onComplete: () => void;
  onPositionChange: (position: { x: number; z: number }) => void;
  onRoomChange: (room: string | null) => void;
}

export function CinematicPlayer({
  playing,
  onComplete,
  onRoomChange
}: CinematicPlayerProps) {
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);

  // List of showcase media items synchronized with office rooms
  const mediaSlides = [
    { id: 'overview', name: '3D ARCHITECTURAL FILM', url: '/walkthrough-ref.mp4', isVideo: true },
    { id: 'reception', name: 'RECEPTION', url: '/images/office/Luxury Reception with Backlit World Map.png', isVideo: false },
    { id: 'central-lounge', name: 'CENTRAL LOUNGE', url: '/images/office/Luxurious Green Office Lounge.png', isVideo: false },
    { id: 'collaboration', name: 'OPEN WORKSTATIONS', url: '/images/office/Symmetrical Luxury Office with Greenery.png', isVideo: false },
    { id: 'boardroom', name: 'BOARDROOM', url: '/images/office/LUXURY~2.PNG', isVideo: false }
  ];

  const currentSlide = mediaSlides[currentRoomIndex];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#0f0f11', overflow: 'hidden' }}>
      
      {/* Media Presentation Layer (Video or High-Res Photo Walkthrough) */}
      {currentSlide.isVideo ? (
        <video
          src={currentSlide.url}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <img
          src={currentSlide.url}
          alt={currentSlide.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'fadeIn 0.8s ease-in-out' }}
        />
      )}

      {/* Dark Vignette Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(15,15,17,0.85) 0%, rgba(15,15,17,0.2) 50%, rgba(15,15,17,0.6) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Interactive Navigation Timeline on Right */}
      <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10 }}>
        {mediaSlides.map((slide, index) => {
          const isActive = index === currentRoomIndex;
          return (
            <button
              key={slide.id}
              onClick={() => {
                setCurrentRoomIndex(index);
                onRoomChange(slide.id === 'overview' ? null : slide.name);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? '#c5a059' : 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'right',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>{slide.name}</span>
              <div style={{
                width: isActive ? '12px' : '6px',
                height: isActive ? '12px' : '6px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#c5a059' : 'rgba(255, 255, 255, 0.3)',
                boxShadow: isActive ? '0 0 10px #c5a059' : 'none',
                transition: 'all 0.3s ease'
              }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';

// Convert IPFS URLs to HTTP gateway URLs
const convertIpfsToHttp = (url: string): string => {
  if (url.startsWith('ipfs://')) {
    const hash = url.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }
  return url;
};

interface CrystalProps {
  metadata: {
    mood?: string;
    energy?: number;
    color?: string;
    image?: string;
  } | null;
}

export const Crystal = ({ metadata }: CrystalProps) => {
  const crystalRef = useRef<HTMLDivElement | HTMLImageElement>(null);

  useEffect(() => {
    console.log('Crystal component received metadata:', metadata);
    if (!crystalRef.current || !metadata) return;

    const crystal = crystalRef.current;
    const mood = metadata.mood || 'calm';
    const energy = metadata.energy || 0.5;
    const color = metadata.color || '#44baff';

    console.log('Applying crystal effects - mood:', mood, 'energy:', energy, 'color:', color);

    // Set CSS variable for glow color
    crystal.style.setProperty('--glow-color', color);

    // Remove all animations
    crystal.className = 'crystal-orb transition-all duration-1000';

    // Add mood-based animations
    if (mood === 'angry') {
      crystal.classList.add('animate-pulse-glow');
    } else if (mood === 'calm') {
      crystal.classList.add('animate-float-gentle');
    } else if (mood === 'mystic') {
      crystal.classList.add('animate-rotate-slow');
    }

    // Add energy-based animations
    if (energy > 0.7) {
      crystal.classList.add('animate-pulse-glow');
    }
  }, [metadata]);

  if (!metadata) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-muted-foreground text-xl">
          Loading crystal...
        </div>
      </div>
    );
  }

  console.log('Rendering crystal with metadata:', metadata);

  return (
    <div className="flex items-center justify-center relative min-h-[70vh]">
      {/* Ambient glow rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl animate-pulse-glow" 
             style={{ '--glow-color': metadata.color || '#44baff' } as React.CSSProperties} />
      </div>
      
      {/* Crystal orb or image */}
      {metadata.image ? (
        <img
          ref={crystalRef as React.RefObject<HTMLImageElement>}
          src={convertIpfsToHttp(metadata.image)}
          alt="Memory Crystal"
          className="crystal-orb relative z-10 w-96 h-96 object-contain rounded-full transition-all duration-1000"
        />
      ) : (
        <div
          ref={crystalRef as React.RefObject<HTMLDivElement>}
          className="crystal-orb relative z-10 w-96 h-96 rounded-full glass transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, ${metadata.color || '#44baff'}40, transparent)`,
            boxShadow: `0 0 60px ${metadata.color || '#44baff'}80, 0 0 100px ${metadata.color || '#44baff'}40, inset 0 0 60px ${metadata.color || '#44baff'}30`,
          }}
        >
          {/* Inner glow */}
          <div 
            className="absolute inset-8 rounded-full"
            style={{
              background: `radial-gradient(circle, ${metadata.color || '#44baff'}60, transparent)`,
              filter: 'blur(20px)',
            }}
          />
        </div>
      )}

      {/* Metadata display */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-8 text-center">
        <div className="glass rounded-lg px-6 py-4 space-y-2">
          {metadata.mood && (
            <div className="text-sm">
              <span className="text-muted-foreground">Mood:</span>{' '}
              <span className="text-primary font-medium">{metadata.mood}</span>
            </div>
          )}
          {metadata.energy !== undefined && (
            <div className="text-sm">
              <span className="text-muted-foreground">Energy:</span>{' '}
              <span className="text-accent font-medium">{(metadata.energy * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

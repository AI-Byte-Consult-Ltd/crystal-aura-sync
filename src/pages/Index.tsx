import { useState, useEffect, useCallback } from 'react';
import { Crystal } from '@/components/Crystal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

interface NFTMetadata {
  mood?: string;
  energy?: number;
  color?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// Default IPFS hash to load on startup
const DEFAULT_IPFS_HASH = 'ipfs://bafkreiaoztmsa2lubeqxvpztsftwutwpe7kcm5fnqjdmxjnqkndq5ejrsq';

// Convert IPFS URLs to HTTP gateway URLs
const convertIpfsToHttp = (url: string): string => {
  if (url.startsWith('ipfs://')) {
    const hash = url.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }
  return url;
};

const Index = () => {
  const [metadataUrl, setMetadataUrl] = useState(DEFAULT_IPFS_HASH);
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const parseMetadata = (data: any): NFTMetadata => {
    // Handle both direct properties and attributes array
    const mood = data.attributes?.find((a: any) => a.trait_type === 'mood')?.value || data.mood;
    const energy = data.attributes?.find((a: any) => a.trait_type === 'energy')?.value || data.energy;
    const color = data.attributes?.find((a: any) => a.trait_type === 'color')?.value || data.color || '#44baff';
    const image = data.image;

    return {
      mood: typeof mood === 'string' ? mood : undefined,
      energy: typeof energy === 'number' ? energy : undefined,
      color: typeof color === 'string' ? color : undefined,
      image: typeof image === 'string' ? image : undefined,
    };
  };

  const fetchMetadata = useCallback(async (url: string) => {
    if (!url) return;

    setIsLoading(true);
    try {
      const httpUrl = convertIpfsToHttp(url);
      console.log('Fetching metadata from:', httpUrl);
      const response = await fetch(httpUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }
      const data = await response.json();
      console.log('Raw metadata received:', data);
      const parsed = parseMetadata(data);
      console.log('Parsed metadata:', parsed);
      setMetadata(parsed);
      
      toast({
        title: "Crystal Activated",
        description: "Metadata loaded successfully",
      });
    } catch (error) {
      console.error('Error fetching metadata:', error);
      toast({
        title: "Connection Failed",
        description: "Could not load metadata from the provided URL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleLoadCrystal = () => {
    fetchMetadata(metadataUrl);
  };

  // Auto-load default IPFS metadata on mount
  useEffect(() => {
    console.log('Auto-loading default IPFS metadata');
    fetchMetadata(DEFAULT_IPFS_HASH);
  }, [fetchMetadata]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!metadataUrl) return;

    const interval = setInterval(() => {
      fetchMetadata(metadataUrl);
    }, 60000);

    return () => clearInterval(interval);
  }, [metadataUrl, fetchMetadata]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse-glow" 
           style={{ animationDelay: '1s' }} />

      {/* Header */}
      <div className="text-center mb-12 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-primary animate-pulse-glow" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            AI Memory Crystal
          </h1>
          <Sparkles className="w-8 h-8 text-secondary animate-pulse-glow" />
        </div>
        <p className="text-muted-foreground text-lg">
          Visualize NFT metadata as a living digital crystal
        </p>
      </div>

      {/* Input section */}
      <div className="w-full max-w-2xl mb-16 relative z-10">
        <div className="glass rounded-2xl p-6 space-y-4">
          <label htmlFor="metadata-url" className="text-sm font-medium text-foreground block">
            NFT Metadata URL (IPFS or HTTP)
          </label>
          <div className="flex gap-3">
            <Input
              id="metadata-url"
              type="text"
              placeholder="ipfs://... or https://..."
              value={metadataUrl}
              onChange={(e) => setMetadataUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoadCrystal()}
              className="flex-1 bg-background/50 border-primary/30 focus:border-primary transition-colors"
              disabled={isLoading}
            />
            <Button
              onClick={handleLoadCrystal}
              disabled={!metadataUrl || isLoading}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 transition-all px-8"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                'Load Crystal'
              )}
            </Button>
          </div>
          
          {/* Example note */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              Supports both IPFS URLs (ipfs://...) and HTTP URLs. Auto-converts IPFS to gateway URLs.
            </p>
          </div>
        </div>
      </div>

      {/* Crystal display */}
      <div className="relative z-10 w-full">
        <Crystal metadata={metadata} />
      </div>

      {/* Auto-refresh indicator */}
      {metadata && (
        <div className="mt-12 text-center text-sm text-muted-foreground relative z-10">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Auto-refreshing every 60 seconds
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

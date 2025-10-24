import { useState } from 'react';
import CastleSelector from '../CastleSelector';
import { Button } from '@/components/ui/button';

export default function CastleSelectorExample() {
  const [open, setOpen] = useState(false);

  const handleSelectCastle = (rank: 1 | 2 | 3 | 4) => {
    console.log(`Selected castle rank: ${rank}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div>
        <Button onClick={() => setOpen(true)} data-testid="button-open-selector">
          Open Castle Selector
        </Button>
        <CastleSelector
          open={open}
          onClose={() => setOpen(false)}
          castles={{ rank1: 3, rank2: 2, rank3: 1, rank4: 1 }}
          playerColor="red"
          onSelectCastle={handleSelectCastle}
        />
      </div>
    </div>
  );
}

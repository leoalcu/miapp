import ActionPanel from '../ActionPanel';

export default function ActionPanelExample() {
  const handlePlaceCastle = () => {
    console.log('Place castle clicked');
  };

  const handleDrawTile = () => {
    console.log('Draw tile clicked');
  };

  const handlePlaySecretTile = () => {
    console.log('Play secret tile clicked');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="space-y-4 max-w-sm">
        <ActionPanel
          onPlaceCastle={handlePlaceCastle}
          onDrawTile={handleDrawTile}
          onPlaySecretTile={handlePlaySecretTile}
          hasSecretTile={true}
          disabled={false}
        />
        <ActionPanel
          onPlaceCastle={handlePlaceCastle}
          onDrawTile={handleDrawTile}
          onPlaySecretTile={handlePlaySecretTile}
          hasSecretTile={false}
          disabled={false}
        />
      </div>
    </div>
  );
}

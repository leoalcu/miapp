import EpochTracker from '../EpochTracker';

export default function EpochTrackerExample() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="space-y-4">
        <EpochTracker currentEpoch={1} />
        <EpochTracker currentEpoch={2} />
        <EpochTracker currentEpoch={3} />
      </div>
    </div>
  );
}

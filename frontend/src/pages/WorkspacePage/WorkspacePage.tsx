import { Card, EmptyState } from '@/components/ui';

export function WorkspacePage() {
  return (
    <div className="animate-fade-in">
      <Card variant="glass" padding="lg">
        <EmptyState
          title="Workspace Ready"
          description="This workspace is set up and ready for your research. Add papers, run analyses, and generate reports."
        />
      </Card>
    </div>
  );
}

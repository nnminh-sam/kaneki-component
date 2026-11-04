import { DataShowcase } from "./DataShowcase";
import { FormsShowcase } from "./FormsShowcase";

/** Compact showcase: one example of each new component family. */
export function NewComponentsShowcase() {
  return (
    <div id="showcase" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-fg">New components</h2>
        <p className="text-xs text-muted">
          Forms and pickers, popover, confirm, stats and progress, alerts and lists, navigation and charts.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormsShowcase />
        <DataShowcase />
      </div>
    </div>
  );
}

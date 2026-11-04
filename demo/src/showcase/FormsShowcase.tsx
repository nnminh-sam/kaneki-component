import { useState } from "react";
import { Car, Coffee, Home, Plus, ShoppingBag } from "lucide-react";
import {
  Button,
  ChipGroup,
  ColorSwatchPicker,
  ConfirmProvider,
  DayGridPicker,
  MiniCalendar,
  NumberStepper,
  Popover,
  PopoverClose,
  SegmentedControl,
  SelectableTile,
  useConfirm,
  useToast,
} from "../../../src";
import { ShowcaseCard } from "./ShowcaseCard";

const SWATCHES = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9", "#a855f7"];

/** Forms & pickers: chips, segmented, stepper, tiles, swatches, day grid, calendar. */
export function FormsShowcase() {
  const [period, setPeriod] = useState("month");
  const [category, setCategory] = useState<string | null>("food");
  const [days, setDays] = useState(30);
  const [color, setColor] = useState(SWATCHES[0]);
  const [payday, setPayday] = useState<number | null>(25);
  const [date, setDate] = useState<Date | null>(new Date());

  return (
    <>
      <ShowcaseCard title="Forms & pickers" description="Chips, segmented control, stepper and tiles (lg = 40px touch targets).">
        <div className="space-y-4">
          <SegmentedControl
            label="Period"
            size="lg"
            value={period}
            onChange={setPeriod}
            options={[
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ]}
          />
          <ChipGroup
            label="Category"
            size="lg"
            value={category}
            onChange={setCategory}
            options={[
              { value: "food", label: "Food", icon: <Coffee className="h-4 w-4" /> },
              { value: "home", label: "Home", icon: <Home className="h-4 w-4" /> },
              { value: "car", label: "Car", icon: <Car className="h-4 w-4" /> },
            ]}
          />
          <NumberStepper label="Reminder (days, editable)" size="lg" editable min={1} max={100} value={days} onChange={setDays} />
          <div className="grid grid-cols-2 gap-3">
            <SelectableTile
              selected={category === "shopping"}
              onClick={() => setCategory(category === "shopping" ? null : "shopping")}
              leading={<ShoppingBag />}
              title="Shopping"
              description="Toggle tile"
            />
            <SelectableTile dashed leading={<Plus />} title="Add category" />
          </div>
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Pickers" description="Colour swatches, payday grid and a mini calendar.">
        <div className="space-y-4">
          <ColorSwatchPicker label="Colour" swatches={SWATCHES} value={color} onChange={setColor} />
          <DayGridPicker label="Payday" max={31} columns={7} value={payday} onChange={setPayday} />
          <MiniCalendar value={date} onChange={setDate} />
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Popover & confirm" description="Anchored popover and promise-based confirm dialogs.">
        <ConfirmProvider>
          <OverlayDemo />
        </ConfirmProvider>
      </ShowcaseCard>
    </>
  );
}

function OverlayDemo() {
  const confirm = useConfirm();
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Popover aria-label="Quick note" trigger={<Button variant="outline">Open popover</Button>}>
        <div className="w-56 space-y-3 p-3 text-sm">
          <p className="text-fg">Popovers trap nothing but return focus to the trigger on close.</p>
          <PopoverClose className="rounded-md px-2 py-1 text-xs text-accent">Close</PopoverClose>
        </div>
      </Popover>
      <Button
        variant="danger-outline"
        onClick={async () => {
          const ok = await confirm({ title: "Delete this expense?", description: "This cannot be undone.", destructive: true, confirmText: "Delete" });
          toast.info(ok ? "Deleted" : "Kept", ok ? "The expense was removed." : "Nothing changed.");
        }}
      >
        Confirm delete
      </Button>
    </div>
  );
}

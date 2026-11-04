# kaneki-components

> Reusable UI component package and design system inherited from the Kaneki ecosystem, ensuring consistent UI/UX across all future frontend applications.

## ✨ Features

- **🎨 Theming**: `light` / `dark` / `system` themes driven by semantic tokens (`--bg`, `--surface`, `--fg`, `--muted`, `--border`, `--accent`, `--danger`, `--warn`, `--ok` and their `-soft` / `-fg` pairs), a `dark:` variant that follows the resolved theme, and a `ThemeScript` that prevents a flash of the wrong theme on server-rendered pages.
- **🧩 Primitives**: Button (+ `IconButton`, danger-outline / danger-ghost / link variants, pill shape), Card, Badge, Avatar, Tooltip, Switch, Dropdown, Skeleton / spinners.
- **📝 Forms**: Input / Textarea / Select with automatic label and `aria-describedby` / `aria-invalid` wiring, `Field` for custom controls, Checkbox, CheckboxChip, SegmentedControl, Chip / ChipGroup, ColorSwatchPicker, IconPicker, DayGridPicker, MiniCalendar, NumberStepper, PeriodSwitcher.
- **🪟 Overlays**: Modal on native `<dialog>` (focus handling, close veto for unsaved changes, busy state, mobile bottom-sheet variant), ActionModal, `useConfirm()` promise dialogs, Popover, toasts.
- **🧭 Layout & navigation**: AppHeader, PageHeader, Section, Container, TopNav / NavItem, mobile BottomNav, CollapsibleSidebar, accessible Tabs (roving keyboard, vertical rail, kept-mounted panels).
- **📊 Data display**: Stat / StatGroup, DeltaBadge, Progress (marker, secondary bar), ProgressRing, SegmentBar, Alert / Callout, List / ListItem, DescriptionList, EmptyState, Table / DataTable.
- **📈 Charts**: Line / Area, Bar, Donut, Heatmap grid, Sparkline, Pareto curve, with keyboard-navigable tooltips and screen-reader data tables.
- **🪝 Hooks**: `useSwipe`, `useMediaQuery`, `usePrefersReducedMotion`, `useContainerWidth`, `useUnsavedChanges`.
- **🚀 Demo**: interactive preview in `demo/`, deployable to Vercel.

All navigation items and list rows accept a polymorphic `as` prop, so framework links (e.g. Next.js `<Link>`) plug in directly. Interactive components follow WAI-ARIA patterns and respect `prefers-reduced-motion`.

---

## 📥 Installation

This package is not published to npm (the `kaneki-components` name there belongs to an unrelated package). Install it from this repository:

```bash
# Build from a local checkout and install the packed tarball
cd kaneki-component && npm install && npm pack --pack-destination ../my-app/vendor
cd ../my-app && npm install ./vendor/kaneki-components-<version>.tgz
```

Peer dependencies: `react` and `react-dom` 18 or 19.

---

## 🚀 Quick Start

### Option A — your app runs Tailwind v4 (recommended)

One Tailwind build covers your app and the components, so you get a single preflight and can use the Kaneki tokens (`bg-surface`, `text-muted`, `border-border`, `bg-accent` …) in your own markup:

```css
/* app.css */
@import "tailwindcss";
@import "kaneki-components/tailwind.css";
```

### Option B — no Tailwind in your app

Import the prebuilt stylesheet instead:

```tsx
import "kaneki-components/styles.css";
```

### Providers and theme script

```tsx
import { ConfirmProvider, ThemeProvider, ThemeScript, ToastProvider } from "kaneki-components";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-bg text-fg">
        <ThemeScript storageKey="my_app_theme" />
        <ThemeProvider storageKey="my_app_theme" defaultTheme="system">
          <ToastProvider>
            <ConfirmProvider>{children}</ConfirmProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

`ThemeProvider` and `ThemeScript` must share `storageKey`. The theme is applied as `data-theme` (`light` | `dark` | `system`) on `<html>`.

---

## 🧩 Components

Everything below is exported from `kaneki-components`. Every component accepts `className`, merged last with `cn` (tailwind-merge), so your classes override the defaults.

**Actions**
- `Button` – primary / secondary / outline / ghost / danger / warn / success / link button; `as` renders it as a link or any component.
- `SubmitButton` – `type="submit"` Button with a pending state.
- `IconButton` – icon-only button with a required `label` (32 / 40 / 44px).
- `Chip`, `ChipGroup` – toggle or action pills; single / multiple selection groups (sm / md / lg).
- `SelectableTile` – card-like button for grids of choices or an "add new" tile (`aria-pressed` / `aria-expanded`).
- `DropdownMenu`, `DropdownItem`, `DropdownSeparator` – simple action menu.

**Forms**
- `Field`, `Label`, `HelperText`, `Input`, `Select`, `Textarea` – labelled form controls with error / helper wiring.
- `Checkbox`, `CheckboxChip` – checkbox and pill-style checkbox.
- `Switch` – on / off toggle with label and description.
- `SegmentedControl` – single choice with radio or toggle semantics (sm / md / lg).
- `NumberStepper` – − / + stepper; `editable` turns the value into a numeric input.
- `ColorSwatchPicker`, `IconPicker` – grid pickers for colours and icons.
- `DayGridPicker`, `MiniCalendar` – day-of-month grid and compact month calendar.

**Overlays & feedback**
- `Modal`, `ActionModal` – native `<dialog>` modal (dialog or bottom sheet) and prompt / confirm / alert presets.
- `ConfirmProvider` + `useConfirm()` – promise-based confirm dialogs.
- `Popover`, `PopoverClose`, `usePopover()` – anchored, focus-managed popover.
- `Tooltip` – hover / focus tooltip.
- `ToastProvider` + `useToast()` – toast notifications.
- `Alert`, `Callout` – inline status messages.
- `Skeleton`, `LoadingBar`, `LoadingSpinner` – loading placeholders.
- `EmptyState` – placeholder for views without data.

**Data display**
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` – surfaces; `CardHeader` takes `icon` / `title` / `description` / `actions`.
- `Badge` – small pill label.
- `Avatar` – image with initials fallback, status dot and corner badge slot.
- `Stat`, `StatGroup`, `DeltaBadge` – metrics (`<dl>`), responsive groups and % change badges.
- `Progress`, `ProgressRing`, `SegmentBar` – linear, circular and segmented progress.
- `List`, `ListItem` – rows with leading / trailing / actions, optionally interactive.
- `DescriptionList`, `DescriptionItem` – term / value rows.
- `Table` (+ `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`), `DataTable` – table primitives and a sortable, searchable, paginated table.

**Navigation & layout**
- `AppHeader` – sticky top bar with brand, nav, actions and a `secondary` row.
- `TopNav`, `BottomNav`, `BottomNavItem`, `NavItem` – desktop and mobile navigation (polymorphic `as`).
- `CollapsibleSidebar`, `SidebarNav`, `SidebarSection`, `SidebarItem` – collapsible sidebar with mobile drawer.
- `Tabs`, `TabList`, `TabTrigger`, `TabContent` – pill / rail / underline tabs, horizontal or vertical (`mobileOrientation`).
- `PeriodSwitcher` – "◀ period ▶" navigation with buttons or links (`prevHref` / `nextHref` / `linkAs`).
- `Container`, `PageHeader`, `Section` – page layout.

**Charts**
- `LineChart`, `AreaChart`, `BarChart`, `DonutChart`, `HeatmapGrid`, `Sparkline`, `ParetoCurve` – SVG charts.
- `ChartFrame`, `ChartAxisX`, `ChartAxisY`, `Legend`, `LegendItem`, `ChartTooltip` (+ `Row`, `Title`, `Note`) – building blocks for custom charts.

**Theme, hooks & a11y**
- `ThemeProvider`, `ThemeScript`, `ThemeToggle`, `useTheme()` – light / dark / system theme.
- `useMediaQuery`, `usePrefersReducedMotion`, `useContainerWidth`, `useSwipe`, `useUnsavedChanges` – utility hooks.
- `VisuallyHidden` – screen-reader-only content.

### Styling links

Links should not be wrapped in a `<button>`. Either render the Button as the link:

```tsx
import Link from "next/link";
import { Button } from "kaneki-components";

<Button as={Link} href="/expenses/new" variant="secondary">New expense</Button>
```

or, in a **server component** (the main bundle is `"use client"`), apply the classes directly:

```tsx
import Link from "next/link";
import { buttonClasses } from "kaneki-components/classes";

<Link href="/expenses/new" className={buttonClasses({ variant: "secondary", size: "sm" })}>
  New expense
</Link>
```

### `kaneki-components/classes`

A second entry without the `"use client"` banner and without React, safe in server components. It exports `buttonClasses({ variant, size, shape, fullWidth })`, `iconButtonClasses({ variant, size, shape })`, `badgeClasses({ variant })`, `cardClasses()`, `focusRing` and `cn`. Button, IconButton, Badge and Card use the same helpers, so the styles cannot drift. The helpers are also exported from the main entry.

---

## 📖 Component Examples

### 1. Collapsible Sidebar

```tsx
import { useState } from "react";
import {
  CollapsibleSidebar,
  SidebarNav,
  SidebarItem,
  SidebarSection,
  ThemeToggle,
} from "kaneki-components";
import { LayoutDashboard, CheckSquare, Settings, Sparkles } from "lucide-react";

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <CollapsibleSidebar
      icon={<Sparkles className="h-4 w-4" />}
      title="Kaneki Hub"
      description="Software Engineering Hub"
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      footer={({ collapsed }) => <ThemeToggle collapsed={collapsed} />}
    >
      {({ collapsed }) => (
        <SidebarSection title="Workspace" collapsed={collapsed}>
          <SidebarNav>
            <SidebarItem
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Dashboard"
              active
              collapsed={collapsed}
            />
            <SidebarItem
              icon={<CheckSquare className="h-4 w-4" />}
              label="Tasks"
              badge="5"
              collapsed={collapsed}
            />
          </SidebarNav>
        </SidebarSection>
      )}
    </CollapsibleSidebar>
  );
}
```

### 2. Buttons & Submit Buttons

```tsx
import { Button, SubmitButton } from "kaneki-components";
import { ArrowRight, Mail } from "lucide-react";

export function Actions() {
  return (
    <div className="flex gap-3">
      <Button variant="primary">Primary Action</Button>
      <Button variant="secondary" leftIcon={<Mail className="h-4 w-4" />}>
        Email
      </Button>
      <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
        Next
      </Button>
      <Button variant="danger">Delete</Button>
      <Button variant="primary" isLoading>
        Saving...
      </Button>
    </div>
  );
}
```

### 3. Action Modal (Prompt, Confirm, Alert)

```tsx
import { useState } from "react";
import { ActionModal, Button } from "kaneki-components";

export function ModalDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Prompt</Button>

      <ActionModal
        isOpen={isOpen}
        type="prompt"
        title="Create New Project"
        description="Enter the workspace project slug."
        inputPlaceholder="e.g. kaneki-mobile"
        confirmText="Create"
        onConfirm={(slug) => {
          console.log("Created project:", slug);
          setIsOpen(false);
        }}
        onCancel={() => setIsOpen(false)}
      />
    </>
  );
}
```

### 4. Data Table with Sort & Search

```tsx
import { DataTable } from "kaneki-components";

interface User {
  id: string;
  name: string;
  role: string;
  status: string;
}

const users: User[] = [
  { id: "1", name: "Minh", role: "Owner", status: "Active" },
  { id: "2", name: "Alice", role: "Developer", status: "Pending" },
];

export function UserList() {
  return (
    <DataTable<User>
      data={users}
      pageSize={10}
      searchPlaceholder="Filter users..."
      columns={[
        { key: "id", header: "ID", sortable: true },
        { key: "name", header: "Name", sortable: true },
        { key: "role", header: "Role", sortable: true },
        { key: "status", header: "Status" },
      ]}
    />
  );
}
```

---

## 🌐 Deploying the Demo to Vercel

The demo application is located in `demo/`.

A root `vercel.json` file is configured:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build:demo",
  "outputDirectory": "demo/dist",
  "framework": "vite"
}
```

### Deploy via Vercel CLI:
```bash
npx vercel
```
Or import this repository directly into your [Vercel Dashboard](https://vercel.com). Vercel will run `npm run build:demo` and deploy the demo static output from `demo/dist`.

---

## 🛡️ Package Hygiene (Preview Exclusion)

When consumers install this package:
- `package.json` specifies `"files": ["dist", "README.md"]`.
- `.npmignore` explicitly ignores `demo/`, `src/`, etc.
- As verified with `npm pack --dry-run`, only the compiled library in `dist/` is distributed. The demo application and its source code remain strictly inside the repository.

---

## 🛠️ Development Scripts

- `npm run build:lib`: Builds the component library to `dist/` with ESM, CJS, DTS, and CSS.
- `npm run build:demo`: Builds both library and demo page to `demo/dist/`.
- `npm run dev:demo`: Runs the interactive Vite preview server on `http://localhost:5173`.
- `npm run typecheck`: Runs TypeScript type checking across the library.

## 📄 License

MIT

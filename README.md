# kaneki-components

> Reusable UI component package and design system inherited from the Kaneki ecosystem, ensuring consistent UI/UX across all future frontend applications.

## ✨ Features

- **🎨 Unified Theming**: Built-in support for `light`, `dark`, and `system` themes with synchronized CSS variables.
- **📱 Collapsible Sidebar**: Responsive sidebar with pinned desktop mode, hover-overlay mode, and mobile drawer.
- **🔘 Versatile Buttons**: Full variant suite (`primary`, `secondary`, `outline`, `ghost`, `danger`, `warn`, `success`), sizes (`xs`, `sm`, `md`, `lg`), and built-in async loading states.
- **💬 Action Modal**: Ready-to-use `prompt`, `confirm`, and destructive alert modals with ESC dismiss and backdrop blur.
- **📊 Data Table**: Feature-complete table with sorting, instant search filtering, pagination, and empty states.
- **🧩 Base Primitives**: Cards, Badges, Text Inputs, Textarea, Select, Tabs, Skeleton, and Loading Spinners.
- **🚀 Vercel Deployable Demo**: Interactive preview page in `demo/` deployable with zero configuration to Vercel.
- **📦 Clean Package Distribution**: The published npm package only includes `dist/` — the preview app and demo source code are completely excluded.

---

## 📥 Installation

```bash
npm install kaneki-components
# or
pnpm add kaneki-components
# or
yarn add kaneki-components
```

### Peer Dependencies
Ensure `react` and `react-dom` (v18 or v19) are installed in your project.

---

## 🚀 Quick Start

### 1. Import Styles & ThemeProvider

In your application's root (e.g. Next.js `src/app/layout.tsx` or Vite `src/main.tsx`):

```tsx
import "kaneki-components/styles.css";
import { ThemeProvider } from "kaneki-components";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

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

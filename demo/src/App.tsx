import { useState } from "react";
import {
  ActionModal,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CollapsibleSidebar,
  DataTable,
  Input,
  LoadingBar,
  LoadingSpinner,
  Modal,
  Select,
  SidebarItem,
  SidebarNav,
  SidebarSection,
  Skeleton,
  SubmitButton,
  TabContent,
  TabList,
  Tabs,
  TabTrigger,
  Textarea,
  ThemeToggle,
  useTheme,
} from "../../src";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code,
  Copy,
  FolderGit2,
  HelpCircle,
  Info,
  Layers,
  LayoutDashboard,
  Mail,
  Menu,
  Palette,
  Plus,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Table as TableIcon,
  Trash2,
  User,
} from "lucide-react";

interface ProjectRecord {
  id: string;
  name: string;
  category: string;
  status: "Active" | "Draft" | "Archived" | "Pending";
  version: string;
  stars: number;
}

const SAMPLE_PROJECTS: ProjectRecord[] = [
  { id: "PRJ-01", name: "Kaneki Workspace", category: "Core App", status: "Active", version: "v2.4.0", stars: 142 },
  { id: "PRJ-02", name: "LMS Knowledge Graph", category: "AI & Learning", status: "Active", version: "v1.8.2", stars: 98 },
  { id: "PRJ-03", name: "Vercel Agent Deployer", category: "DevOps", status: "Active", version: "v1.2.0", stars: 76 },
  { id: "PRJ-04", name: "Note Synchronizer", category: "Storage", status: "Draft", version: "v0.9.1", stars: 34 },
  { id: "PRJ-05", name: "Audit Trail Tracker", category: "Security", status: "Active", version: "v1.0.5", stars: 52 },
  { id: "PRJ-06", name: "Finance Ledger", category: "Finance", status: "Pending", version: "v0.4.0", stars: 21 },
  { id: "PRJ-07", name: "MCP Gateway Client", category: "AI & Tools", status: "Active", version: "v2.1.0", stars: 119 },
  { id: "PRJ-08", name: "Legacy Wiki Extractor", category: "Migration", status: "Archived", version: "v0.1.2", stars: 12 },
  { id: "PRJ-09", name: "Vector Chunker Service", category: "AI & Learning", status: "Active", version: "v1.3.1", stars: 84 },
  { id: "PRJ-10", name: "Realtime WebSocket Hub", category: "Networking", status: "Draft", version: "v0.8.0", stars: 45 },
  { id: "PRJ-11", name: "Ollama Context Inspector", category: "AI Tools", status: "Active", version: "v1.1.4", stars: 63 },
];

export default function App() {
  const { theme, resolvedTheme } = useTheme();

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Button loading demo state
  const [buttonLoading, setButtonLoading] = useState(false);

  // Modal demo states
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDestructiveOpen, setIsDestructiveOpen] = useState(false);
  const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  // Notification / toast feedback
  const showFeedback = (msg: string) => {
    setModalFeedback(msg);
    setTimeout(() => setModalFeedback(null), 4000);
  };

  const triggerButtonLoading = () => {
    setButtonLoading(true);
    setTimeout(() => {
      setButtonLoading(false);
      showFeedback("Simulated operation completed successfully!");
    }, 1800);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      {/* Kaneki Base Sidebar */}
      <CollapsibleSidebar
        icon={<Sparkles className="h-4 w-4" />}
        title="Kaneki UI"
        description="Design System Package"
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
        footer={({ collapsed }) => (
          <div className="space-y-3">
            <ThemeToggle collapsed={collapsed} />
            {!collapsed && (
              <div className="flex items-center gap-2.5 px-1 py-0.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-semibold">
                  K
                </div>
                <div className="truncate text-xs">
                  <p className="font-medium text-fg">Kaneki Frontend</p>
                  <p className="text-[11px] text-muted">v0.1.0 (Ready)</p>
                </div>
              </div>
            )}
          </div>
        )}
      >
        {({ collapsed, closeMobile }) => (
          <div className="space-y-4">
            <SidebarSection title="Navigation" collapsed={collapsed}>
              <SidebarNav>
                <SidebarItem
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  label="Overview"
                  active={activeTab === "overview"}
                  collapsed={collapsed}
                  onClick={() => {
                    setActiveTab("overview");
                    closeMobile();
                  }}
                />
                <SidebarItem
                  icon={<Layers className="h-4 w-4" />}
                  label="Buttons & Badges"
                  badge="7 styles"
                  active={activeTab === "buttons"}
                  collapsed={collapsed}
                  onClick={() => {
                    setActiveTab("buttons");
                    closeMobile();
                  }}
                />
                <SidebarItem
                  icon={<AlertCircle className="h-4 w-4" />}
                  label="Modals & Dialogs"
                  active={activeTab === "modals"}
                  collapsed={collapsed}
                  onClick={() => {
                    setActiveTab("modals");
                    closeMobile();
                  }}
                />
                <SidebarItem
                  icon={<TableIcon className="h-4 w-4" />}
                  label="Data Table"
                  badge="Sorted"
                  active={activeTab === "table"}
                  collapsed={collapsed}
                  onClick={() => {
                    setActiveTab("table");
                    closeMobile();
                  }}
                />
                <SidebarItem
                  icon={<Code className="h-4 w-4" />}
                  label="Form Inputs"
                  active={activeTab === "inputs"}
                  collapsed={collapsed}
                  onClick={() => {
                    setActiveTab("inputs");
                    closeMobile();
                  }}
                />
                <SidebarItem
                  icon={<Palette className="h-4 w-4" />}
                  label="Theme & Tokens"
                  active={activeTab === "tokens"}
                  collapsed={collapsed}
                  onClick={() => {
                    setActiveTab("tokens");
                    closeMobile();
                  }}
                />
              </SidebarNav>
            </SidebarSection>

            <SidebarSection title="Documentation" collapsed={collapsed}>
              <SidebarNav>
                <SidebarItem
                  icon={<BookOpen className="h-4 w-4" />}
                  label="Installation"
                  active={activeTab === "install"}
                  collapsed={collapsed}
                  onClick={() => {
                    setActiveTab("install");
                    closeMobile();
                  }}
                />
              </SidebarNav>
            </SidebarSection>
          </div>
        )}
      </CollapsibleSidebar>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-muted hover:bg-surface-subtle hover:text-fg md:hidden cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-fg tracking-tight">
                kaneki-components
              </span>
              <Badge variant="accent">v0.1.0</Badge>
              <Badge variant="ok">Vercel Ready</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle variant="icon" />
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex"
            >
              <Button variant="outline" size="xs" leftIcon={<FolderGit2 className="h-3.5 w-3.5" />}>
                Source Clean
              </Button>
            </a>
          </div>
        </header>

        {/* Global Loading Bar Demo */}
        {buttonLoading && <LoadingBar />}

        {/* Floating Notification */}
        {modalFeedback && (
          <div className="fixed top-16 right-6 z-50 animate-bounce">
            <div className="flex items-center gap-2 rounded-xl border border-ok/30 bg-ok-soft px-4 py-2.5 text-xs font-semibold text-ok shadow-lg">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{modalFeedback}</span>
            </div>
          </div>
        )}

        {/* Body Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-8">
            {/* OVERVIEW SECTION */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-fg">
                    Kaneki UI Component Package
                  </h1>
                  <p className="mt-1 text-sm text-muted">
                    Unified design system and base components extracted and modernized from Kaneki. Designed for future frontend apps with 100% consistent UI/UX.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Base Theme</CardTitle>
                        <Palette className="h-4 w-4 text-accent" />
                      </div>
                      <CardDescription>Light, Dark & System</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted">
                        CSS variables tokenized for instant automatic dark-mode reactivity.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Sidebar</CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-accent" />
                      </div>
                      <CardDescription>Collapsible & Responsive</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted">
                        Desktop pinned or hover overlay, plus full-featured mobile drawer.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Action Modal</CardTitle>
                        <AlertCircle className="h-4 w-4 text-accent" />
                      </div>
                      <CardDescription>Prompt, Confirm & Alert</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted">
                        Built-in destructive styling, loading states, and keyboard escape dismiss.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Data Table</CardTitle>
                        <TableIcon className="h-4 w-4 text-accent" />
                      </div>
                      <CardDescription>Search, Sort & Paginate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted">
                        Client-side instant sorting, search debounce, and empty states.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Interactive Highlights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Demo & Status</CardTitle>
                    <CardDescription>
                      This preview application tests all components in live conditions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        variant="primary"
                        onClick={() => setIsPromptOpen(true)}
                        leftIcon={<Plus className="h-4 w-4" />}
                      >
                        Try Action Modal
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={triggerButtonLoading}
                        isLoading={buttonLoading}
                      >
                        Trigger Async Loading Bar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("table")}
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        Explore Table
                      </Button>
                    </div>

                    <div className="rounded-xl border border-border bg-surface-subtle p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          <span className="text-xs font-medium text-fg">
                            Current active theme:{" "}
                            <span className="text-accent uppercase font-bold">
                              {theme} ({resolvedTheme})
                            </span>
                          </span>
                        </div>
                        <ThemeToggle variant="icon" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* BUTTONS & BADGES SECTION */}
            {activeTab === "buttons" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-fg">Buttons & Badges</h2>
                  <p className="text-xs text-muted">
                    Interactive buttons and badges with built-in accessibility, semantic colors, and loading states.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Button Variants</CardTitle>
                    <CardDescription>Semantic button styles for every action context</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="warn">Warning</Button>
                    <Button variant="success">Success</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Button Sizes</CardTitle>
                    <CardDescription>Standardized sizing scale</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-3">
                    <Button size="xs">Extra Small (xs)</Button>
                    <Button size="sm">Small (sm)</Button>
                    <Button size="md">Medium (md)</Button>
                    <Button size="lg">Large (lg)</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Loading & Icons</CardTitle>
                    <CardDescription>Simulate asynchronous operations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        variant="primary"
                        isLoading={buttonLoading}
                        onClick={triggerButtonLoading}
                      >
                        Click to Load
                      </Button>
                      <Button
                        variant="secondary"
                        leftIcon={<Mail className="h-4 w-4" />}
                      >
                        With Left Icon
                      </Button>
                      <Button
                        variant="outline"
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        With Right Icon
                      </Button>
                      <Button variant="primary" disabled>
                        Disabled
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Badges</CardTitle>
                    <CardDescription>Status indicators and tags</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2.5">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="accent" icon={<Sparkles className="h-3 w-3" />}>
                      Accent Active
                    </Badge>
                    <Badge variant="ok" icon={<CheckCircle2 className="h-3 w-3" />}>
                      Success OK
                    </Badge>
                    <Badge variant="warn" icon={<AlertTriangle className="h-3 w-3" />}>
                      Needs Review
                    </Badge>
                    <Badge variant="danger" icon={<Trash2 className="h-3 w-3" />}>
                      Failed / Error
                    </Badge>
                    <Badge variant="subtle">Subtle Outline</Badge>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* MODALS SECTION */}
            {activeTab === "modals" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-fg">Modals & Dialogs</h2>
                  <p className="text-xs text-muted">
                    Dialog primitives and ActionModals with prompt, confirm, and destructive actions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Prompt Action Modal</CardTitle>
                      <CardDescription>
                        Collect single input with validation before confirming
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="primary"
                        onClick={() => setIsPromptOpen(true)}
                        leftIcon={<Plus className="h-4 w-4" />}
                      >
                        Open Prompt Modal
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Confirmation Modal</CardTitle>
                      <CardDescription>
                        Standard confirmation for important user actions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="secondary"
                        onClick={() => setIsConfirmOpen(true)}
                        leftIcon={<Info className="h-4 w-4" />}
                      >
                        Open Confirm Modal
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Destructive Action Modal</CardTitle>
                      <CardDescription>
                        Red alert badge with danger confirmation button
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="danger"
                        onClick={() => setIsDestructiveOpen(true)}
                        leftIcon={<Trash2 className="h-4 w-4" />}
                      >
                        Open Destructive Modal
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Dialog (Base Modal)</CardTitle>
                      <CardDescription>
                        Unconstrained dialog with custom body and footer
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        onClick={() => setIsGenericModalOpen(true)}
                        leftIcon={<Layers className="h-4 w-4" />}
                      >
                        Open Base Modal
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* DATA TABLE SECTION */}
            {activeTab === "table" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-fg">Data Table</h2>
                  <p className="text-xs text-muted">
                    Responsive, sortable data table with instant search filter and pagination.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Project Registry</CardTitle>
                    <CardDescription>
                      Click table headers to sort. Type in the search box to filter across all columns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable<ProjectRecord>
                      data={SAMPLE_PROJECTS}
                      pageSize={5}
                      searchPlaceholder="Search project name, category, or status..."
                      onRowClick={(row) => showFeedback(`Selected row: ${row.name} (${row.id})`)}
                      columns={[
                        {
                          key: "id",
                          header: "Project ID",
                          sortable: true,
                          width: "120px",
                          render: (row) => (
                            <span className="font-mono text-xs font-semibold text-accent">
                              {row.id}
                            </span>
                          ),
                        },
                        {
                          key: "name",
                          header: "Project Name",
                          sortable: true,
                          render: (row) => (
                            <div>
                              <div className="font-medium text-fg">{row.name}</div>
                              <div className="text-[11px] text-muted">{row.category}</div>
                            </div>
                          ),
                        },
                        {
                          key: "status",
                          header: "Status",
                          sortable: true,
                          render: (row) => {
                            const variantMap = {
                              Active: "ok",
                              Draft: "subtle",
                              Archived: "default",
                              Pending: "warn",
                            } as const;
                            return (
                              <Badge variant={variantMap[row.status]}>
                                {row.status}
                              </Badge>
                            );
                          },
                        },
                        {
                          key: "version",
                          header: "Version",
                          sortable: true,
                          render: (row) => (
                            <span className="font-mono text-xs text-muted">
                              {row.version}
                            </span>
                          ),
                        },
                        {
                          key: "stars",
                          header: "Rating Stars",
                          sortable: true,
                          align: "right",
                          render: (row) => (
                            <span className="font-semibold text-xs text-fg">
                              ★ {row.stars}
                            </span>
                          ),
                        },
                      ]}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* FORM INPUTS SECTION */}
            {activeTab === "inputs" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-fg">Form Inputs</h2>
                  <p className="text-xs text-muted">
                    Accessible form components with label, helper text, addons, and error states.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Text Inputs</CardTitle>
                      <CardDescription>Standard and adorned inputs</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input
                        label="Project Name"
                        placeholder="e.g. kaneki-dashboard"
                        helperText="Use alphanumeric characters and hyphens"
                      />

                      <Input
                        label="Admin Email"
                        type="email"
                        placeholder="admin@kaneki.dev"
                        leftAddon={<Mail className="h-4 w-4" />}
                      />

                      <Input
                        label="API Key"
                        defaultValue="invalid_key_xyz"
                        error="Invalid API key format. Must begin with knk_"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Select & Textarea</CardTitle>
                      <CardDescription>Multi-line and dropdown choices</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Select label="Deployment Environment">
                        <option value="production">Production (Vercel Edge)</option>
                        <option value="staging">Staging Preview</option>
                        <option value="development">Local Development</option>
                      </Select>

                      <Textarea
                        label="Description & Notes"
                        placeholder="Write details about the project requirements..."
                        rows={4}
                        helperText="Markdown syntax is supported"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* THEME & TOKENS SECTION */}
            {activeTab === "tokens" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-fg">Theme & Tokens</h2>
                  <p className="text-xs text-muted">
                    CSS Variables and design tokens defined in kaneki-components/styles.css.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Theme Switcher</CardTitle>
                    <CardDescription>Switch between Light, Dark, or System mode</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="max-w-xs">
                      <ThemeToggle variant="segmented" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Design Token Palette</CardTitle>
                    <CardDescription>Live preview of CSS variables in the active theme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {[
                        { name: "--bg", label: "Background", class: "bg-bg text-fg border border-border" },
                        { name: "--surface", label: "Surface", class: "bg-surface text-fg border border-border" },
                        { name: "--surface-subtle", label: "Subtle Surface", class: "bg-surface-subtle text-fg border border-border" },
                        { name: "--accent", label: "Accent", class: "bg-accent text-white" },
                        { name: "--accent-soft", label: "Accent Soft", class: "bg-accent-soft text-accent border border-accent/20" },
                        { name: "--ok", label: "Success / OK", class: "bg-ok text-white" },
                        { name: "--warn", label: "Warning", class: "bg-warn text-white" },
                        { name: "--danger", label: "Danger", class: "bg-danger text-white" },
                      ].map((token) => (
                        <div
                          key={token.name}
                          className={`rounded-xl p-3.5 text-xs flex flex-col justify-between h-20 ${token.class}`}
                        >
                          <span className="font-semibold">{token.label}</span>
                          <span className="font-mono text-[10px] opacity-80">{token.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* INSTALLATION SECTION */}
            {activeTab === "install" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-fg">Installation & Usage</h2>
                  <p className="text-xs text-muted">
                    How to install and import kaneki-components in future frontend projects.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>1. Install the Package</CardTitle>
                    <CardDescription>
                      Install via npm, pnpm, or bun. Note that the published package excludes the demo directory and preview code!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="rounded-xl border border-border bg-surface-subtle p-3.5 text-xs font-mono text-fg overflow-x-auto">
                      npm install kaneki-components
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>2. Import Styles & ThemeProvider</CardTitle>
                    <CardDescription>
                      Wrap your root layout (Next.js layout.tsx or Vite App.tsx)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="rounded-xl border border-border bg-surface-subtle p-3.5 text-xs font-mono text-fg overflow-x-auto">
{`import "kaneki-components/styles.css";
import { ThemeProvider } from "kaneki-components";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      {children}
    </ThemeProvider>
  );
}`}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>3. Use Any Base Component</CardTitle>
                    <CardDescription>
                      Import Button, CollapsibleSidebar, ActionModal, DataTable anywhere
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="rounded-xl border border-border bg-surface-subtle p-3.5 text-xs font-mono text-fg overflow-x-auto">
{`import {
  Button,
  CollapsibleSidebar,
  ActionModal,
  DataTable,
  ThemeToggle,
} from "kaneki-components";`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ACTION MODAL INSTANCES */}
      <ActionModal
        isOpen={isPromptOpen}
        type="prompt"
        title="Create New Project"
        description="Enter the name of your frontend project to initialize."
        inputPlaceholder="e.g. kaneki-analytics"
        confirmText="Create Project"
        onConfirm={(name) => {
          setIsPromptOpen(false);
          showFeedback(`Created new project: "${name}"`);
        }}
        onCancel={() => setIsPromptOpen(false)}
      />

      <ActionModal
        isOpen={isConfirmOpen}
        type="confirm"
        title="Deploy to Vercel"
        description="Are you sure you want to promote the latest build to production on Vercel?"
        confirmText="Confirm Deploy"
        onConfirm={() => {
          setIsConfirmOpen(false);
          showFeedback("Deployment to Vercel triggered successfully!");
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />

      <ActionModal
        isOpen={isDestructiveOpen}
        type="confirm"
        isDestructive
        title="Delete Project Workspace?"
        description="This action cannot be undone. All database records and cache files will be permanently deleted."
        confirmText="Yes, Delete Permanently"
        onConfirm={() => {
          setIsDestructiveOpen(false);
          showFeedback("Project deleted.");
        }}
        onCancel={() => setIsDestructiveOpen(false)}
      />

      <Modal
        isOpen={isGenericModalOpen}
        onClose={() => setIsGenericModalOpen(false)}
        title="Base Modal Dialog"
        description="Flexible modal dialog with custom layout and slots."
        footer={
          <Button variant="primary" onClick={() => setIsGenericModalOpen(false)}>
            Close Dialog
          </Button>
        }
      >
        <div className="space-y-3 py-2">
          <p className="text-sm text-fg">
            This is a clean custom modal supporting any React elements inside.
          </p>
          <div className="rounded-lg border border-border bg-surface-subtle p-3 text-xs text-muted">
            You can dismiss by pressing ESC, clicking the backdrop, or clicking the close button.
          </div>
        </div>
      </Modal>
    </div>
  );
}

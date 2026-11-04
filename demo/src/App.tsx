import { useState } from "react";
import {
  ActionModal,
  Avatar,
  Badge,
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CollapsibleSidebar,
  DataTable,
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
  Input,
  LoadingBar,
  LoadingSpinner,
  Modal,
  Select,
  SidebarItem,
  SidebarNav,
  SidebarSection,
  Switch,
  TabContent,
  TabList,
  Tabs,
  TabTrigger,
  Textarea,
  ThemeToggle,
  Tooltip,
  useTheme,
  useToast,
} from "../../src";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Code,
  Copy,
  DollarSign,
  Download,
  ExternalLink,
  Eye,
  Filter,
  FolderGit2,
  Layers,
  LayoutDashboard,
  Mail,
  Menu,
  MoreVertical,
  Palette,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  Table as TableIcon,
  Trash2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { NewComponentsShowcase } from "./showcase/NewComponents";

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
  const toast = useToast();

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Contrast comparison state
  const [legacyContrast, setLegacyContrast] = useState(false);

  // Button Playground States
  const [pgVariant, setPgVariant] = useState<ButtonVariant>("primary");
  const [pgSize, setPgSize] = useState<ButtonSize>("md");
  const [pgLoading, setPgLoading] = useState(false);
  const [pgDisabled, setPgDisabled] = useState(false);
  const [pgWithIcon, setPgWithIcon] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modal demo states
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDestructiveOpen, setIsDestructiveOpen] = useState(false);
  const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);

  // Settings switch states
  const [switch1, setSwitch1] = useState(true);
  const [switch2, setSwitch2] = useState(false);
  const [switch3, setSwitch3] = useState(true);

  // Accent Color Customizer
  const [accentPreset, setAccentPreset] = useState("indigo");

  const applyAccent = (name: string, light: string, dark: string) => {
    setAccentPreset(name);
    document.documentElement.style.setProperty("--accent", resolvedTheme === "dark" ? dark : light);
    toast.info("Accent Updated", `Active color preset: ${name}`);
  };

  const copySnippet = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    toast.success("Code Copied", "Snippet copied to your clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const playgroundCode = `<Button variant="${pgVariant}" size="${pgSize}"${
    pgLoading ? " isLoading" : ""
  }${pgDisabled ? " disabled" : ""}${
    pgWithIcon ? ' leftIcon={<Sparkles className="h-4 w-4" />}' : ""
  }>
  Action Label
</Button>`;

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
            <div className={`flex items-center gap-2.5 rounded-xl border border-border bg-surface-subtle p-2 ${collapsed ? "justify-center" : ""}`}>
              <Avatar name="Minh Nguyen" size="sm" status="online" />
              {!collapsed && (
                <div className="truncate text-xs flex-1">
                  <p className="font-semibold text-fg">Minh Nguyen</p>
                  <p className="text-[11px] text-muted">Workspace Admin</p>
                </div>
              )}
            </div>
          </div>
        )}
      >
        {({ collapsed, closeMobile }) => (
          <div className="space-y-4">
            <SidebarSection title="Showcase" collapsed={collapsed}>
              <SidebarNav>
                <SidebarItem
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  label="Dashboard Preview"
                  badge="New"
                  active={activeTab === "dashboard"}
                  collapsed={collapsed}
                  onClick={() => {
                    setActiveTab("dashboard");
                    closeMobile();
                  }}
                />
                <SidebarItem
                  icon={<Sliders className="h-4 w-4" />}
                  label="Contrast & Playground"
                  badge="Compare"
                  active={activeTab === "playground"}
                  collapsed={collapsed}
                  onClick={() => {
                    setActiveTab("playground");
                    closeMobile();
                  }}
                />
                <SidebarItem
                  icon={<TableIcon className="h-4 w-4" />}
                  label="Enhanced Data Table"
                  badge="Batch"
                  active={activeTab === "table"}
                  collapsed={collapsed}
                  onClick={() => {
                    setActiveTab("table");
                    closeMobile();
                  }}
                />
                <SidebarItem
                  icon={<Layers className="h-4 w-4" />}
                  label="Buttons & Badges"
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
                  icon={<Code className="h-4 w-4" />}
                  label="New Base Components"
                  badge="Toast/Switch"
                  active={activeTab === "components"}
                  collapsed={collapsed}
                  onClick={() => {
                    setActiveTab("components");
                    closeMobile();
                  }}
                />
                <SidebarItem
                  icon={<Sparkles className="h-4 w-4" />}
                  label="New Components"
                  badge="New"
                  active={activeTab === "showcase"}
                  collapsed={collapsed}
                  onClick={() => {
                    setActiveTab("showcase");
                    closeMobile();
                  }}
                />
                <SidebarItem
                  icon={<Palette className="h-4 w-4" />}
                  label="Tokens & Themes"
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
                  label="Installation Guide"
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
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
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
              <Badge variant="ok">Live Demo</Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Contrast Toggle in Header */}
            <div className="hidden lg:flex items-center gap-2 border-r border-border pr-3">
              <span className="text-xs font-medium text-muted">Legacy Contrast:</span>
              <Switch
                checked={legacyContrast}
                onCheckedChange={(val) => {
                  setLegacyContrast(val);
                  if (val) toast.warn("Legacy Contrast Active", "Showing low-contrast white text on pastel buttons.");
                  else toast.success("Accessible Contrast Active", "Showing 10:1+ WCAG AAA dark ink tokens.");
                }}
              />
            </div>

            <ThemeToggle variant="icon" />

            <DropdownMenu
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface-subtle px-2.5 py-1 text-xs font-medium text-fg hover:bg-surface cursor-pointer"
                >
                  <Palette className="h-3.5 w-3.5 text-accent" />
                  <span className="capitalize">{accentPreset}</span>
                </button>
              }
            >
              <DropdownItem onClick={() => applyAccent("indigo", "#3f51d8", "#8d9bff")}>
                Kaneki Indigo
              </DropdownItem>
              <DropdownItem onClick={() => applyAccent("violet", "#7c3aed", "#a78bfa")}>
                Cyber Violet
              </DropdownItem>
              <DropdownItem onClick={() => applyAccent("emerald", "#059669", "#34d399")}>
                Emerald Mint
              </DropdownItem>
              <DropdownItem onClick={() => applyAccent("coral", "#e11d48", "#fb7185")}>
                Sunset Coral
              </DropdownItem>
            </DropdownMenu>
          </div>
        </header>

        {/* Body Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl space-y-8">

            {/* DASHBOARD PREVIEW TAB */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-fg">
                      Workspace Analytics Overview
                    </h1>
                    <p className="mt-1 text-xs text-muted">
                      Realistic template page demonstrating Kaneki components unified in a production dashboard.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                      onClick={() => toast.info("Syncing Metrics", "Retrieved latest workspace telemetry")}
                    >
                      Sync
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="h-3.5 w-3.5" />}
                      legacyContrast={legacyContrast}
                      onClick={() => setIsPromptOpen(true)}
                    >
                      New Deployment
                    </Button>
                  </div>
                </div>

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted">Monthly Revenue</span>
                        <div className="rounded-lg bg-accent-soft p-1.5 text-accent">
                          <DollarSign className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-fg">$48,290</div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1.5 text-xs text-ok font-medium">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>+14.8% from last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted">Active Users</span>
                        <div className="rounded-lg bg-ok-soft p-1.5 text-ok">
                          <Users className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-fg">2,845</div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1.5 text-xs text-ok font-medium">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>+9.2% new signups</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted">Edge Deployments</span>
                        <div className="rounded-lg bg-warn-soft p-1.5 text-warn">
                          <Rocket className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-fg">142</div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
                        <Activity className="h-3.5 w-3.5 text-accent" />
                        <span>99.98% uptime SLA</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted">Security Audits</span>
                        <div className="rounded-lg bg-danger-soft p-1.5 text-danger">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-fg">0 Alerts</div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1.5 text-xs text-ok font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>All guardrails passing</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Split Section: Mini Table & Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Recent Project Services</CardTitle>
                            <CardDescription>Live deployment status across edge clusters</CardDescription>
                          </div>
                          <Button variant="outline" size="xs" onClick={() => setActiveTab("table")}>
                            View Full Table
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="divide-y divide-border">
                          {SAMPLE_PROJECTS.slice(0, 4).map((p) => (
                            <div key={p.id} className="flex items-center justify-between py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-subtle font-mono text-xs font-bold text-accent">
                                  {p.id.split("-")[1]}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-fg">{p.name}</p>
                                  <p className="text-[11px] text-muted">{p.category} • {p.version}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={p.status === "Active" ? "ok" : "warn"}>{p.status}</Badge>
                                <DropdownMenu
                                  trigger={
                                    <button type="button" className="p-1 text-muted hover:text-fg rounded cursor-pointer">
                                      <MoreVertical className="h-4 w-4" />
                                    </button>
                                  }
                                >
                                  <DropdownItem onClick={() => toast.info("Opening", p.name)}>View Logs</DropdownItem>
                                  <DropdownItem onClick={() => toast.success("Restarted", p.name)}>Redeploy</DropdownItem>
                                  <DropdownSeparator />
                                  <DropdownItem destructive onClick={() => toast.error("Stopped", p.name)}>Stop Service</DropdownItem>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Team Activity Feed</CardTitle>
                        <CardDescription>Real-time updates from workspace collaborators</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: "Minh Nguyen", action: "pushed a commit to", target: "kaneki-components", time: "5m ago", status: "online" as const },
                          { name: "Sarah Connor", action: "deployed preview on", target: "vercel-edge", time: "18m ago", status: "away" as const },
                          { name: "Alex Rivera", action: "approved security audit for", target: "PR #42", time: "1h ago", status: "offline" as const },
                        ].map((act, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <Avatar name={act.name} size="sm" status={act.status} />
                            <div className="text-xs">
                              <p className="text-fg leading-snug">
                                <span className="font-semibold">{act.name}</span> {act.action}{" "}
                                <span className="font-medium text-accent">{act.target}</span>
                              </p>
                              <p className="text-[10px] text-muted mt-0.5">{act.time}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="ghost"
                          size="xs"
                          fullWidth
                          onClick={() => toast.info("Activity", "All logs up to date")}
                        >
                          View Audit Trail
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* CONTRAST COMPARISON & INTERACTIVE PLAYGROUND TAB */}
            {activeTab === "playground" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-fg">Contrast Comparison & Props Playground</h2>
                  <p className="text-xs text-muted">
                    Test the contrast difference between old hardcoded white text and new high-contrast semantic tokens.
                  </p>
                </div>

                {/* Direct Comparison Banner */}
                <Card className="border-accent/40 bg-accent-soft/20">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-accent">Direct Contrast Comparison</CardTitle>
                        <CardDescription>
                          Switch below to see how white text on bright pastel backgrounds washed out vs the new accessible WCAG AAA tokens.
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3 bg-surface p-2 rounded-xl border border-border">
                        <span className="text-xs font-semibold text-fg">
                          Mode: {legacyContrast ? "❌ Legacy White Text" : "✅ Accessible Contrast (10:1)"}
                        </span>
                        <Switch
                          checked={legacyContrast}
                          onCheckedChange={setLegacyContrast}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Button variant="primary" legacyContrast={legacyContrast}>
                        Primary Action
                      </Button>
                      <Button variant="danger" legacyContrast={legacyContrast}>
                        Danger Action
                      </Button>
                      <Button variant="warn" legacyContrast={legacyContrast}>
                        Warning Action
                      </Button>
                      <Button variant="success" legacyContrast={legacyContrast}>
                        Success Action
                      </Button>
                    </div>

                    <div className="rounded-xl border border-border bg-surface p-4 text-xs space-y-2">
                      <p className="font-semibold text-fg">Why this works:</p>
                      <p className="text-muted leading-relaxed">
                        When <code className="text-accent font-mono font-bold">legacyContrast = false</code>, dark mode buttons automatically use{" "}
                        <code className="text-accent font-mono">--accent-fg: #0d0f1c</code> and <code className="text-accent font-mono">--warn-fg: #1c1401</code>, producing razor-sharp contrast against pastel fills. In light mode, buttons retain crisp white text against deep saturated tones.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Props Inspector */}
                <Card>
                  <CardHeader>
                    <CardTitle>Interactive Component Props Playground</CardTitle>
                    <CardDescription>Customize button properties and copy the ready-to-use JSX snippet</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Controls Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-border bg-surface-subtle">
                      <div>
                        <label className="text-xs font-semibold text-fg block mb-1">Variant</label>
                        <Select
                          value={pgVariant}
                          onChange={(e) => setPgVariant(e.target.value as ButtonVariant)}
                        >
                          <option value="primary">primary</option>
                          <option value="secondary">secondary</option>
                          <option value="outline">outline</option>
                          <option value="ghost">ghost</option>
                          <option value="danger">danger</option>
                          <option value="warn">warn</option>
                          <option value="success">success</option>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-fg block mb-1">Size</label>
                        <Select
                          value={pgSize}
                          onChange={(e) => setPgSize(e.target.value as ButtonSize)}
                        >
                          <option value="xs">xs (Extra Small)</option>
                          <option value="sm">sm (Small)</option>
                          <option value="md">md (Medium)</option>
                          <option value="lg">lg (Large)</option>
                        </Select>
                      </div>

                      <div className="flex flex-col justify-end space-y-2">
                        <Switch
                          label="Loading State"
                          checked={pgLoading}
                          onCheckedChange={setPgLoading}
                        />
                        <Switch
                          label="Disabled State"
                          checked={pgDisabled}
                          onCheckedChange={setPgDisabled}
                        />
                      </div>

                      <div className="flex flex-col justify-end space-y-2">
                        <Switch
                          label="Left Icon"
                          checked={pgWithIcon}
                          onCheckedChange={setPgWithIcon}
                        />
                      </div>
                    </div>

                    {/* Preview Box */}
                    <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-border bg-surface">
                      <Button
                        variant={pgVariant}
                        size={pgSize}
                        isLoading={pgLoading}
                        disabled={pgDisabled}
                        leftIcon={pgWithIcon ? <Sparkles className="h-4 w-4" /> : undefined}
                        legacyContrast={legacyContrast}
                        onClick={() => toast.success("Button Clicked", `Triggered ${pgVariant} variant`)}
                      >
                        Action Label
                      </Button>
                    </div>

                    {/* Copy Code Box */}
                    <div className="relative">
                      <pre className="rounded-xl border border-border bg-surface-subtle p-4 text-xs font-mono text-fg overflow-x-auto">
                        {playgroundCode}
                      </pre>
                      <button
                        type="button"
                        onClick={() => copySnippet(playgroundCode)}
                        className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-fg hover:border-accent cursor-pointer transition-colors"
                      >
                        {copiedCode ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedCode ? "Copied" : "Copy JSX"}</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ENHANCED DATA TABLE TAB */}
            {activeTab === "table" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-fg">Enhanced Data Table</h2>
                  <p className="text-xs text-muted">
                    Featuring status filter chips, multi-row checkbox selection, batch action bar, and row action dropdowns.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Project Registry</CardTitle>
                    <CardDescription>
                      Select checkboxes to test the batch action bar. Click filter chips to filter by category.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable<ProjectRecord>
                      data={SAMPLE_PROJECTS}
                      pageSize={5}
                      selectable
                      filterKey="status"
                      filterOptions={[
                        { label: "Active", value: "Active", count: 6 },
                        { label: "Draft", value: "Draft", count: 2 },
                        { label: "Pending", value: "Pending", count: 1 },
                        { label: "Archived", value: "Archived", count: 2 },
                      ]}
                      searchPlaceholder="Search project name, category..."
                      onSelectionChange={(selected) => {
                        if (selected.length > 0) {
                          toast.info("Selection Changed", `${selected.length} items highlighted`);
                        }
                      }}
                      onRowClick={(row) => toast.info("Project Selected", `${row.name} (${row.id})`)}
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
                        {
                          key: "actions",
                          header: "",
                          align: "right",
                          render: (row) => (
                            <div onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu
                                trigger={
                                  <button
                                    type="button"
                                    className="p-1 rounded text-muted hover:text-fg hover:bg-surface-subtle cursor-pointer"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                }
                              >
                                <DropdownItem onClick={() => toast.success("Project Opened", row.name)}>
                                  Open Workspace
                                </DropdownItem>
                                <DropdownItem onClick={() => toast.info("Settings", row.id)}>
                                  Edit Configuration
                                </DropdownItem>
                                <DropdownSeparator />
                                <DropdownItem destructive onClick={() => toast.error("Archived", row.name)}>
                                  Archive Project
                                </DropdownItem>
                              </DropdownMenu>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* NEW BASE COMPONENTS TAB */}
            {activeTab === "showcase" && <NewComponentsShowcase />}

            {activeTab === "components" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-fg">New Base UI Components</h2>
                  <p className="text-xs text-muted">
                    Components added to expand the design system: Toasts, Switches, Avatars, Tooltips, and Dropdowns.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Toast Notifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Toast Notifications</CardTitle>
                      <CardDescription>Trigger floating alert toasts with auto-dismiss</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2.5">
                      <Button
                        variant="success"
                        size="sm"
                        legacyContrast={legacyContrast}
                        onClick={() => toast.success("Deployment Succeeded", "Commit 3fa8b deployed to Vercel Edge")}
                      >
                        Success Toast
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        legacyContrast={legacyContrast}
                        onClick={() => toast.error("Build Failed", "SyntaxError: Unexpected token in line 42")}
                      >
                        Error Toast
                      </Button>
                      <Button
                        variant="warn"
                        size="sm"
                        legacyContrast={legacyContrast}
                        onClick={() => toast.warn("Quota Warning", "OpenRouter tokens at 85% capacity")}
                      >
                        Warning Toast
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info("Sync Complete", "12 notes synced with Neon DB")}
                      >
                        Info Toast
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Toggle Switches */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Toggle Switches</CardTitle>
                      <CardDescription>Accessible switches for preferences & settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3.5">
                      <Switch
                        label="Enable Automatic Git Push"
                        description="Automatically push changes upon build success"
                        checked={switch1}
                        onCheckedChange={setSwitch1}
                      />
                      <Switch
                        label="Dark Mode Overrides"
                        description="Force dark theme regardless of OS preferences"
                        checked={switch2}
                        onCheckedChange={setSwitch2}
                      />
                      <Switch
                        label="Telemetry & Crash Reports"
                        description="Send anonymous stack traces to Kaneki servers"
                        checked={switch3}
                        onCheckedChange={setSwitch3}
                      />
                    </CardContent>
                  </Card>

                  {/* Avatars */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Avatars with Status Indicators</CardTitle>
                      <CardDescription>Initials fallback with online, away, and busy dots</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-4">
                      <Tooltip content="Minh Nguyen (Online)" side="top">
                        <Avatar name="Minh Nguyen" size="lg" status="online" />
                      </Tooltip>
                      <Tooltip content="Sarah Connor (Away)" side="top">
                        <Avatar name="Sarah Connor" size="md" status="away" />
                      </Tooltip>
                      <Tooltip content="Alex Rivera (Busy)" side="top">
                        <Avatar name="Alex Rivera" size="sm" status="busy" />
                      </Tooltip>
                      <Tooltip content="Dev Bot (Offline)" side="top">
                        <Avatar name="Bot Agent" size="xs" status="offline" />
                      </Tooltip>
                    </CardContent>
                  </Card>

                  {/* Dropdown Menu */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dropdown Menus</CardTitle>
                      <CardDescription>Click outside and ESC dismiss menus</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                      <DropdownMenu
                        trigger={
                          <Button variant="secondary" size="sm" rightIcon={<MoreVertical className="h-3.5 w-3.5" />}>
                            Options Menu
                          </Button>
                        }
                      >
                        <DropdownItem onClick={() => toast.info("Action", "Profile selected")}>
                          View Profile
                        </DropdownItem>
                        <DropdownItem onClick={() => toast.info("Action", "Settings opened")}>
                          Account Settings
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem destructive onClick={() => toast.error("Logout", "Logged out")}>
                          Sign Out
                        </DropdownItem>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* BUTTONS & BADGES TAB */}
            {activeTab === "buttons" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-fg">Buttons & Badges Suite</h2>
                  <p className="text-xs text-muted">
                    All variant styles rendered with accessible contrast tokens.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Button Variants</CardTitle>
                    <CardDescription>Semantic button styles for every action context</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button variant="primary" legacyContrast={legacyContrast}>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger" legacyContrast={legacyContrast}>Danger</Button>
                    <Button variant="warn" legacyContrast={legacyContrast}>Warning</Button>
                    <Button variant="success" legacyContrast={legacyContrast}>Success</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Button Sizes</CardTitle>
                    <CardDescription>Standardized sizing scale</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-3">
                    <Button size="xs" legacyContrast={legacyContrast}>Extra Small (xs)</Button>
                    <Button size="sm" legacyContrast={legacyContrast}>Small (sm)</Button>
                    <Button size="md" legacyContrast={legacyContrast}>Medium (md)</Button>
                    <Button size="lg" legacyContrast={legacyContrast}>Large (lg)</Button>
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

            {/* MODALS TAB */}
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
                      <CardDescription>Collect single input with validation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="primary"
                        onClick={() => setIsPromptOpen(true)}
                        leftIcon={<Plus className="h-4 w-4" />}
                        legacyContrast={legacyContrast}
                      >
                        Open Prompt Modal
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Confirmation Modal</CardTitle>
                      <CardDescription>Standard confirmation dialog</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="secondary"
                        onClick={() => setIsConfirmOpen(true)}
                        leftIcon={<AlertCircle className="h-4 w-4" />}
                      >
                        Open Confirm Modal
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Destructive Action Modal</CardTitle>
                      <CardDescription>Red alert badge with danger button</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="danger"
                        onClick={() => setIsDestructiveOpen(true)}
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        legacyContrast={legacyContrast}
                      >
                        Open Destructive Modal
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Dialog (Base Modal)</CardTitle>
                      <CardDescription>Unconstrained dialog with custom body and footer</CardDescription>
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

            {/* TOKENS & THEMES TAB */}
            {activeTab === "tokens" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-fg">Design Tokens & Dynamic Themes</h2>
                  <p className="text-xs text-muted">
                    Live inspection of CSS variables in the active theme.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Theme Switcher</CardTitle>
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
                    <CardTitle>Active Palette Preview</CardTitle>
                    <CardDescription>Semantic background and matching text tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { name: "--accent", fg: "--accent-fg", label: "Accent", bg: "bg-accent", text: "text-accent-fg" },
                        { name: "--danger", fg: "--danger-fg", label: "Danger", bg: "bg-danger", text: "text-danger-fg" },
                        { name: "--warn", fg: "--warn-fg", label: "Warning", bg: "bg-warn", text: "text-warn-fg" },
                        { name: "--ok", fg: "--ok-fg", label: "Success", bg: "bg-ok", text: "text-ok-fg" },
                        { name: "--surface", fg: "--fg", label: "Surface", bg: "bg-surface border border-border", text: "text-fg" },
                        { name: "--surface-subtle", fg: "--fg", label: "Subtle Surface", bg: "bg-surface-subtle border border-border", text: "text-fg" },
                        { name: "--accent-soft", fg: "--accent", label: "Accent Soft", bg: "bg-accent-soft border border-accent/20", text: "text-accent" },
                        { name: "--ok-soft", fg: "--ok", label: "Success Soft", bg: "bg-ok-soft border border-ok/20", text: "text-ok" },
                      ].map((token) => (
                        <div
                          key={token.name}
                          className={`rounded-xl p-3.5 text-xs flex flex-col justify-between h-20 ${token.bg} ${token.text}`}
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

            {/* INSTALLATION TAB */}
            {activeTab === "install" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-fg">Installation & Usage</h2>
                  <p className="text-xs text-muted">
                    Quick setup guide for future frontend applications.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Install the Package</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="rounded-xl border border-border bg-surface-subtle p-3.5 text-xs font-mono text-fg overflow-x-auto">
                      npm install kaneki-components
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Setup Root Layout</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="rounded-xl border border-border bg-surface-subtle p-3.5 text-xs font-mono text-fg overflow-x-auto">
{`import "kaneki-components/styles.css";
import { ThemeProvider, ToastProvider } from "kaneki-components";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ACTION MODALS */}
      <ActionModal
        isOpen={isPromptOpen}
        type="prompt"
        title="Create New Project"
        description="Enter the slug of your new frontend application."
        inputPlaceholder="e.g. kaneki-mobile"
        confirmText="Create Project"
        onConfirm={(name) => {
          setIsPromptOpen(false);
          toast.success("Project Created", `Initialized "${name}"`);
        }}
        onCancel={() => setIsPromptOpen(false)}
      />

      <ActionModal
        isOpen={isConfirmOpen}
        type="confirm"
        title="Deploy to Vercel Production"
        description="Are you sure you want to promote the current build to production on Vercel?"
        confirmText="Confirm Deploy"
        onConfirm={() => {
          setIsConfirmOpen(false);
          toast.success("Deployment Triggered", "Promoting to edge network...");
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
          toast.error("Project Deleted", "Workspace records purged.");
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

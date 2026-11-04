import { useState } from "react";
import { Home, Inbox, PieChart, Pencil, Wallet } from "lucide-react";
import {
  Alert,
  Avatar,
  BarChart,
  BottomNav,
  BottomNavItem,
  CHART_PALETTE,
  DeltaBadge,
  DescriptionItem,
  DescriptionList,
  DonutChart,
  EmptyState,
  IconButton,
  LineChart,
  List,
  ListItem,
  NavItem,
  PeriodSwitcher,
  Progress,
  ProgressRing,
  Sparkline,
  Stat,
  StatGroup,
  TopNav,
  buttonClasses,
} from "../../../src";
import { ShowcaseCard } from "./ShowcaseCard";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const SPEND = [820, 940, 760, 1010, 880, 930];
const BUDGET = [900, 900, 900, 950, 950, 950];

/** Stats, progress, alerts, lists, empty states, navigation and charts. */
export function DataShowcase() {
  const [month, setMonth] = useState(5);
  const [nav, setNav] = useState("home");
  const [selected, setSelected] = useState("rent");

  return (
    <>
      <ShowcaseCard title="Stats & progress" icon={<Wallet />} description="StatGroup with mobileColumns=2, DeltaBadge, Progress with a custom colour.">
        <div className="space-y-4">
          <StatGroup variant="cards" mobileColumns={2} columns={2}>
            <Stat label="Spent" value="$930" trend={<DeltaBadge value={0.057} invert suffix="vs May" />} />
            <Stat label="Saved" value="$420" trend={<DeltaBadge value={-0.12} suffix={<em>vs May</em>} />} />
          </StatGroup>
          <Progress label="Food budget" valueLabel="72%" value={72} marker={85} markerLabel="Projected: 85%" color="#10b981" secondary={60} />
          <div className="flex items-center gap-3">
            <ProgressRing value={0.64} size={56}>64%</ProgressRing>
            <Sparkline values={SPEND} label="Spending trend" width={120} height={32} area />
          </div>
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Alerts, lists & empty" description="ListItem selectedAttr, stacked actions and DescriptionList stackOnMobile.">
        <div className="space-y-4">
          <Alert tone="warn" title="Budget almost used">You have $70 left for food this month.</Alert>
          <List variant="card">
            {[
              { id: "rent", title: "Rent", amount: "$1,200" },
              { id: "power", title: "Electricity and a very long description that wraps", amount: "$84" },
            ].map((row) => (
              <ListItem
                key={row.id}
                interactive
                selected={selected === row.id}
                onClick={() => setSelected(row.id)}
                leading={<Avatar name={row.title} size="sm" />}
                title={row.title}
                wrapTitle
                trailing={row.amount}
                stackActionsOnMobile
                actions={<IconButton label={`Edit ${row.title}`} icon={<Pencil />} size="sm" />}
              />
            ))}
          </List>
          <DescriptionList stackOnMobile>
            <DescriptionItem term="Account" value="Main checking" />
            <DescriptionItem term="Payday" value="25th, shifted before weekends" />
          </DescriptionList>
          <EmptyState size="sm" bordered icon={<Inbox />} title="No transactions" description="Add one to get started." />
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Navigation" description="TopNav, PeriodSwitcher (lg), BottomNav and a link styled with buttonClasses.">
        <div className="space-y-4">
          <TopNav aria-label="Sections">
            {["Overview", "Expenses", "Income"].map((label, i) => (
              <NavItem key={label} href="#" active={i === 0} onClick={(e) => e.preventDefault()}>
                {label}
              </NavItem>
            ))}
          </TopNav>
          <PeriodSwitcher
            size="lg"
            label={`${MONTHS[month]} 2026`}
            onPrev={() => setMonth((m) => Math.max(0, m - 1))}
            onNext={() => setMonth((m) => Math.min(MONTHS.length - 1, m + 1))}
            prevDisabled={month === 0}
            nextDisabled={month === MONTHS.length - 1}
            prevLabel="Previous month"
            nextLabel="Next month"
          />
          <BottomNav fixed={false} showOnDesktop aria-label="Demo bottom navigation">
            {[
              { id: "home", label: "Home", icon: <Home /> },
              { id: "charts", label: "Charts", icon: <PieChart /> },
              { id: "inbox", label: "Inbox", icon: <Inbox /> },
            ].map((item) => (
              <BottomNavItem
                key={item.id}
                as="button"
                type="button"
                icon={item.icon}
                label={item.label}
                active={nav === item.id}
                onClick={() => setNav(item.id)}
              />
            ))}
          </BottomNav>
          <a href="#showcase" className={buttonClasses({ variant: "secondary", size: "sm" })}>
            Link styled as a button
          </a>
        </div>
      </ShowcaseCard>

      <ShowcaseCard title="Charts" description="Line, bar and donut charts with small sample data.">
        <div className="space-y-6">
          <LineChart
            title="Spending vs budget"
            height={180}
            xLabels={MONTHS}
            series={[
              { id: "spend", label: "Spent", data: SPEND, area: true },
              { id: "budget", label: "Budget", data: BUDGET, dashed: true, color: "var(--muted)" },
            ]}
          />
          <BarChart title="Monthly spending" height={160} xLabels={MONTHS} data={SPEND} seriesLabel="Spent" highlightMax />
          <DonutChart
            title="By category"
            size={140}
            segments={[
              { label: "Rent", value: 1200, color: CHART_PALETTE[0] },
              { label: "Food", value: 450, color: CHART_PALETTE[1] },
              { label: "Transport", value: 160, color: CHART_PALETTE[2] },
            ]}
          />
        </div>
      </ShowcaseCard>
    </>
  );
}

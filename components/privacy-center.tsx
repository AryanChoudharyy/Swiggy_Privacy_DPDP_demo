"use client";

import { useMemo, useState, type ElementType } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Activity,
  Archive,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  History,
  Home,
  ListChecks,
  LocateFixed,
  LockKeyhole,
  MapPin,
  Megaphone,
  Menu,
  PackageCheck,
  Radio,
  ReceiptText,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type View =
  | "home"
  | "consent"
  | "permissions"
  | "marketing"
  | "location"
  | "download"
  | "delete"
  | "history";

type HistoryType = "Consent" | "Marketing" | "Location" | "Data Rights" | "Deletion";

type HistoryEntry = {
  id: string;
  type: HistoryType;
  title: string;
  detail: string;
  timestamp: string;
  source: string;
};

type AnalyticsEvent = {
  id: string;
  eventName: string;
  payload: Record<string, string | number | boolean | string[]>;
  timestamp: string;
};

type ConsentKey = "personalisation" | "marketing" | "partnerOffers" | "locationConvenience" | "analytics";
type MarketingKey = "push" | "email" | "sms" | "whatsapp" | "partner";
type LocationMode = "precise" | "saved" | "manual";

const navItems: Array<{ id: View; label: string; icon: ElementType }> = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "consent", label: "Onboarding consent", icon: ShieldCheck },
  { id: "permissions", label: "Permissions", icon: SlidersHorizontal },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "location", label: "Location", icon: MapPin },
  { id: "download", label: "Data download", icon: Download },
  { id: "delete", label: "Delete account", icon: Trash2 },
  { id: "history", label: "Consent history", icon: History },
];

const swiggyMarkUrl =
  "https://cdn.dribbble.com/userupload/28176351/file/original-2f163c2fede027c929baa7b25f3e5d64.jpg";

const optionalPurposes: Array<{
  key: ConsentKey;
  label: string;
  benefit: string;
  offState: string;
  dataUsed: string;
}> = [
  {
    key: "personalisation",
    label: "Personalised recommendations",
    benefit: "Cuisine rows, reorder shortcuts, and item suggestions improve with your activity.",
    offState: "Recommendations become more generic, but ordering still works.",
    dataUsed: "Order history, cuisine preference, app activity",
  },
  {
    key: "marketing",
    label: "Offers and promotions",
    benefit: "Promotional deals can be sent outside essential order updates.",
    offState: "You stop receiving promotional campaigns, but service messages continue.",
    dataUsed: "Contact channels, campaign engagement, eligible offers",
  },
  {
    key: "partnerOffers",
    label: "Partner offers",
    benefit: "Eligible Swiggy partner campaigns can be shown when relevant.",
    offState: "Partner promotions are paused.",
    dataUsed: "Eligibility signals and preference categories",
  },
  {
    key: "locationConvenience",
    label: "Location-based convenience",
    benefit: "Nearby stores, restaurants, and saved address suggestions become faster.",
    offState: "You can still order by entering or selecting an address.",
    dataUsed: "Device location or saved delivery area",
  },
  {
    key: "analytics",
    label: "Product improvement analytics",
    benefit: "Usage patterns help Swiggy find broken flows and improve privacy controls.",
    offState: "The team receives less diagnostic signal from your usage.",
    dataUsed: "Screen events, settings interactions, app diagnostics",
  },
];

const marketingChannels: Array<{ key: MarketingKey; label: string; detail: string; icon: ElementType }> = [
  { key: "push", label: "Push notifications", detail: "App offers and limited-time campaigns.", icon: Bell },
  { key: "email", label: "Email", detail: "Deal roundups and feature announcements.", icon: ReceiptText },
  { key: "sms", label: "SMS", detail: "Promotional text campaigns.", icon: Radio },
  { key: "whatsapp", label: "WhatsApp", detail: "Offer messages through WhatsApp.", icon: Megaphone },
  { key: "partner", label: "Partner offers", detail: "Eligible offers from partner programs.", icon: PackageCheck },
];

const initialHistory: HistoryEntry[] = [
  {
    id: "history-1",
    type: "Consent",
    title: "Essential consent accepted",
    detail: "Delivery, payments, fraud checks, and support remain active.",
    timestamp: "03 Jul 2026, 10:14 AM",
    source: "Onboarding",
  },
  {
    id: "history-2",
    type: "Marketing",
    title: "Email offers turned off",
    detail: "Promotional email campaigns paused. Order updates continue.",
    timestamp: "03 Jul 2026, 10:17 AM",
    source: "Marketing preferences",
  },
  {
    id: "history-3",
    type: "Location",
    title: "Nearby offers paused",
    detail: "Delivery location remains available when selected by the user.",
    timestamp: "03 Jul 2026, 10:22 AM",
    source: "Location controls",
  },
];

const initialConsent: Record<ConsentKey, boolean> = {
  personalisation: true,
  marketing: false,
  partnerOffers: false,
  locationConvenience: true,
  analytics: true,
};

const initialMarketing: Record<MarketingKey, boolean> = {
  push: true,
  email: false,
  sms: false,
  whatsapp: false,
  partner: false,
};

function formatNow() {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function makeId(prefix: string) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function PrivacyCenter() {
  const [activeView, setActiveView] = useState<View>("home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [consent, setConsent] = useState<Record<ConsentKey, boolean>>(initialConsent);
  const [marketing, setMarketing] = useState<Record<MarketingKey, boolean>>(initialMarketing);
  const [locationMode, setLocationMode] = useState<LocationMode>("saved");
  const [nearbyOffers, setNearbyOffers] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(initialHistory);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [exportId, setExportId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const enabledConsentCount = Object.values(consent).filter(Boolean).length;
  const enabledMarketingCount = Object.values(marketing).filter(Boolean).length;

  function track(eventName: string, payload: AnalyticsEvent["payload"] = {}) {
    const event = {
      id: `${eventName}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      eventName,
      payload,
      timestamp: formatNow(),
    };
    console.log("[privacy-center]", eventName, payload);
    setEvents((current) => [event, ...current].slice(0, 40));
  }

  function appendHistory(type: HistoryType, title: string, detail: string, source: string) {
    setHistory((current) => [
      {
        id: `history-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type,
        title,
        detail,
        timestamp: formatNow(),
        source,
      },
      ...current,
    ]);
  }

  function recordAction(args: {
    eventName: string;
    payload?: AnalyticsEvent["payload"];
    historyType: HistoryType;
    historyTitle: string;
    historyDetail: string;
    source: string;
    toastTitle: string;
  }) {
    track(args.eventName, args.payload);
    appendHistory(args.historyType, args.historyTitle, args.historyDetail, args.source);
    toast.success(args.toastTitle, { description: args.historyDetail });
  }

  function navigate(view: View) {
    setActiveView(view);
    setMobileNavOpen(false);
    if (view === "consent") {
      track("consent_screen_viewed", { source: activeView });
    }
    if (view === "history") {
      track("consent_history_viewed", { source: activeView, entries: history.length });
    }
  }

  function togglePermission(key: ConsentKey, enabled: boolean, source = "Granular permissions") {
    const purpose = optionalPurposes.find((item) => item.key === key);
    setConsent((current) => ({ ...current, [key]: enabled }));
    recordAction({
      eventName: "permission_toggled",
      payload: { permission: key, enabled, source },
      historyType: "Consent",
      historyTitle: `${purpose?.label ?? key} ${enabled ? "enabled" : "disabled"}`,
      historyDetail: enabled ? purpose?.benefit ?? "Optional purpose enabled." : purpose?.offState ?? "Optional purpose disabled.",
      source,
      toastTitle: "Permission updated",
    });
  }

  function toggleMarketing(key: MarketingKey, enabled: boolean) {
    const channel = marketingChannels.find((item) => item.key === key);
    setMarketing((current) => ({ ...current, [key]: enabled }));
    recordAction({
      eventName: "marketing_preference_updated",
      payload: { channel: key, enabled },
      historyType: "Marketing",
      historyTitle: `${channel?.label ?? key} ${enabled ? "enabled" : "disabled"}`,
      historyDetail: enabled ? `${channel?.label ?? "Channel"} can receive promotional offers.` : `${channel?.label ?? "Channel"} promotional offers are paused.`,
      source: "Marketing preferences",
      toastTitle: "Marketing preference saved",
    });
  }

  function changeLocationMode(value: LocationMode) {
    setLocationMode(value);
    recordAction({
      eventName: "location_mode_changed",
      payload: { mode: value, nearbyOffers },
      historyType: "Location",
      historyTitle: `Location mode changed to ${value}`,
      historyDetail: value === "manual" ? "Manual address entry is now the default." : "Delivery location preference was updated.",
      source: "Location controls",
      toastTitle: "Location mode updated",
    });
  }

  function toggleNearbyOffers(enabled: boolean) {
    setNearbyOffers(enabled);
    recordAction({
      eventName: "location_mode_changed",
      payload: { mode: locationMode, nearbyOffers: enabled, setting: "nearby_offers" },
      historyType: "Location",
      historyTitle: `Nearby offers ${enabled ? "enabled" : "disabled"}`,
      historyDetail: enabled ? "Location can support nearby offer suggestions." : "Nearby offer suggestions will not use location.",
      source: "Location controls",
      toastTitle: "Nearby offer setting saved",
    });
  }

  function acceptConsent() {
    recordAction({
      eventName: "consent_accepted",
      payload: {
        optionalPurposesEnabled: Object.entries(consent)
          .filter(([, enabled]) => enabled)
          .map(([key]) => key),
      },
      historyType: "Consent",
      historyTitle: "Onboarding consent accepted",
      historyDetail: "Selected optional purposes were saved for this mock user.",
      source: "Onboarding consent",
      toastTitle: "Consent choices accepted",
    });
    navigate("home");
  }

  function requestExport() {
    const id = makeId("EXP");
    setExportId(id);
    recordAction({
      eventName: "data_export_requested",
      payload: { requestId: id, status: "pending", includes: ["profile", "addresses", "orders", "consent_history", "marketing"] },
      historyType: "Data Rights",
      historyTitle: "Data export requested",
      historyDetail: `Export request ${id} is preparing.`,
      source: "Data download",
      toastTitle: "Export request created",
    });
  }

  function startDeletionRequest() {
    recordAction({
      eventName: "account_deletion_requested",
      payload: { acknowledged: deleteAcknowledged },
      historyType: "Deletion",
      historyTitle: "Account deletion review started",
      historyDetail: "The confirmation dialog was opened after acknowledging consequences.",
      source: "Delete account",
      toastTitle: "Deletion review started",
    });
    setDeleteDialogOpen(true);
  }

  function confirmDeletion() {
    const id = makeId("DEL");
    setDeleteId(id);
    setDeleteDialogOpen(false);
    recordAction({
      eventName: "account_deletion_confirmed",
      payload: { requestId: id, status: "pending" },
      historyType: "Deletion",
      historyTitle: "Account deletion confirmed",
      historyDetail: `Deletion request ${id} is pending.`,
      source: "Delete account",
      toastTitle: "Deletion request submitted",
    });
  }

  const dashboardCards = useMemo(
    () => [
      {
        id: "permissions" as View,
        title: "Consent health",
        metric: `${enabledConsentCount}/5`,
        detail: "Optional purposes active",
        icon: ShieldCheck,
        tone: "success" as const,
      },
      {
        id: "location" as View,
        title: "Location",
        metric: locationMode,
        detail: nearbyOffers ? "Nearby offers enabled" : "Nearby offers paused",
        icon: LocateFixed,
        tone: "secondary" as const,
      },
      {
        id: "marketing" as View,
        title: "Marketing",
        metric: `${enabledMarketingCount}/5`,
        detail: "Promo channels active",
        icon: Megaphone,
        tone: enabledMarketingCount > 0 ? ("default" as const) : ("secondary" as const),
      },
      {
        id: "download" as View,
        title: "Data rights",
        metric: exportId || deleteId ? "Pending" : "Ready",
        detail: "Export and deletion controls",
        icon: Archive,
        tone: exportId || deleteId ? ("default" as const) : ("success" as const),
      },
    ],
    [deleteId, enabledConsentCount, enabledMarketingCount, exportId, locationMode, nearbyOffers],
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="delivery-map min-h-screen">
        <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <DesktopNav activeView={activeView} onNavigate={navigate} />

          <section className="min-w-0 flex-1">
            <TopBar
              activeView={activeView}
              mobileNavOpen={mobileNavOpen}
              setMobileNavOpen={setMobileNavOpen}
              onNavigate={navigate}
              eventCount={events.length}
              analyticsOpen={analyticsOpen}
              setAnalyticsOpen={setAnalyticsOpen}
              events={events}
            />

            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="pb-10"
            >
              {activeView === "home" && (
                <Dashboard cards={dashboardCards} onNavigate={navigate} events={events} history={history} />
              )}
              {activeView === "consent" && (
                <OnboardingConsent consent={consent} onToggle={togglePermission} onAccept={acceptConsent} />
              )}
              {activeView === "permissions" && (
                <GranularPermissions consent={consent} onToggle={togglePermission} onNavigate={navigate} />
              )}
              {activeView === "marketing" && <MarketingPreferences marketing={marketing} onToggle={toggleMarketing} />}
              {activeView === "location" && (
                <LocationControls
                  locationMode={locationMode}
                  nearbyOffers={nearbyOffers}
                  onModeChange={changeLocationMode}
                  onNearbyOffersChange={toggleNearbyOffers}
                />
              )}
              {activeView === "download" && <DataDownload exportId={exportId} onRequest={requestExport} />}
              {activeView === "delete" && (
                <DeleteAccount
                  deleteId={deleteId}
                  acknowledged={deleteAcknowledged}
                  onAcknowledged={setDeleteAcknowledged}
                  onRequest={startDeletionRequest}
                />
              )}
              {activeView === "history" && <ConsentHistory history={history} />}
            </motion.div>
          </section>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm account deletion request</DialogTitle>
            <DialogDescription>
              This creates a mock pending deletion request. Active orders, refunds, and records retained by law would be handled by the real backend workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">
            You will receive a request ID for support and audit tracking.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeletion}>
              Confirm deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function DesktopNav({ activeView, onNavigate }: { activeView: View; onNavigate: (view: View) => void }) {
  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-32px)] w-72 shrink-0 lg:block">
      <Card className="flex h-full flex-col overflow-hidden border-stone-200 bg-white/95 shadow-soft">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <img
              src={swiggyMarkUrl}
              alt="Swiggy"
              className="h-11 w-11 rounded-lg border border-orange-200 object-cover shadow-line"
            />
            <div>
              <CardTitle className="text-base">Swiggy Privacy</CardTitle>
              <CardDescription>DPDP-ready prototype</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors",
                activeView === item.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
          <div className="mt-auto rounded-lg bg-swiggy-ink p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-swiggy-saffron">PM demo angle</p>
            <p className="mt-2 text-sm leading-5 text-stone-200">Trust controls. Rights flows. Measurable signals.</p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

function TopBar({
  activeView,
  mobileNavOpen,
  setMobileNavOpen,
  onNavigate,
  eventCount,
  analyticsOpen,
  setAnalyticsOpen,
  events,
}: {
  activeView: View;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  onNavigate: (view: View) => void;
  eventCount: number;
  analyticsOpen: boolean;
  setAnalyticsOpen: (open: boolean) => void;
  events: AnalyticsEvent[];
}) {
  const current = navItems.find((item) => item.id === activeView);

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Swiggy Privacy</SheetTitle>
            <SheetDescription>Choose a screen to demo.</SheetDescription>
          </SheetHeader>
          <Separator className="my-4" />
          <div className="grid gap-2">
            {navItems.map((item) => (
              <Button key={item.id} variant={activeView === item.id ? "default" : "ghost"} className="justify-start" onClick={() => onNavigate(item.id)}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Current screen</p>
        <h1 className="truncate text-xl font-semibold text-foreground sm:text-2xl">{current?.label}</h1>
      </div>

      <Sheet open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Debug: Analytics
            <Badge variant="secondary" className="ml-2">{eventCount}</Badge>
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Debug: Analytics</SheetTitle>
            <SheetDescription>Mock PM instrumentation events from this session.</SheetDescription>
          </SheetHeader>
          <Separator className="my-4" />
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">
                No events yet. Toggle a permission or request a data export.
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="rounded-md border bg-card p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs font-semibold text-foreground">{event.eventName}</p>
                    <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                  </div>
                  <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs text-muted-foreground">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Dashboard({
  cards,
  onNavigate,
  events,
  history,
}: {
  cards: Array<{ id: View; title: string; metric: string; detail: string; icon: ElementType; tone: "default" | "secondary" | "success" }>;
  onNavigate: (view: View) => void;
  events: AnalyticsEvent[];
  history: HistoryEntry[];
}) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border bg-swiggy-ink text-white shadow-soft">
        <div className="grid gap-8 p-6 md:grid-cols-2 lg:p-8">
          <div>
            <Badge variant="default" className="bg-swiggy-saffron text-swiggy-ink">India DPDP prototype</Badge>
            <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Privacy, on your terms.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-300">
              A polished hiring-case prototype for showing clear notice, easy withdrawal, user rights, and PM-grade instrumentation.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => onNavigate("permissions")}>Manage permissions</Button>
              <Button variant="outline" className="border-stone-600 bg-transparent text-white hover:bg-stone-800" onClick={() => onNavigate("history")}>
                View consent history
              </Button>
            </div>
          </div>
          <div className="relative rounded-lg border border-stone-700 bg-stone-900 p-5">
            <div className="space-y-4">
              {["Notice shown", "Optional purposes split", "Withdrawal available", "Audit trail active"].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.18 }}
                  className="flex items-center justify-between rounded-md border border-stone-700 bg-stone-950 px-4 py-3"
                >
                  <span className="text-sm text-stone-200">{item}</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <button key={card.id} type="button" className="group text-left" onClick={() => onNavigate(card.id)}>
            <Card className="h-full transition duration-200 group-hover:-translate-y-1 group-hover:shadow-soft group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-md bg-accent p-2 text-swiggy-ember">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <Badge variant={card.tone}>{card.title}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold capitalize tracking-tight">{card.metric}</p>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>{card.detail}</span>
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> Instrumentation</CardTitle>
            <CardDescription>Visible analytics for the interview story.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{events.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">events fired in this session</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-4 w-4" /> Audit trail</CardTitle>
            <CardDescription>User-facing consent history entries.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold">{history.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">history records visible to the user</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LockKeyhole className="h-4 w-4" /> Required baseline</CardTitle>
            <CardDescription>Essential processing is visually locked.</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="locked">Always on for orders</Badge>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Delivery, payments, fraud prevention, support, and legal messages stay separate from optional consent.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SectionHeader({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div className="mb-5">
      <Badge variant="secondary">{label}</Badge>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function LockedEssentialPanel() {
  return (
    <Card className="border-stone-300 bg-stone-100">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base"><LockKeyhole className="h-4 w-4" /> Essential processing</CardTitle>
            <CardDescription>Required for food delivery to work.</CardDescription>
          </div>
          <Badge variant="locked">Locked</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {["Delivery address", "Payments and refunds", "Fraud prevention", "Order support"].map((item) => (
          <div key={item} className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700">
            {item}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function OnboardingConsent({
  consent,
  onToggle,
  onAccept,
}: {
  consent: Record<ConsentKey, boolean>;
  onToggle: (key: ConsentKey, enabled: boolean, source?: string) => void;
  onAccept: () => void;
}) {
  const [noticeOpen, setNoticeOpen] = useState(false);

  return (
    <div className="space-y-5">
      <SectionHeader
        label="Onboarding consent"
        title="Start with what is essential. Choose what is optional."
        description="The user sees the difference before the first order and can accept selected optional purposes without drowning in policy language."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <LockedEssentialPanel />
        </div>
        <div className="space-y-3 xl:col-span-2">
          {optionalPurposes.slice(0, 4).map((purpose) => (
            <PurposeToggle
              key={purpose.key}
              purpose={purpose}
              enabled={consent[purpose.key]}
              onCheckedChange={(enabled) => onToggle(purpose.key, enabled, "Onboarding consent")}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={onAccept}>Accept selected choices</Button>
        <Button size="lg" variant="outline" onClick={() => setNoticeOpen(true)}>Read short notice</Button>
      </div>
      <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Short privacy notice</DialogTitle>
            <DialogDescription>
              Swiggy uses essential data to place orders, process payments, support delivery, prevent fraud, and resolve help requests. Optional data improves recommendations, offers, nearby suggestions, and product quality.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 text-sm">
            <div className="rounded-md border bg-muted p-3">
              <p className="font-semibold">What you control</p>
              <p className="mt-1 text-muted-foreground">Personalisation, marketing, partner offers, location convenience, and product analytics can be changed anytime.</p>
            </div>
            <div className="rounded-md border bg-muted p-3">
              <p className="font-semibold">What stays on</p>
              <p className="mt-1 text-muted-foreground">Order updates, payment messages, safety alerts, and legal notices continue so the service can work.</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setNoticeOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GranularPermissions({
  consent,
  onToggle,
  onNavigate,
}: {
  consent: Record<ConsentKey, boolean>;
  onToggle: (key: ConsentKey, enabled: boolean, source?: string) => void;
  onNavigate: (view: View) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionHeader
        label="Granular permissions"
        title="Every optional purpose gets a plain-language trade-off."
        description="This is the strongest PM surface: it gives users real control and gives Swiggy cleaner consent signals."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          <LockedEssentialPanel />
          {optionalPurposes.map((purpose) => (
            <PurposeToggle
              key={purpose.key}
              purpose={purpose}
              enabled={consent[purpose.key]}
              onCheckedChange={(enabled) => onToggle(purpose.key, enabled)}
            />
          ))}
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Live consent summary</CardTitle>
            <CardDescription>What the mock backend would store by purpose.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {optionalPurposes.map((purpose) => (
              <div key={purpose.key} className="flex items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{purpose.label}</p>
                  <p className="text-xs text-muted-foreground">{purpose.dataUsed}</p>
                </div>
                <Badge variant={consent[purpose.key] ? "success" : "secondary"}>{consent[purpose.key] ? "On" : "Off"}</Badge>
              </div>
            ))}
            <Separator />
            <Button variant="outline" className="w-full" onClick={() => onNavigate("history")}>
              <History className="mr-2 h-4 w-4" />
              View audit trail
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PurposeToggle({
  purpose,
  enabled,
  onCheckedChange,
}: {
  purpose: (typeof optionalPurposes)[number];
  enabled: boolean;
  onCheckedChange: (enabled: boolean) => void;
}) {
  return (
    <Card className={cn("transition duration-200", enabled ? "border-orange-200 bg-orange-50" : "bg-card")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{purpose.label}</h3>
              <Badge variant={enabled ? "success" : "secondary"}>{enabled ? "Active" : "Paused"}</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{purpose.benefit}</p>
            <p className="mt-2 text-xs font-medium text-stone-600">If off: {purpose.offState}</p>
          </div>
          <motion.div whileTap={{ scale: 0.96 }} transition={{ duration: 0.12 }}>
            <Switch checked={enabled} onCheckedChange={onCheckedChange} aria-label={`Toggle ${purpose.label}`} />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}

function MarketingPreferences({
  marketing,
  onToggle,
}: {
  marketing: Record<MarketingKey, boolean>;
  onToggle: (key: MarketingKey, enabled: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionHeader
        label="Marketing preferences"
        title="Promotional consent is not the same as service communication."
        description="The UI separates optional marketing from messages that keep orders, refunds, safety, and legal notices working."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          {marketingChannels.map((channel) => (
            <Card key={channel.key}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="rounded-md bg-accent p-2 text-swiggy-ember">
                    <channel.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{channel.label}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{channel.detail}</p>
                  </div>
                </div>
                <motion.div whileTap={{ scale: 0.96 }} transition={{ duration: 0.12 }}>
                  <Switch checked={marketing[channel.key]} onCheckedChange={(enabled) => onToggle(channel.key, enabled)} />
                </motion.div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="h-fit bg-swiggy-ink text-white">
          <CardHeader>
            <CardTitle>Never affected by these toggles</CardTitle>
            <CardDescription className="text-stone-300">Service messages remain available.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {["Order updates", "Payment and refund notices", "Safety alerts", "Legal notices"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-md border border-stone-700 bg-stone-900 px-3 py-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LocationControls({
  locationMode,
  nearbyOffers,
  onModeChange,
  onNearbyOffersChange,
}: {
  locationMode: LocationMode;
  nearbyOffers: boolean;
  onModeChange: (value: LocationMode) => void;
  onNearbyOffersChange: (enabled: boolean) => void;
}) {
  const modes: Array<{ value: LocationMode; title: string; detail: string; icon: ElementType }> = [
    { value: "precise", title: "Precise current location", detail: "Fastest delivery address selection.", icon: LocateFixed },
    { value: "saved", title: "Saved addresses", detail: "Use home, work, and saved delivery points.", icon: MapPin },
    { value: "manual", title: "Manual entry", detail: "Type the address without device location.", icon: ListChecks },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        label="Location controls"
        title="Let users choose the lightest location mode that still gets food delivered."
        description="Delivery requires a valid address. Device location is positioned as a convenience, not a forced default."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Location mode</CardTitle>
            <CardDescription>Radio selection records a location_mode_changed event.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={locationMode} onValueChange={(value) => onModeChange(value as LocationMode)} className="grid gap-3">
              {modes.map((mode) => (
                <label
                  key={mode.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition duration-200",
                    locationMode === mode.value ? "border-orange-300 bg-orange-50" : "bg-card hover:bg-muted",
                  )}
                >
                  <RadioGroupItem value={mode.value} />
                  <div className="rounded-md bg-accent p-2 text-swiggy-ember">
                    <mode.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{mode.title}</p>
                    <p className="text-sm text-muted-foreground">{mode.detail}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Nearby offers</CardTitle>
            <CardDescription>Separate from fulfilment location.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Use location for nearby offers</p>
              <p className="mt-1 text-sm text-muted-foreground">Optional promotional convenience.</p>
            </div>
            <Switch checked={nearbyOffers} onCheckedChange={onNearbyOffersChange} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DataDownload({ exportId, onRequest }: { exportId: string; onRequest: () => void }) {
  return (
    <div className="space-y-5">
      <SectionHeader
        label="Data download"
        title="A rights request should feel trackable, not like an email into the void."
        description="This happy path creates a mock export request ID and a pending state that the user can reference."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Request your data export</CardTitle>
            <CardDescription>A real implementation should require re-authentication before file access.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {["Profile", "Saved addresses", "Order history", "Consent history", "Marketing preferences", "Location preference"].map((item) => (
                <div key={item} className="rounded-md border bg-muted px-3 py-2 text-sm">{item}</div>
              ))}
            </div>
            <Button onClick={onRequest}>
              <Download className="mr-2 h-4 w-4" />
              Request export
            </Button>
          </CardContent>
        </Card>
        <StatusPanel title="Export status" id={exportId} empty="No export request yet." activeLabel="Preparing export" />
      </div>
    </div>
  );
}

function DeleteAccount({
  deleteId,
  acknowledged,
  onAcknowledged,
  onRequest,
}: {
  deleteId: string;
  acknowledged: boolean;
  onAcknowledged: (checked: boolean) => void;
  onRequest: () => void;
}) {
  return (
    <div className="space-y-5">
      <SectionHeader
        label="Delete account"
        title="Destructive flows need consequences, confirmation, and a request ID."
        description="The checkbox unlocks the request button; the dialog creates a second explicit confirmation moment."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-red-200 bg-red-50 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-red-950">Before you delete</CardTitle>
            <CardDescription className="text-red-800">This is a mock flow, but the consequences are intentionally explicit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Saved addresses may be removed.",
                "Order history may no longer be visible.",
                "Active refunds must be resolved first.",
                "Some records may be retained where legally required.",
              ].map((item) => (
                <div key={item} className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-950">
                  {item}
                </div>
              ))}
            </div>
            <label className="flex cursor-pointer items-start gap-3 text-sm font-medium text-red-950">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => onAcknowledged(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
              />
              I understand the consequences and want to start account deletion.
            </label>
            <Button variant="destructive" disabled={!acknowledged} onClick={onRequest}>
              <Trash2 className="mr-2 h-4 w-4" />
              Start deletion request
            </Button>
          </CardContent>
        </Card>
        <StatusPanel title="Deletion status" id={deleteId} empty="No deletion request yet." activeLabel="Pending deletion" destructive />
      </div>
    </div>
  );
}

function StatusPanel({
  title,
  id,
  empty,
  activeLabel,
  destructive = false,
}: {
  title: string;
  id: string;
  empty: string;
  activeLabel: string;
  destructive?: boolean;
}) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Mock request status.</CardDescription>
      </CardHeader>
      <CardContent>
        {id ? (
          <div>
            <Badge variant={destructive ? "destructive" : "default"}>{activeLabel}</Badge>
            <p className="mt-4 font-mono text-2xl font-semibold">{id}</p>
            <p className="mt-2 text-sm text-muted-foreground">Use this ID to discuss support workflow and auditability.</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{empty}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ConsentHistory({ history }: { history: HistoryEntry[] }) {
  const filters: Array<"All" | HistoryType> = ["All", "Consent", "Marketing", "Location", "Data Rights", "Deletion"];

  return (
    <div className="space-y-5">
      <SectionHeader
        label="Consent history"
        title="A user-visible audit trail for trust and accountability."
        description="Every toggle, save, export, and deletion action appends an entry here."
      />
      <Tabs defaultValue="All">
        <TabsList className="mb-4 flex h-auto flex-wrap justify-start">
          {filters.map((filter) => (
            <TabsTrigger key={filter} value={filter}>{filter}</TabsTrigger>
          ))}
        </TabsList>
        {filters.map((filter) => {
          const visible = filter === "All" ? history : history.filter((entry) => entry.type === filter);
          return (
            <TabsContent key={filter} value={filter} className="space-y-3">
              {visible.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="rounded-md bg-accent p-2 text-swiggy-ember">
                      <Clock3 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{entry.title}</h3>
                        <Badge variant="secondary">{entry.type}</Badge>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{entry.detail}</p>
                      <p className="mt-2 font-mono text-xs text-muted-foreground">{entry.timestamp} from {entry.source}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

import React, { useMemo, useState } from "react";

const consentDefaults = {
  personalisation: true,
  marketing: false,
  partnerOffers: false,
  locationConvenience: true,
  analytics: true,
};

const marketingDefaults = {
  push: true,
  email: false,
  sms: false,
  whatsapp: false,
  partner: false,
};

const initialHistory = [
  {
    id: "h-1",
    type: "Consent",
    title: "Essential consent accepted",
    detail: "Delivery, payments, fraud prevention, and support remain active.",
    date: "03 Jul 2026, 10:14 AM",
    source: "Onboarding",
  },
  {
    id: "h-2",
    type: "Marketing",
    title: "Email offers turned off",
    detail: "Promotional email campaigns paused. Order updates continue.",
    date: "03 Jul 2026, 10:17 AM",
    source: "Marketing preferences",
  },
  {
    id: "h-3",
    type: "Location",
    title: "Nearby offers paused",
    detail: "Location is still available for delivery when you choose it.",
    date: "03 Jul 2026, 10:22 AM",
    source: "Location controls",
  },
];

const screens = [
  { id: "home", label: "Home" },
  { id: "consent", label: "Consent" },
  { id: "permissions", label: "Permissions" },
  { id: "marketing", label: "Marketing" },
  { id: "location", label: "Location" },
  { id: "download", label: "Download" },
  { id: "delete", label: "Delete" },
  { id: "history", label: "History" },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function makeRequestId(prefix) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function Toggle({ checked, onChange, label, description, locked = false }) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => !locked && onChange(!checked)}
      className={cx(
        "group flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left transition",
        locked
          ? "border-stone-200 bg-stone-50 text-stone-500"
          : checked
            ? "border-emerald-300 bg-emerald-50/70 text-stone-950"
            : "border-stone-200 bg-white text-stone-950 hover:border-stone-300",
      )}
      aria-pressed={checked}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-stone-500">{description}</span>
      </span>
      <span
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-emerald-600" : "bg-stone-300",
          locked && "bg-stone-300",
        )}
      >
        <span
          className={cx(
            "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition",
            checked ? "left-6" : "left-1",
          )}
        />
      </span>
    </button>
  );
}

function PrimaryButton({ children, onClick, disabled = false, tone = "dark" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2",
        tone === "danger"
          ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
          : tone === "orange"
            ? "bg-orange-500 text-stone-950 hover:bg-orange-400 focus:ring-orange-500"
            : "bg-stone-950 text-white hover:bg-stone-800 focus:ring-stone-500",
        disabled && "cursor-not-allowed bg-stone-300 hover:bg-stone-300",
      )}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center rounded-md border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-800 transition hover:border-stone-300 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
    >
      {children}
    </button>
  );
}

function SectionTitle({ kicker, title, children }) {
  return (
    <div className="mb-5">
      {kicker && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{kicker}</p>}
      <h2 className="text-2xl font-semibold tracking-normal text-stone-950 sm:text-3xl">{title}</h2>
      {children && <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{children}</p>}
    </div>
  );
}

function StatusPill({ children, tone = "neutral" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "good" && "bg-emerald-100 text-emerald-800",
        tone === "warn" && "bg-amber-100 text-amber-800",
        tone === "danger" && "bg-red-100 text-red-800",
        tone === "neutral" && "bg-stone-100 text-stone-700",
      )}
    >
      {children}
    </span>
  );
}

function AppShell({ active, setActive, children, banner }) {
  return (
    <div className="min-h-screen bg-[#f7f5ef] text-stone-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:px-8">
        <aside className="lg:sticky lg:top-5 lg:h-[calc(100vh-40px)] lg:w-72">
          <div className="flex h-full flex-col rounded-lg border border-stone-200 bg-white/90 p-4 shadow-sm shadow-stone-200/70 backdrop-blur">
            <div className="border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-600 text-sm font-black text-white">
                  S
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-950">Swiggy</p>
                  <p className="text-xs text-stone-500">Privacy Center India</p>
                </div>
              </div>
            </div>
            <nav className="mt-4 grid gap-1">
              {screens.map((screen) => (
                <button
                  type="button"
                  key={screen.id}
                  onClick={() => setActive(screen.id)}
                  className={cx(
                    "flex items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition",
                    active === screen.id
                      ? "bg-stone-950 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-950",
                  )}
                >
                  {screen.label}
                  {active === screen.id && <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />}
                </button>
              ))}
            </nav>
            <div className="mt-auto hidden rounded-lg bg-stone-950 p-4 text-white lg:block">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">Trust layer</p>
              <p className="mt-2 text-sm leading-5 text-stone-200">
                Essential ordering stays fast. Optional data use becomes visible and reversible.
              </p>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          {banner}
          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm shadow-stone-200/80 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Home({ consent, marketing, exportId, deleteId, setActive }) {
  const optionalEnabled = Object.values(consent).filter(Boolean).length;
  const marketingEnabled = Object.values(marketing).filter(Boolean).length;

  const cards = [
    {
      title: "Consent health",
      value: `${optionalEnabled}/5 optional purposes on`,
      copy: "Review what helps recommendations, offers, and product improvement.",
      action: "Manage permissions",
      target: "permissions",
      tone: "good",
    },
    {
      title: "Location",
      value: consent.locationConvenience ? "Convenience on" : "Manual friendly",
      copy: "Use current location, saved addresses, or manual entry.",
      action: "Update location",
      target: "location",
      tone: consent.locationConvenience ? "good" : "neutral",
    },
    {
      title: "Marketing",
      value: `${marketingEnabled}/5 channels on`,
      copy: "Control offers by push, email, SMS, WhatsApp, and partners.",
      action: "Edit marketing",
      target: "marketing",
      tone: marketingEnabled ? "warn" : "neutral",
    },
    {
      title: "Data rights",
      value: exportId || deleteId ? "Request in progress" : "Ready",
      copy: "Download your data or start account deletion with a request ID.",
      action: "View options",
      target: "download",
      tone: exportId || deleteId ? "warn" : "good",
    },
  ];

  return (
    <div>
      <div className="mb-8 overflow-hidden rounded-lg bg-stone-950">
        <div className="grid gap-6 p-6 text-white lg:grid-cols-[1.35fr_0.65fr] lg:p-8">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-orange-300">Privacy Center</p>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-normal sm:text-5xl">
              Control optional data use without slowing down your next order.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-300">
              See what is essential for delivery, what improves convenience, and what you can pause or change anytime.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryButton tone="orange" onClick={() => setActive("permissions")}>Manage permissions</PrimaryButton>
              <SecondaryButton onClick={() => setActive("download")}>Download data</SecondaryButton>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Current state</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-stone-300">Essential ordering</span>
                <StatusPill tone="good">On</StatusPill>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-stone-300">Optional consent</span>
                <StatusPill tone={optionalEnabled >= 3 ? "good" : "warn"}>{optionalEnabled} active</StatusPill>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-stone-300">History</span>
                <StatusPill>Auditable</StatusPill>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <button
            type="button"
            key={card.title}
            onClick={() => setActive(card.target)}
            className="rounded-lg border border-stone-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-stone-950">{card.title}</p>
                <p className="mt-1 text-xl font-semibold text-stone-950">{card.value}</p>
              </div>
              <StatusPill tone={card.tone}>{card.action}</StatusPill>
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-600">{card.copy}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConsentScreen({ consent, setConsent, saveAction, setActive }) {
  const optionalItems = [
    ["personalisation", "Personalised recommendations", "Use order history and preferences to make restaurant and item suggestions more relevant."],
    ["marketing", "Offers and promotions", "Send deals and campaign messages outside essential order updates."],
    ["partnerOffers", "Partner offers", "Use eligible preference signals for Swiggy partner promotions."],
    ["locationConvenience", "Location-based convenience", "Use location to speed up address selection and nearby suggestions."],
  ];

  return (
    <div>
      <SectionTitle kicker="Onboarding consent" title="Choose what improves the experience">
        Essential data keeps ordering, payment, delivery, safety, fraud prevention, and support working. Optional purposes can be changed later.
      </SectionTitle>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-5">
          <p className="text-sm font-semibold text-stone-950">Essential for ordering</p>
          <div className="mt-4 space-y-3">
            {["Delivery address and contact", "Payment and refund support", "Fraud and safety checks", "Order status messages"].map((item) => (
              <div key={item} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm text-stone-700">
                <span>{item}</span>
                <StatusPill tone="good">Required</StatusPill>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {optionalItems.map(([key, label, description]) => (
            <Toggle
              key={key}
              checked={consent[key]}
              onChange={(value) => setConsent((current) => ({ ...current, [key]: value }))}
              label={label}
              description={description}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <PrimaryButton onClick={() => saveAction("Onboarding choices saved", "Consent", "Your selected optional purposes were saved.", "Onboarding consent")}>
          Accept selected
        </PrimaryButton>
        <SecondaryButton onClick={() => setActive("permissions")}>Manage choices</SecondaryButton>
      </div>
    </div>
  );
}

function Permissions({ consent, setConsent, saveAction, setActive }) {
  const rows = [
    {
      key: "personalisation",
      label: "Personalisation",
      description: "Recommendations, reorder shortcuts, and cuisine suggestions use your activity.",
      consequence: "Turning this off means fewer tailored rows and offers.",
    },
    {
      key: "marketing",
      label: "Marketing offers",
      description: "Promotional messages about deals and campaigns.",
      consequence: "Order, payment, and safety messages still continue.",
    },
    {
      key: "partnerOffers",
      label: "Partner offers",
      description: "Eligible offers from Swiggy programs or commercial partners.",
      consequence: "Partner promotions will be paused.",
    },
    {
      key: "locationConvenience",
      label: "Location convenience",
      description: "Use location to suggest nearby restaurants, stores, and delivery addresses.",
      consequence: "You can still order by entering an address manually.",
    },
    {
      key: "analytics",
      label: "Product improvement analytics",
      description: "Usage signals help find broken flows and improve the app.",
      consequence: "The product team receives less diagnostic signal from your usage.",
    },
  ];

  return (
    <div>
      <SectionTitle kicker="Granular permissions" title="Control data use by purpose">
        Each optional purpose has a clear benefit and consequence. Essential processing is shown separately so it is not confused with optional consent.
      </SectionTitle>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          <Toggle
            checked
            locked
            label="Essential ordering, support, and safety"
            description="Required to place orders, track delivery, handle payments, prevent fraud, and resolve support issues."
          />
          {rows.map((row) => (
            <div key={row.key} className="rounded-lg border border-stone-200 bg-white p-3">
              <Toggle
                checked={consent[row.key]}
                onChange={(value) => setConsent((current) => ({ ...current, [row.key]: value }))}
                label={row.label}
                description={row.description}
              />
              <p className="px-1 pt-3 text-xs leading-5 text-stone-500">What changes: {row.consequence}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-stone-200 bg-[#fbfaf6] p-5">
          <p className="text-sm font-semibold text-stone-950">Consent summary</p>
          <div className="mt-4 space-y-3">
            {rows.map((row) => (
              <div key={row.key} className="flex items-center justify-between gap-3 border-b border-stone-200 pb-3 last:border-b-0 last:pb-0">
                <span className="text-sm text-stone-600">{row.label}</span>
                <StatusPill tone={consent[row.key] ? "good" : "neutral"}>{consent[row.key] ? "On" : "Off"}</StatusPill>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryButton onClick={() => saveAction("Permissions saved", "Consent", "Purpose-level permissions were updated.", "Granular permissions")}>
              Save changes
            </PrimaryButton>
            <SecondaryButton onClick={() => setActive("history")}>View history</SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function Marketing({ marketing, setMarketing, saveAction }) {
  const rows = [
    ["push", "Push notifications", "Offers and recommendations inside app notifications."],
    ["email", "Email", "Campaigns, deals, and product news by email."],
    ["sms", "SMS", "Promotional text messages."],
    ["whatsapp", "WhatsApp", "Promotional messages through WhatsApp."],
    ["partner", "Partner offers", "Offers from eligible Swiggy partner programs."],
  ];

  return (
    <div>
      <SectionTitle kicker="Marketing preferences" title="Choose how offers reach you">
        Promotional channels are separate from order, payment, refund, safety, legal, and service messages.
      </SectionTitle>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <div className="space-y-3">
          {rows.map(([key, label, description]) => (
            <Toggle
              key={key}
              checked={marketing[key]}
              onChange={(value) => setMarketing((current) => ({ ...current, [key]: value }))}
              label={label}
              description={description}
            />
          ))}
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-950 p-5 text-white">
          <p className="text-sm font-semibold">Messages that continue</p>
          <p className="mt-2 text-sm leading-6 text-stone-300">
            Order updates, delivery calls, payment status, refund updates, safety alerts, and legal notices remain available because they keep the service working.
          </p>
          <PrimaryButton tone="orange" onClick={() => saveAction("Marketing saved", "Marketing", "Marketing channel preferences were updated.", "Marketing preferences")}>
            Save preferences
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Location({ locationMode, setLocationMode, nearbyOffers, setNearbyOffers, saveAction }) {
  const options = [
    ["precise", "Use precise current location", "Fastest address selection for delivery and live order context."],
    ["saved", "Use saved addresses", "Choose from home, work, or other saved addresses."],
    ["manual", "Enter address manually", "Order without using device location."],
  ];

  return (
    <div>
      <SectionTitle kicker="Location controls" title="Pick the lightest location setting that works">
        Delivery still needs a valid address. Device location is a convenience, not the only way to order.
      </SectionTitle>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-3">
          {options.map(([value, title, copy]) => (
            <button
              type="button"
              key={value}
              onClick={() => setLocationMode(value)}
              className={cx(
                "w-full rounded-lg border p-4 text-left transition",
                locationMode === value
                  ? "border-orange-300 bg-orange-50 text-stone-950"
                  : "border-stone-200 bg-white hover:border-stone-300",
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{copy}</p>
                </div>
                <span className={cx("h-4 w-4 rounded-full border", locationMode === value ? "border-orange-600 bg-orange-600" : "border-stone-300")} />
              </div>
            </button>
          ))}
          <Toggle
            checked={nearbyOffers}
            onChange={setNearbyOffers}
            label="Use location for nearby offers"
            description="Nearby deals and store suggestions can use location separately from delivery."
          />
        </div>
        <div className="rounded-lg border border-stone-200 bg-[#fbfaf6] p-5">
          <p className="text-sm font-semibold text-stone-950">Current location mode</p>
          <p className="mt-3 text-3xl font-semibold capitalize text-stone-950">{locationMode}</p>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            To change operating system permissions, open your phone settings for the Swiggy app.
          </p>
          <div className="mt-5">
            <PrimaryButton onClick={() => saveAction("Location saved", "Location", "Location controls were updated.", "Location controls")}>
              Save location settings
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataDownload({ exportId, setExportId, addHistory }) {
  const included = ["Profile details", "Saved addresses", "Order history", "Consent history", "Marketing preferences"];

  function requestExport() {
    const id = makeRequestId("EXP");
    setExportId(id);
    addHistory("Data export requested", "Data Rights", `Export request ${id} is preparing.`, "Data download");
  }

  return (
    <div>
      <SectionTitle kicker="Data download" title="Request a copy of your Swiggy data">
        The export includes account and activity data. A real implementation should verify the user before releasing the file.
      </SectionTitle>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <p className="text-sm font-semibold text-stone-950">Included in this request</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {included.map((item) => (
              <div key={item} className="rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-700">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-stone-600">
            The download link should expire, and sensitive files should require re-authentication before access.
          </p>
          <div className="mt-5">
            <PrimaryButton onClick={requestExport}>Request export</PrimaryButton>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-[#fbfaf6] p-5">
          <p className="text-sm font-semibold text-stone-950">Request status</p>
          {exportId ? (
            <div className="mt-4">
              <StatusPill tone="warn">Preparing export</StatusPill>
              <p className="mt-3 text-2xl font-semibold text-stone-950">{exportId}</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">We will show the download link here when the file is ready.</p>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-stone-600">No active export request.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteAccount({ deleteId, setDeleteId, addHistory, setActive }) {
  const [confirmed, setConfirmed] = useState(false);

  function requestDelete() {
    const id = makeRequestId("DEL");
    setDeleteId(id);
    addHistory("Account deletion requested", "Data Rights", `Deletion request ${id} is now pending.`, "Delete account");
  }

  return (
    <div>
      <SectionTitle kicker="Delete account" title="Start deletion with clear consequences">
        Deletion can affect saved addresses, order visibility, refunds, and support. Some records may be retained where legally required.
      </SectionTitle>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-950">Before you continue</p>
          <div className="mt-4 space-y-3">
            {[
              "Saved addresses and preferences may be removed.",
              "Past orders may no longer be visible in the app.",
              "Active orders, refunds, and disputes must be resolved first.",
              "Some records may be retained if required by law.",
            ].map((item) => (
              <div key={item} className="rounded-md bg-white px-3 py-2 text-sm text-red-900">
                {item}
              </div>
            ))}
          </div>
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-red-950">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
            />
            <span>I understand the consequences and want to start deletion.</span>
          </label>
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryButton tone="danger" disabled={!confirmed} onClick={requestDelete}>
              Delete account
            </PrimaryButton>
            <SecondaryButton onClick={() => setActive("permissions")}>Turn off optional data instead</SecondaryButton>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-[#fbfaf6] p-5">
          <p className="text-sm font-semibold text-stone-950">Deletion status</p>
          {deleteId ? (
            <div className="mt-4">
              <StatusPill tone="danger">Pending</StatusPill>
              <p className="mt-3 text-2xl font-semibold text-stone-950">{deleteId}</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">Use this request ID if you contact support.</p>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-stone-600">No active deletion request.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function History({ history }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Consent", "Marketing", "Data Rights", "Location"];
  const visible = filter === "All" ? history : history.filter((event) => event.type === filter);

  return (
    <div>
      <SectionTitle kicker="Consent history" title="See what changed, when, and where">
        This is the user-visible version of the consent audit trail. A production system would keep the underlying log immutable.
      </SectionTitle>

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setFilter(item)}
            className={cx(
              "rounded-full px-3 py-1.5 text-sm font-semibold transition",
              filter === item ? "bg-stone-950 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((event) => (
          <details key={event.id} className="group rounded-lg border border-stone-200 bg-white p-4">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
              <span>
                <span className="block text-sm font-semibold text-stone-950">{event.title}</span>
                <span className="mt-1 block text-xs text-stone-500">{event.date} from {event.source}</span>
              </span>
              <StatusPill>{event.type}</StatusPill>
            </summary>
            <p className="mt-3 text-sm leading-6 text-stone-600">{event.detail}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export default function SwiggyPrivacyCenter() {
  const [active, setActive] = useState("home");
  const [consent, setConsent] = useState(consentDefaults);
  const [marketing, setMarketing] = useState(marketingDefaults);
  const [locationMode, setLocationMode] = useState("saved");
  const [nearbyOffers, setNearbyOffers] = useState(false);
  const [exportId, setExportId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [toast, setToast] = useState("");
  const [history, setHistory] = useState(initialHistory);

  const nowLabel = "03 Jul 2026, just now";

  function addHistory(title, type, detail, source) {
    setHistory((current) => [
      {
        id: `h-${current.length + 1}-${Date.now()}`,
        type,
        title,
        detail,
        date: nowLabel,
        source,
      },
      ...current,
    ]);
  }

  function saveAction(title, type, detail, source) {
    setToast(title);
    addHistory(title, type, detail, source);
    window.setTimeout(() => setToast(""), 2200);
  }

  const banner = useMemo(() => {
    if (!toast) return null;
    return (
      <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 shadow-sm">
        {toast}
      </div>
    );
  }, [toast]);

  let content = null;
  if (active === "home") {
    content = <Home consent={consent} marketing={marketing} exportId={exportId} deleteId={deleteId} setActive={setActive} />;
  }
  if (active === "consent") {
    content = <ConsentScreen consent={consent} setConsent={setConsent} saveAction={saveAction} setActive={setActive} />;
  }
  if (active === "permissions") {
    content = <Permissions consent={consent} setConsent={setConsent} saveAction={saveAction} setActive={setActive} />;
  }
  if (active === "marketing") {
    content = <Marketing marketing={marketing} setMarketing={setMarketing} saveAction={saveAction} />;
  }
  if (active === "location") {
    content = (
      <Location
        locationMode={locationMode}
        setLocationMode={setLocationMode}
        nearbyOffers={nearbyOffers}
        setNearbyOffers={setNearbyOffers}
        saveAction={saveAction}
      />
    );
  }
  if (active === "download") {
    content = <DataDownload exportId={exportId} setExportId={setExportId} addHistory={addHistory} />;
  }
  if (active === "delete") {
    content = <DeleteAccount deleteId={deleteId} setDeleteId={setDeleteId} addHistory={addHistory} setActive={setActive} />;
  }
  if (active === "history") {
    content = <History history={history} />;
  }

  return (
    <AppShell active={active} setActive={setActive} banner={banner}>
      {content}
    </AppShell>
  );
}

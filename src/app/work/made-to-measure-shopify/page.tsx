import type { Metadata } from "next";
import {
  CaseShell,
  CaseHero,
  Section,
  Lead,
  Callout,
  NextCase,
} from "@/components/work/casestudy";
import { AutoCycle, BrowserWindow, PhoneWindow } from "@/components/mockups/frame";
import { ACCENT } from "@/components/mockups/accent";
import {
  ShopifyWeb1,
  ShopifyWeb2,
  ShopifyWeb3,
  ShopifyWeb4,
  ShopifyMobile1,
  ShopifyMobile2,
  ShopifyMobile3,
} from "@/components/mockups/shopify";

export const metadata: Metadata = {
  title: "Made-to-Measure Shopify Platform · Case study · Rafii Manggala",
  description:
    "A body-measurement pattern-fitting system built into a Shopify theme, plus ten Klaviyo flows that replaced every default transactional email.",
};

const accent = ACCENT.mint;

/* ---- small in-page diagram + system bits (presentational, no client screenshots) ---- */

function PatternFlow() {
  const steps = ["Get Fitted", "Edit Pattern", "Save As New", "Select Other", "Add to Cart"];
  return (
    <div className="mt-8 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface-1 p-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span className="rounded-full border border-line-strong bg-surface-2 px-4 py-2 text-sm text-fg">
            {s}
          </span>
          {i < steps.length - 1 ? (
            <span className="text-mute" aria-hidden>
              &rarr;
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function FlowStatus({ flows }: { flows: string[] }) {
  return (
    <div className="mt-8 grid gap-2.5 rounded-2xl border border-line bg-surface-1 p-6 sm:grid-cols-2">
      {flows.map((f) => (
        <div key={f} className="flex items-center gap-3">
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
          <span className="text-sm text-fg">{f}</span>
          <span className="mono ml-auto text-xs text-mute">live</span>
        </div>
      ))}
    </div>
  );
}

function Columns2({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 grid gap-4 sm:grid-cols-2">{children}</div>;
}
function Mini({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-1 p-5">
      <div className="text-sm font-medium text-fg">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-dim">{body}</p>
    </div>
  );
}

export default function MadeToMeasureShopifyCase() {
  return (
    <CaseShell>
      <CaseHero
        eyebrow="Shopify · Engineering case study"
        title="Made-to-Measure Shopify Platform"
        subtitle="A body-measurement pattern-fitting system built into a Shopify theme, plus a full email-automation program that replaced every default transactional email with ten custom, on-brand flows."
        meta={[
          { label: "Role", value: "Shopify theme dev + email automation" },
          { label: "Client", value: "AU made-to-measure fashion brand" },
          { label: "Platform", value: "Shopify · Liquid (live)" },
          { label: "Tools", value: "Liquid, JS, Klaviyo API, Shopify CLI" },
        ]}
      />

      <div className="mt-8">
        <BrowserWindow label="shop &middot; get fitted &middot; pattern editor" accent={accent}>
          <AutoCycle
            accent={accent}
            screens={[
              <ShopifyWeb1 key="1" accent={accent} />,
              <ShopifyWeb2 key="2" accent={accent} />,
              <ShopifyWeb4 key="4" accent={accent} />,
              <ShopifyWeb3 key="3" accent={accent} />,
            ]}
          />
        </BrowserWindow>
        <p className="mt-3 text-sm text-mute">
          An illustrated recreation of the storefront, not real screenshots.
          This is an NDA client engagement. No brand name, logo, or
          product photography is reproduced anywhere on this page.
        </p>
      </div>

      <Section n="01" kicker="Problem" title="A generic theme can't fit a made-to-measure product.">
        <Lead>
          The brand sells made-to-measure shirts and suits. A customer&apos;s
          fit data (band, cup, height, sleeve, collar, and more) lives in a
          separate pattern-matching service, not in Shopify. The stock theme
          had no concept of it: no way to show a customer their saved
          patterns, edit one, or stop an add-to-cart that had no valid fit
          data behind it.
        </Lead>
        <Callout title="The constraint">
          Every read and write had to go through an external REST API the
          theme didn&apos;t control, inside a pure Liquid + vanilla-JS theme
          with no build pipeline. No React, no bundler, no shortcuts.
        </Callout>
      </Section>

      <Section n="02" kicker="Goal" title="Turn a stock theme into a fitting workstation.">
        <Lead>
          The editor had to live inline on the product page, not in a
          separate app tab, and had to survive real customer behaviour:
          renaming a pattern, cloning one instead of overwriting it, bailing
          out mid-edit, and switching between a saved pattern and a fresh
          fitting without ever showing a broken state.
        </Lead>
      </Section>

      <Section n="03" kicker="Editor" title="An inline pattern editor, wired to an external API.">
        <Lead>
          The flow below is the spine of the feature: a customer gets fitted
          once, then can reopen, tweak, rename, or clone that pattern
          straight from the product page.
        </Lead>
        <PatternFlow />
        <Columns2>
          <Mini
            title="Save As New, not overwrite"
            body="Cloning a pattern auto-renames it (date-stamped, with an incrementing suffix) instead of silently overwriting the original submission."
          />
          <Mini
            title="Gender filter that never blocks"
            body="Patterns are filtered to the product's gender when a match exists, but fall back to showing everything rather than hiding the editor when the account has none. A stricter version shipped first and was rolled back after it hid the dropdown too aggressively."
          />
        </Columns2>
      </Section>

      <Section n="04" kicker="Debugging" title="The theme bugs were in the small print.">
        <Lead>
          A login redirect bug traced back to three copies of the same
          broken helper function layered on top of each other in the theme
          layout, each fighting the others with <code>!important</code>{" "}
          overrides. A &quot;preferred store&quot; menu going blank turned
          out to be a metafield-only lookup with no fallback, fixed with a
          local-storage read the profile page was already writing to.
        </Lead>
        <Callout title="Trust the deployed bytes, not your browser">
          A font-size change looked stuck at 12px in the browser no matter
          what shipped. Rather than chase a phantom CSS bug, the fix was
          verified against a raw pull of the live theme and the CDN asset
          bytes directly. It was rendering correctly. The browser&apos;s
          local rendering was the outlier, not the deploy.
        </Callout>
      </Section>

      <Section n="05" kicker="Email automation" title="Ten Klaviyo flows replaced Shopify's defaults.">
        <Lead>
          Order confirmation, shipping, delivery, in-store collection, store
          pickup ready, password reset, welcome, account activation, and two
          appointment flows, all rebuilt as dynamic templates mapped to real
          Shopify order and customer data: line items, addresses, payment
          method, and per-item variant options like collar and cuff style.
        </Lead>
        <FlowStatus
          flows={[
            "Order Confirmation",
            "Shipping Notification",
            "Delivery Confirmation",
            "Order Collected",
            "Store Collection Ready",
            "Welcome Email",
            "Account Activation",
            "Password Reset",
            "Appointment Confirmation",
            "Appointment Reminder",
          ]}
        />
      </Section>

      <Section n="06" kicker="On the phone" title="Get fitted from a phone, not just a desk.">
        <Lead>
          Most customers start the fitting flow on mobile. The configurator
          and collection grid both reflow to a single column, with the same
          add-to-cart gating logic underneath.
        </Lead>
        <div className="mt-8 max-w-[280px]">
          <PhoneWindow accent={accent}>
            <AutoCycle
              accent={accent}
              screens={[
                <ShopifyMobile1 key="1" accent={accent} />,
                <ShopifyMobile3 key="3" accent={accent} />,
                <ShopifyMobile2 key="2" accent={accent} />,
              ]}
            />
          </PhoneWindow>
        </div>
      </Section>

      <Section n="07" kicker="Outcome" title="Shipped, live, and still evolving.">
        <Lead>
          The fitting editor and all ten email flows are live in production.
          Every theme push went out behind a full backup and a git tag, so
          every round of client feedback could ship the same day without
          risking the storefront. It&apos;s an ongoing engagement: new
          rounds of fixes and refinements still come in and go out the same
          way.
        </Lead>
      </Section>

      <NextCase href="/work/spotter-eld" label="Next case study" title="Spotter ELD" />
    </CaseShell>
  );
}

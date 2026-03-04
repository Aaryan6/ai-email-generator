export type EmailCategoryPromptKey =
  | "marketing_newsletter"
  | "product_launch"
  | "cold_outreach_b2b"
  | "follow_up_nurture"
  | "promo_offer"
  | "transactional_update";

export const SAAS_EMAIL_CATEGORY_PROMPTS: Record<
  EmailCategoryPromptKey,
  string
> = {
  marketing_newsletter: `Category: Marketing Newsletter

Goal: maximize qualified clicks and ongoing engagement.

Rules:
- Use an inverted-pyramid flow: hook -> value -> CTA.
- Keep tone editorial and useful, not pushy.
- Use one featured section and up to 2-3 supporting sections.
- Keep one primary CTA; secondary links can be text links.
- Include a clean footer with unsubscribe/manage preferences.

Copy guidance:
- Lead with a benefit-first headline.
- Use short, skimmable blocks.
- Use credibility cues (e.g., proof, customer signal, practical takeaway).
`,

  product_launch: `Category: Product Launch

Goal: drive awareness and first-click adoption of a new feature/product.

Rules:
- Structure as: announcement -> why it matters -> how it helps -> CTA.
- Focus on outcome over technical details.
- Include one optional product visual if available; do not depend on it.
- Keep announcement urgency real (no fake scarcity).

Copy guidance:
- Use clear naming for the release.
- Explain user benefit in plain language.
- CTA should be action-specific (e.g., "Try the new dashboard").
`,

  cold_outreach_b2b: `Category: Cold Outreach (B2B Sales)

Goal: get a human reply or a meeting.

Rules:
- Keep layout plain and minimal (text-first, low-design).
- Avoid hero images, promotional banners, and heavy styling.
- Keep total copy short (roughly 80-150 words unless user asks otherwise).
- Use one friction-light CTA (reply or short call).

Copy guidance:
- Personalize by role/problem context.
- Use pain -> insight -> low-friction ask.
- Prefer direct language over marketing language.
`,

  follow_up_nurture: `Category: Follow-up / Nurture

Goal: move the lead to next step through trust and relevance.

Rules:
- Acknowledge prior context (signup, download, no response, etc.).
- Deliver one practical value nugget before asking for action.
- Keep cadence-friendly tone: helpful, calm, non-aggressive.
- Use one primary CTA and optional secondary resource link.

Copy guidance:
- Use short educational framing.
- Emphasize next best action, not multiple asks.
`,

  promo_offer: `Category: Promotional Offer

Goal: convert with a clear offer while staying credible.

Rules:
- Structure: offer headline -> value bullets -> terms/deadline -> CTA.
- If urgency is used, it must be concrete and believable.
- Keep design bold but clean; do not overload with multiple promos.
- Use one primary CTA and concise terms text.

Copy guidance:
- State exact offer early.
- Use clarity over hype.
- Reinforce risk reduction if possible (trial, guarantee, cancel anytime).
`,

  transactional_update: `Category: Transactional Update

Goal: communicate critical account/order information quickly.

Rules:
- Prioritize clarity over marketing design.
- Surface key facts first (status, order id, date, amount, next step).
- Keep message concise and unambiguous.
- Marketing content should be minimal or absent.

Copy guidance:
- Use direct subject-aligned language.
- Include support/contact path for issue resolution.
`,
};

export const buildCategoryPrompt = (
  category?: string | null,
): string | null => {
  if (!category) {
    return null;
  }

  const normalized = category.trim().toLowerCase() as EmailCategoryPromptKey;
  return SAAS_EMAIL_CATEGORY_PROMPTS[normalized] ?? null;
};

# Proven Principles Used in Prompt Design

This document captures practical rules used to shape the SaaS email prompts for sales and marketing use cases.

## Why these principles

The prompt set is optimized around repeated recommendations from email-focused sources and existing React Email guidance already present in this repository.

## Core principles integrated into prompts

1. One email, one goal, one primary CTA.
2. Scannable structure beats dense prose (short blocks, clear hierarchy, whitespace).
3. Mobile-safe layouts and readable typography are non-negotiable.
4. Avoid image-only messages; keep key content as live text.
5. Use explicit preview text to support subject line intent.
6. Keep footer compliance elements visible for marketing messages.
7. Prefer modular sections and reusable patterns for consistency and speed.

## How this maps to our prompt architecture

- Master prompt enforces technical correctness + universal conversion/design guardrails.
- Category prompts inject campaign intent and tone:
  - marketing newsletter
  - product launch
  - cold outreach (B2B)
  - follow-up nurture
  - promotional offer
  - transactional update

## External references reviewed

- Litmus article on email design best practices:
  - https://www.litmus.com/blog/email-design-best-practices
- Mailtrap article on email marketing best practices:
  - https://mailtrap.io/blog/email-marketing-best-practices/
- Omnisend article on email marketing best practices:
  - https://www.omnisend.com/blog/email-marketing-best-practices/

## Implementation note

Use the master prompt as the constant system layer. Inject a single category prompt per request based on selected template intent. Keep category blocks small and outcome-focused to reduce model drift.

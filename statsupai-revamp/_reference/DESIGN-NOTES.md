# Design system — decisions & rationale

No screenshot tooling in this env; design is heuristic-driven from
established patterns (Stripe/Linear/Vercel docs-grade clarity; academic
seminar sites like simons.berkeley.edu, IMS, NeurIPS for density norms).

## Principles
1. **Editorial, not flashy.** Academic audience → trust via typography,
   whitespace, restraint. Teal accent only for emphasis/wayfinding.
2. **Progressive disclosure.** Long-form (abstracts/bios) collapsed by
   default; expand on intent. Cards stay scannable.
3. **Color = meaning, not decoration.** Series = stable hue (Health=teal,
   GenAI=indigo). Status (Upcoming/Past) = weight/affordance, not noise.
4. **Information scent.** Every card answers who/what/when/where-to-go
   before expansion. Platform icons (Zoom/YouTube) give at-a-glance medium.
5. **Logo is identity.** Real StatsUpAI logo in the brand lockup — never
   discard. Gradient mark retained only as favicon.
6. **Accessibility is non-negotiable.** Disclosure = real <details>/<button>
   semantics, focus-visible, reduced-motion, color-contrast AA.
7. **Durability.** Content data-driven from JSON; pages render it. Reference
   warehouse (`_reference/`) is the memory.

## Events card anatomy
[series chip][date · time ET][status] — H3 title — speaker · affiliation
(linked to personal site) — platform icon row — ▸ Abstract (collapsed) — ▸
Speaker bio (collapsed) — actions: Register / Add to calendar / Watch.

## Tokens (in main.css :root)
Reuse existing teal scale. Add `--indigo-*` for GenAI series. Keep one
shadow, one radius scale, 8px spacing rhythm.

# Benefit Hunter

A free tool and setup kit that helps founders find, qualify for, and apply to startup
benefit programs — credits, community licenses, and worthy discounts — and apply to
them in the order that maximizes referral leverage.

Live at **[benefits.jami.studio](https://benefits.jami.studio)**. Built and maintained
by [Jami Studio](https://www.jami.studio).

## What it does

- **Finds** programs and matches them against a lightweight profile so you see the
  specific benefits — and total dollar value — you qualify for.
- **Guides** an umbrella-first application order (multi-vendor packs and referral hubs
  first) so one acceptance unlocks the next.
- **Provides** de-identified example application copy you can adapt — or hand to your
  own coding agent to redraft for your project.
- **Shows** the real dollar value Jami Studio actually secured, organized by stack.

Runs entirely in your browser with local storage. No account required.

## Repository layout

```
apps/hunter/   # the Benefit Hunter web app (Vite/React static site)
docs/          # durable docs, architecture, and dated roadmaps
```

Start with [docs/README.md](./docs/README.md) for the product vision, architecture,
and build roadmaps.

## Development

```bash
cd apps/hunter
npm install
npm run dev
```

Production build outputs to `apps/hunter/dist` and deploys to Vercel as a static site.
See [docs/operations/deployment-and-domains.md](./docs/operations/deployment-and-domains.md).

## Contributing and accuracy

Benefit values, eligibility, and freshness are sourced and dated. Programs change —
always confirm terms on the vendor's official page (linked from each program) before
applying. Any referral or affiliate relationship is disclosed.

## License

TBD.

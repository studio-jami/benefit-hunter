# AWS Activate Founders — Application Archetype

## What this program wants

- **Form shape:** one critical free-text field — "What are you building?" — with a hard **250-character limit**, plus company basics.
- **Tone:** dense, technical, zero fluff. Every character earns its place.
- **What wins:** a one-line product identity + an explicit list of the AWS services you will actually consume. AWS wants to see credits turning into usage.
- **Prerequisites they check:** AWS Builder ID, business email on the application, the correct AWS account linked and verified in the console, a payment method on file, and a live company website.

## Templated answer

**What are you building? (≤250 chars — count them)**

```
{{company_name}} is {{one_liner}}. On AWS: [list the 6–10 AWS services you
will genuinely use, e.g. Bedrock, Lambda, ECS, RDS Postgres, S3, CloudFront,
API Gateway, SQS, EventBridge, CloudWatch].
```

**Longer reference (for other fields or reviewer notes)**

```
{{description}}

{{use_case_cloud}}

Founder: {{first_name}} {{last_name}}, {{role_title}}. Website: {{website}}.
```

## Pre-submit checklist (from a successful application)

- [ ] AWS Builder ID + business email ({{email}}) on the application
- [ ] Correct AWS account linked and verified in the console before submit
- [ ] Paid-tier AWS account with valid payment method on file
- [ ] Company website live at {{website}}

## Redraft instructions (hand to your agent verbatim)

> Rewrite the "What are you building?" answer for my company using my profile
> fields. Hard limit 250 characters — verify the count. Lead with the product
> identity from `one_liner`, then name only AWS services we will really use
> (from `use_case_cloud`). No adjectives, no mission statements, no markdown.
> Produce two variants and report the character count of each.

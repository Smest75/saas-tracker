export const IMPORT_PROMPT = `Extract subscription details from the purchase/confirmation email below and return ONLY a JSON object with this exact structure — no explanation, no markdown, just raw JSON:

{
  "name": "Service name",
  "url": "https://...",
  "price": 0.00,
  "currency": "USD",
  "billing_cycle": "monthly | yearly | quarterly | one-time",
  "next_renewal": "YYYY-MM-DD",
  "email": "account email or username",
  "is_trial": false,
  "trial_end_date": null,
  "comment": ""
}

Rules:
- Derive next_renewal from the purchase date and billing cycle in the email
- If it is a free trial, set is_trial to true and trial_end_date to the trial end date
- If a field cannot be determined, use null
- Leave comment as empty string
- Use the exact domain from the email sender or links for url

--- EMAIL BELOW ---`

# ITCS Diagnostic

A self-contained, responsive ITCS initial diagnostic website. It has no build step, backend, dependencies, cookies, or account requirement: serve this directory with any static web server and open `index.html`.

## Run locally

For example, from this directory run `python -m http.server 8000` and visit `http://localhost:8000`.

## Form, results, and privacy

The form follows the attached 20-question ITCS discovery assessment, including its prompts, four areas, metadata, priorities, and suggested closing question. Each response can be rated 0–5 using the assessment's scoring definitions, or N/A, with an optional note. The area and overall scores add only applicable (0–5) responses to the denominator: points earned divided by the applicable maximum, expressed as a percentage. Unanswered questions are not treated as N/A. Results are calculated in the browser and are not submitted or saved to a server.

**Download PDF** creates a report locally in the browser. **Prepare email** opens the user's default email app with the result summary; the user reviews and sends it themselves. The email does not automatically attach the PDF, so the interface asks the user to attach the downloaded report. There is no email backend or automatic sending.

This screening is not a technical audit, security certification, or compliance assessment. Scores are preliminary and based on client statements.

## Branding and assets

The page uses the ITCS Developers logo artwork from the public site, plus a technology photograph hosted by Unsplash. Google Fonts are loaded from Google Fonts; system sans-serif fallbacks are provided.

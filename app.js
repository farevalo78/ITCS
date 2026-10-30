const questionGroups = [
  {
    title: "IT Infrastructure & Connectivity",
    subtitle: "The systems, devices, and connections your team relies on.",
    questions: [
      ["Is your internet connection reliable enough for daily office and field operations?", "Ask about outages, backup connection and affected work."],
      ["Does Wi-Fi reliably cover the office, warehouse and workshop areas where it is needed?", "Ask about dead zones and guest access."],
      ["Are routers, switches and firewalls inventoried, supported and maintained?", "Ask who manages them and when they were last reviewed."],
      ["Are computers and mobile devices updated and maintained regularly?", "Ask about device age, updates and recurring problems."],
      ["Can field teams securely access the files and applications they need?", "Ask about remote access and jobsite connectivity."]
    ]
  },
  {
    title: "Cybersecurity, Data & Communications",
    subtitle: "The safeguards and communication routines that protect your work.",
    questions: [
      ["Are important files backed up automatically and are restores tested?", "Ask which plans, quotes and project documents are protected."],
      ["Do employees use multifactor authentication for email and critical applications?", "Ask about accounts with privileged access."],
      ["Are user accounts and permissions reviewed when employees join or leave?", "Ask about shared accounts and offboarding."],
      ["Is there a clear contact and response process when an IT problem occurs?", "Ask who responds and typical business impact."],
      ["Do office staff and installers have reliable business communication tools?", "Ask about calls, shared inboxes and missed messages."]
    ]
  },
  {
    title: "Project & Field Operations",
    subtitle: "The information and coordination that keep jobs moving.",
    questions: [
      ["Can management see the current status of all active jobs in one place?", "Ask for examples of delayed or untracked jobs."],
      ["Are estimates and quotations tracked until approval or rejection?", "Ask how many follow-ups are missed."],
      ["Are installation dates, crews and materials coordinated in a shared process?", "Ask about rescheduling and material shortages."],
      ["Can field staff access current drawings, instructions and job photos?", "Ask how version changes are communicated."],
      ["Are job changes, customer approvals and issues documented consistently?", "Ask about change orders and disputes."]
    ]
  },
  {
    title: "Administration, Automation & Visibility",
    subtitle: "The workflows and visibility that help your business run smoothly.",
    questions: [
      ["Are invoices and outstanding payments monitored through a defined workflow?", "Ask about overdue accounts and reminders."],
      ["Is customer and project information entered once rather than repeatedly?", "Ask about duplicate entry across Excel and other tools."],
      ["Are routine reminders and follow-ups automated where useful?", "Ask about repetitive emails and manual tasks."],
      ["Does management review basic KPIs such as jobs pending, overdue tasks and collections?", "Ask which numbers they trust and how often they update."],
      ["Is there a documented process for onboarding new employees to tools and workflows?", "Ask about training and dependence on one person."]
    ]
  }
];

const scoringGuide = "0 Not in place · 1 Very limited · 2 Inconsistent · 3 Basic · 4 Established · 5 Consistent and documented · N/A Not applicable (excluded from denominator)";
const form = document.getElementById("diagnosticForm");
const groupsContainer = document.getElementById("questionGroups");
const resultsSection = document.getElementById("results");
const progressCount = document.getElementById("progressCount");
const progressBar = document.getElementById("progressBar");
let latestReport = null;

function renderQuestions() {
  let number = 0;
  groupsContainer.innerHTML = questionGroups.map((group, groupIndex) => {
    const questions = group.questions.map(([prompt, followup]) => {
      number += 1;
      const id = `q${number}`;
      const ratings = [0, 1, 2, 3, 4, 5, "na"].map((rating) => {
        const label = rating === "na" ? "N/A" : String(rating);
        const value = rating === "na" ? "na" : String(rating);
        return `<label class="rating-option"><input type="radio" name="${id}" value="${value}" aria-label="Question ${String(number).padStart(2, "0")}: ${label}"${rating === 0 ? " required" : ""}><span>${label}</span></label>`;
      }).join("");
      return `<article class="question-row" data-question="${number}">
        <div class="question-top">
          <div class="question-prompt"><span class="question-number">${String(number).padStart(2, "0")}</span><p>${prompt}</p></div>
          <div class="rating-controls">
            <div class="scale-labels"><span>NOT IN PLACE</span><span>CONSISTENT &amp; DOCUMENTED</span></div>
            <div class="rating-options" role="radiogroup" aria-label="Rate: ${prompt}">${ratings}</div>
          </div>
        </div>
        <label class="question-notes"><span>${followup}</span><input name="${id}Note" maxlength="300" aria-label="Optional notes for question ${number}" placeholder="Optional notes"></label>
      </article>`;
    }).join("");
    return `<section class="question-group" aria-labelledby="group${groupIndex}Title">
      <div class="group-header"><div class="panel-number">${String(groupIndex + 1).padStart(2, "0")}</div><div class="group-title"><h3 id="group${groupIndex}Title">${group.title}</h3><p>${group.subtitle}</p><p class="scoring-guide">${scoringGuide}</p></div></div>
      ${questions}
    </section>`;
  }).join("");
}

function getAnswers() {
  return questionGroups.map((group, groupIndex) => ({
    title: group.title,
    questions: group.questions.map(([prompt, followup], questionIndex) => {
      const number = groupIndex * 5 + questionIndex + 1;
      const selected = form.querySelector(`input[name="q${number}"]:checked`);
      return {
        number,
        prompt,
        followup,
        score: selected ? selected.value : "",
        note: form.elements[`q${number}Note`].value.trim()
      };
    })
  }));
}

function updateProgress() {
  const answered = getAnswers().flatMap((group) => group.questions).filter((question) => question.score !== "").length;
  progressCount.innerHTML = `${answered} <small>/ 20</small>`;
  progressBar.style.width = `${answered * 5}%`;
}

function getReport() {
  const data = new FormData(form);
  const groups = getAnswers().map((group) => {
    const rated = group.questions.filter((question) => question.score !== "" && question.score !== "na");
    const total = rated.reduce((sum, question) => sum + Number(question.score), 0);
    const maximum = rated.length * 5;
    return {
      ...group,
      total,
      maximum,
      percent: maximum ? Math.round((total / maximum) * 100) : null,
      applicable: rated.length
    };
  });
  const applicable = groups.reduce((sum, group) => sum + group.applicable, 0);
  const total = groups.reduce((sum, group) => sum + group.total, 0);
  const maximum = groups.reduce((sum, group) => sum + group.maximum, 0);
  const lowestScores = groups.flatMap((group) => group.questions
    .filter((question) => question.score !== "" && question.score !== "na")
    .map((question) => ({ ...question, group: group.title, value: Number(question.score) })))
    .sort((a, b) => a.value - b.value || a.number - b.number);
  const enteredOpportunities = [1, 2, 3]
    .map((index) => data.get(`opportunity${index}`).trim())
    .filter(Boolean);
  const opportunities = enteredOpportunities.map((text) => ({ text, source: "Client-identified" }));
  for (const question of lowestScores) {
    if (opportunities.length >= 3) break;
    if (opportunities.some((item) => item.question?.number === question.number)) continue;
    opportunities.push({ text: `${question.prompt} (${question.value}/5)`, source: "Lowest-rated response", question });
  }
  return {
    company: data.get("company").trim(),
    contact: data.get("contact").trim(),
    date: data.get("date"),
    interviewer: data.get("interviewer").trim(),
    phone: data.get("phone").trim(),
    email: data.get("email").trim(),
    priority: data.get("priority").trim(),
    followupDate: data.get("followupDate"),
    nextStep: data.get("nextStep") || "Not selected",
    groups,
    opportunities,
    total,
    maximum,
    applicable,
    overallPercent: maximum ? Math.round((total / maximum) * 100) : 0
  };
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function formatDate(value) {
  if (!value) return "Not specified";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function displayResults(report) {
  document.getElementById("overallScore").textContent = String(report.overallPercent);
  document.getElementById("resultsIntro").textContent = `${report.company} · ${report.contact} · ${formatDate(report.date)}. ${report.applicable} of 20 questions were scored; N/A responses are excluded from the applicable maximum.`;
  document.getElementById("scoreGrid").innerHTML = report.groups.map((group) => `
    <article class="score-card">
      <h3>${escapeHTML(group.title)}</h3>
      <div class="score-card-score"><span>${group.total}<small> / ${group.maximum}</small></span><small>${group.percent === null ? "No score" : `${group.percent}%`}</small></div>
      <div class="score-bar"><span style="width:${group.percent ?? 0}%"></span></div>
      <div class="score-card-foot">${group.applicable} applicable question${group.applicable === 1 ? "" : "s"} · ${group.questions.length - group.applicable} N/A</div>
    </article>`).join("");
  const opportunityList = document.getElementById("opportunityList");
  opportunityList.innerHTML = report.opportunities.length
    ? report.opportunities.map((item) => `<li>${escapeHTML(item.text)} <small>(${escapeHTML(item.source)})</small></li>`).join("")
    : "<li>No scored answers yet. Review your responses for priorities to explore.</li>";
  document.getElementById("nextStepResult").textContent = report.nextStep;
  const details = [];
  if (report.priority) details.push(["Client priority / timing", report.priority]);
  if (report.followupDate) details.push(["Follow-up date", formatDate(report.followupDate)]);
  if (report.interviewer) details.push(["Interviewer", report.interviewer]);
  document.getElementById("followupDetails").innerHTML = details.length
    ? details.map(([label, value]) => `<dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd>`).join("")
    : "<dt>Follow-up</dt><dd>No details specified</dd>";
  resultsSection.hidden = false;
  latestReport = report;
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function printableText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wrapText(text, maxChars = 91) {
  const words = printableText(text).split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    if (line && `${line} ${word}`.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function pdfEscape(text) {
  return printableText(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createPdf(report) {
  const pages = [[]];
  let y = 750;
  let currentPage = pages[0];
  function add(text, { size = 10, bold = false, color = "0.12 0.20 0.27", gap = 14, maxChars = size > 15 ? 45 : 91 } = {}) {
    for (const line of wrapText(text, maxChars)) {
      if (y < 62) {
        pages.push([]);
        currentPage = pages[pages.length - 1];
        y = 750;
      }
      currentPage.push({ text: line, y, size, bold, color });
      y -= gap;
    }
  }
  add("ITCS DIAGNOSTIC", { size: 22, bold: true, color: "0.02 0.43 0.40", gap: 28, maxChars: 45 });
  add("Infrastructure - Automation - Operation", { size: 11, color: "0.27 0.36 0.43" });
  add("Smart Technology. Real Impact.", { size: 9, color: "0.35 0.44 0.50", gap: 21 });
  add("FREE BUSINESS TECHNOLOGY & OPERATIONS CHECK", { size: 14, bold: true, gap: 21, maxChars: 55 });
  add(`Company: ${report.company}    Contact: ${report.contact}`, { size: 10 });
  add(`Date: ${formatDate(report.date)}    Interviewer: ${report.interviewer || "Not specified"}`, { size: 10 });
  add(`Phone: ${report.phone || "Not specified"}    Email: ${report.email || "Not specified"}`, { size: 10, gap: 20 });
  add(`OVERALL SCORE: ${report.overallPercent} / 100`, { size: 14, bold: true, color: "0.02 0.43 0.40", gap: 18, maxChars: 60 });
  add(`${report.total} points out of ${report.maximum} applicable points; ${report.applicable} of 20 questions scored. N/A responses are excluded.`, { size: 9, gap: 21 });
  for (const group of report.groups) {
    add(group.title, { size: 12, bold: true, color: "0.02 0.43 0.40", gap: 17, maxChars: 70 });
    add(`Area score: ${group.total} / ${group.maximum} (${group.percent === null ? "no applicable responses" : `${group.percent}%`}) · ${group.applicable} applicable · ${group.questions.length - group.applicable} N/A`, { size: 9, gap: 15 });
    for (const question of group.questions) {
      const rating = question.score === "na" ? "N/A" : question.score === "" ? "Not answered" : `${question.score} / 5`;
      add(`${String(question.number).padStart(2, "0")}. ${question.prompt} [${rating}]`, { size: 9, gap: 12, maxChars: 95 });
      add(`Prompt: ${question.followup}`, { size: 8, color: "0.34 0.42 0.48", gap: 11, maxChars: 95 });
      if (question.note) add(`Notes: ${question.note}`, { size: 8, color: "0.34 0.42 0.48", gap: 11, maxChars: 95 });
    }
    y -= 6;
  }
  add("TOP OPPORTUNITIES TO EXPLORE", { size: 12, bold: true, color: "0.02 0.43 0.40", gap: 18, maxChars: 65 });
  if (report.opportunities.length) report.opportunities.forEach((opportunity, index) => add(`${index + 1}. ${opportunity.text}`, { size: 9, gap: 13, maxChars: 95 }));
  else add("No top opportunities provided.", { size: 9 });
  add("NEXT STEP & FOLLOW-UP", { size: 12, bold: true, color: "0.02 0.43 0.40", gap: 18, maxChars: 65 });
  add(`Recommended next step: ${report.nextStep}`, { size: 9 });
  add(`Client priority / timing: ${report.priority || "Not specified"}`, { size: 9 });
  add(`Follow-up date: ${formatDate(report.followupDate)}`, { size: 9, gap: 18 });
  add("IMPORTANT DISCLAIMER", { size: 10, bold: true, gap: 15, maxChars: 65 });
  add("This is a self-reported screening tool, not a technical audit, security certification, or compliance assessment. Scores are preliminary and based on client statements.", { size: 8, color: "0.27 0.36 0.43", gap: 11, maxChars: 105 });

  const objects = [];
  const addObject = (content) => (objects.push(content), objects.length);
  const catalogId = addObject("");
  const pagesId = addObject("");
  const regularFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const pageIds = [];
  pages.forEach((lines, index) => {
    const stream = lines.map((item) => `BT /${item.bold ? "F2" : "F1"} ${item.size} Tf ${item.color} rg 48 ${item.y} Td (${pdfEscape(item.text)}) Tj ET\n`).join("")
      + `BT /F1 8 Tf 0.40 0.47 0.53 rg 48 35 Td (ITCS Diagnostic  |  Page ${index + 1} of ${pages.length}) Tj ET\n`;
    const streamId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
    pageIds.push(addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${streamId} 0 R >>`));
  });
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function downloadReport() {
  if (!latestReport) return;
  const url = URL.createObjectURL(createPdf(latestReport));
  const link = document.createElement("a");
  const companySlug = printableText(latestReport.company).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "company";
  link.href = url;
  link.download = `ITCS-Diagnostic-${companySlug}-${latestReport.date || "report"}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function emailReport() {
  if (!latestReport) return;
  const report = latestReport;
  const breakdown = report.groups.map((group) => `${group.title}: ${group.total}/${group.maximum} (${group.percent === null ? "no applicable responses" : `${group.percent}%`})`).join("\n");
  const top = report.opportunities.map((item, index) => `${index + 1}. ${item.text}`).join("\n") || "No top opportunities provided.";
  const body = [
    `ITCS Diagnostic results for ${report.company}`,
    `Contact: ${report.contact} | Date: ${formatDate(report.date)}`,
    `Overall score: ${report.overallPercent}/100 (${report.total}/${report.maximum} applicable points; ${report.applicable} of 20 questions scored)`,
    "",
    "Area scores:",
    breakdown,
    "",
    "Top opportunities to explore:",
    top,
    "",
    `Recommended next step: ${report.nextStep}`,
    `Client priority / timing: ${report.priority || "Not specified"}`,
    `Follow-up date: ${formatDate(report.followupDate)}`,
    "",
    "Please attach the downloaded diagnostic PDF for the complete question-by-question results and notes.",
    "",
    "This self-reported screening is not a technical audit, security certification, or compliance assessment.",
    "",
    "This email was prepared on your device. Review it and press Send in your email app to share the results."
  ].join("\n");
  const subject = `ITCS Diagnostic Results - ${report.company}`;
  document.getElementById("emailDisclosure").hidden = false;
  window.location.href = `mailto:sales@itcsdevelopers.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

renderQuestions();
const today = new Date();
form.elements.date.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
form.addEventListener("change", updateProgress);
form.addEventListener("input", updateProgress);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  displayResults(getReport());
});
document.getElementById("downloadPdf").addEventListener("click", downloadReport);
document.getElementById("emailResults").addEventListener("click", emailReport);
document.getElementById("editAnswers").addEventListener("click", () => {
  resultsSection.hidden = true;
  document.getElementById("diagnostic").scrollIntoView({ behavior: "smooth", block: "start" });
});

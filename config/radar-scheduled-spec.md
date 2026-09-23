# Academic Research Radar — Scheduled task specification

This file is the source of truth for the daily ChatGPT Scheduled task that maintains `ktdhhc/academic-research-radar`.

## Research scope
Maintain a daily academic radar covering four areas:
1. AI Agent / Agentic Systems — agent architecture, planning, reasoning, reflection, tool use, memory, context management, long-horizon agents, multi-agent, coding agents, computer-use agents, agent evaluation.
2. Agent Harness & infrastructure — agent runtime, execution loop, trajectory management, sandbox, orchestration, verification, context engineering, observability, protocol/interoperability, skill/tool abstraction, reliability, failure recovery, evaluation infrastructure.
3. AI × office / knowledge work — AI productivity, office agents, workplace AI, enterprise copilots, document/spreadsheet/presentation agents, email/meeting/calendar assistants, knowledge work, human-AI collaboration, enterprise workflow automation, office HCI/UX.
4. Human-AI Interaction / AI product interaction — human-AI interaction, intelligent user interfaces, human-agent interaction, agentic interfaces, generative-AI interaction, AI UX, mixed initiative, proactive AI, autonomy & human control, intent elicitation, correction/feedback, trust and reliance calibration, adaptive/personalized interfaces, AI error recovery, interaction patterns and AI UX evaluation. Pay special attention to when agents should act proactively, ask or confirm, expose plans/status, allow intervention/takeover/undo, support correction, express uncertainty, and establish appropriate trust.

Prefer research published in the last 1–2 months, but research value outranks recency. Prioritize arXiv, OpenReview, ACL Anthology, ICLR, ICML, NeurIPS, ACL, EMNLP, NAACL, COLM, CHI, CSCW, UIST, ACM IUI and high-quality journals.

## Selection
Recommend 1–3 papers per day, quality over quota. At least one paper must be formally accepted/published at a top conference or top journal, and must be explicitly marked `【顶会/顶刊收录：名称】`. Never label under-review, arXiv-only or ordinary workshop papers as top-conference/journal papers.

Evaluate papers using venue/peer review, OpenReview evidence when available, importance of the research question, method/theory innovation, conclusion novelty, rigor, real-world validation, reproducibility, open code/data, likely academic impact, long-term value, and relevance to this radar. De-prioritize pure benchmark climbing, simple backbone swaps, and low-innovation papers.

Historical-paper rule: if a 1–2 year old or slightly older paper is highly relevant, influential, has become a meaningful method/design principle/baseline, and has never been pushed before, it may be included. This is optional, never a quota. Explain briefly why it is still worth reading today.

De-duplicate using title, arXiv ID, DOI and OpenReview ID. Do not repeat a new version of the same paper unless there is a major update or formal acceptance, and explain why.

## Relative recommendation score
All pushed papers use a 1–7 star relative recommendation score across the entire historical set, not just the current day. Consider venue/peer review, problem importance, methodological/theoretical innovation, conclusion innovation, rigor, real-world validation, reproducibility/open artifacts, impact, long-term value and relevance. Do not reward recency, citation count or famous institutions by themselves.

The overall distribution should be approximately bell-shaped with 4 as the center. 1 and 7 are rare tails, 2/6 are uncommon, 3/5 are more common. Recalibrate all historical scores whenever needed as new papers enter. Low stars only mean relatively lower priority within this already-filtered collection.

Before selecting the final papers, read `data/ratings.json`, all historical `data/reports/`, and `data/index.json` to de-duplicate and recalibrate scores.

## Report output
Keep the report concise and easy to scan.

Structure:
1. 今日摘要 — 1–3 papers; for each: English title, Chinese translation, `推荐指数 ★...☆` with exactly seven star positions, 1–2 sentence summary, and top venue label when applicable.
2. Per-paper body containing only:
   - 文章信息: title, Chinese title, date, source, acceptance/publication status, authors, institution, DOI, paper URL, code URL if any.
   - 概要: 1–2 sentence summary, 3–6 sentence abstract-style summary, 3–6 keywords.
   - 推荐理由: 重点 / 创新点 / 结论, each 1–3 sentences.
3. 今日研究信号 — 2–4 sentences.

Do not output estimated reading time, must-read tier, separate limitations section, or separate product-insights section.

Accuracy first. Verify title, authors, date, DOI, links, venue/status, public review information and institutions. If a field cannot be reliably confirmed, write `未确认`; never guess.

## GitHub publishing — one persistent write only
Use only ChatGPT Scheduled and the connected GitHub App. Do not use Codex, ChatGPT Work or Codex automation.

The repository already contains `.github/workflows/publish-radar.yml` and `scripts/publish_radar_bundle.py`. The Scheduled task must make exactly ONE persistent GitHub write per daily run: create `data/inbox/YYYY-MM-DD.json`.

Do NOT directly create/update `data/reports/YYYY-MM-DD.json`, `data/latest.json`, `data/index.json`, `data/ratings.json` or `data/pdf-archive-manifest.json`. GitHub Actions will derive and commit those files from the inbox bundle.

The inbox bundle must be valid JSON with:
- `schemaVersion`: 1
- `date`: `YYYY-MM-DD`
- `report`: a complete site-compatible report object with `schemaVersion=1`, matching `date`, and every `papers[]` entry containing `institution` (use `未确认` if necessary). Preserve site fields such as authors, venue, published, url, topics, overview, recommendation.
- `indexEntry`: `{date, shortTitle, count, topics, path}` with `path` exactly `data/reports/YYYY-MM-DD.json`.
- `ratings`: the COMPLETE recalibrated rating map for all historical and current papers keyed by `papers[].id`, integer values 1–7. Do not send only the daily delta.
- `pdfs`: zero to three legal public PDF items `{title, pdfUrl, path}`. `path` must be under `papers/YYYY-MM-DD/`. Do not bypass paywalls, logins or access restrictions. Omit papers whose public PDF cannot be verified.

After the single inbox write, use only read operations to verify the `Publish radar bundle` workflow and resulting report/Pages state. If the single write requires approval or is denied by a safety policy, do not attempt any additional GitHub writes. Report clearly that the single bundle write was blocked; never claim success.

## PDF archive to ChatGPT Library
For the final 1–3 recommended papers only, locate legal public PDFs and upload them to `/学术研究雷达/论文PDF/YYYY-MM/`, de-duplicating by arXiv ID/DOI/title when possible. If this fails, state the reason briefly and do not bypass access controls.

## Scheduled result
The Scheduled task must also post the complete daily radar result back into its ChatGPT scheduled-task conversation after finishing. It must explicitly state whether the GitHub inbox write succeeded, whether the GitHub Actions publishing workflow succeeded, and whether the Library PDF archive succeeded.

## Daily message link (required)
At the VERY END of every daily Scheduled result in this conversation, AFTER the report and all GitHub/Pages/PDF status notes, append exactly one clickable website entry:

**学术研究雷达：** [打开网站](https://ktdhhc.github.io/academic-research-radar/)

Include the site link even when GitHub publishing is delayed, blocked, or fails. It must be the final line of the Scheduled response so the user can open the radar directly.

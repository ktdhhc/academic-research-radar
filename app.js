const REPORT_INDEX_URL = "data/index.json";
const LATEST_REPORT_URL = "data/latest.json";

const reportElement = document.querySelector("#report");
const archiveListElement = document.querySelector("#archive-list");
const archiveSelectElement = document.querySelector("#archive-select");
const editionLabelElement = document.querySelector("#edition-label");
const currentDateLabelElement = document.querySelector("#current-date-label");
const updatedAtElement = document.querySelector("#updated-at");

let reportIndex = [];
let activeDate = "";

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatDate(dateString, includeYear = true) {
  const [year, month, day] = dateString.split("-");
  return includeYear ? `${year}年${Number(month)}月${Number(day)}日` : `${month}.${day}`;
}

function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load ${url}`);
  return response.json();
}

function setBusy(isBusy) {
  reportElement.setAttribute("aria-busy", String(isBusy));
}

function renderArchive() {
  archiveListElement.replaceChildren();
  archiveSelectElement.replaceChildren();

  reportIndex.forEach((issue) => {
    const button = element("button", "archive__item");
    button.type = "button";
    button.dataset.date = issue.date;
    button.setAttribute("aria-current", issue.date === activeDate ? "page" : "false");
    button.append(
      element("span", "archive__item-date", formatDate(issue.date, false)),
      element("span", "archive__item-title", issue.shortTitle)
    );
    button.addEventListener("click", () => openIssue(issue.date));
    archiveListElement.append(button);

    const option = element("option", "", `${issue.date} · ${issue.shortTitle}`);
    option.value = issue.date;
    option.selected = issue.date === activeDate;
    archiveSelectElement.append(option);
  });
}

function renderReport(report) {
  document.title = `${report.date} · ${report.title} | 学术研究雷达`;
  activeDate = report.date;
  editionLabelElement.textContent = report.edition || "RESEARCH EDITION";
  currentDateLabelElement.textContent = formatDate(report.date);
  updatedAtElement.textContent = `UPDATED ${report.updatedAt || report.date}`;
  reportElement.replaceChildren();

  const head = element("header", "report__head");
  const dateRow = element("div", "report__date");
  const time = element("time", "", formatDate(report.date));
  time.dateTime = report.date;
  dateRow.append(time, element("span", "report__read-time", `约 ${report.readingMinutes || 8} 分钟阅读`));
  head.append(
    dateRow,
    element("h1", "report__title", report.title),
    element("p", "report__dek", report.subtitle)
  );
  reportElement.append(head);

  const summary = element("section", "summary");
  summary.setAttribute("aria-labelledby", "summary-title");
  const summaryLabel = element("p", "section-label", "TODAY · 今日摘要");
  summaryLabel.id = "summary-title";
  const summaryList = element("ol", "summary__list");

  report.summary.forEach((item) => {
    const paper = report.papers.find((entry) => entry.id === item.paperId);
    const listItem = element("li", "summary__item");
    const content = element("div", "");
    const headline = paper
      ? `${paper.title}（${paper.status || paper.type || "未确认"}）`
      : item.headline;
    content.append(element("h2", "summary__headline", headline));
    if (paper?.titleZh) content.append(element("p", "summary__translation", paper.titleZh));
    content.append(element("p", "summary__takeaway", item.takeaway));
    listItem.append(content);
    summaryList.append(listItem);
  });
  summary.append(summaryLabel, summaryList);
  reportElement.append(summary);

  const papers = element("div", "papers");
  report.papers.forEach((paper) => papers.append(renderPaper(paper)));
  reportElement.append(papers, renderSignal(report.signal));

  renderArchive();
  setBusy(false);
}

function renderPaper(paper) {
  const article = element("section", "paper");
  article.id = paper.id;

  const rail = element("div", "paper__rail");
  rail.append(
    element("p", "paper__number", "PAPER "),
    element("p", "paper__venue", paper.venue)
  );

  const content = element("div", "paper__content");
  content.append(element("h2", "paper__title", paper.title));
  if (paper.titleZh) content.append(element("p", "paper__title-zh", paper.titleZh));

  const meta = element("dl", "paper__meta");
  [
    ["文章信息", paper.type],
    ["收录状态", paper.status],
    ["作者", paper.authors],
    ["所属机构", paper.institution || "未确认"],
    ["发表", paper.published],
    ["DOI", paper.doi],
    ["代码 / 数据", paper.code]
  ].filter(([, value]) => value).forEach(([label, value]) => {
    meta.append(element("dt", "", label), element("dd", "", value));
  });
  content.append(meta);

  const body = element("div", "paper__body");
  const overview = element("div", "paper__section");
  overview.append(element("h3", "", "概要"), element("p", "", paper.overview));
  const recommendation = element("div", "paper__section");
  recommendation.append(element("h3", "", "推荐理由"), element("p", "", paper.recommendation));
  body.append(overview, recommendation);
  content.append(body);

  if (paper.topics?.length) {
    content.append(element("p", "paper__topics", paper.topics.join(" / ")));
  }

  const url = safeExternalUrl(paper.url);
  if (url) {
    const link = element("a", "paper__link", "阅读原文 ↗");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    content.append(link);
  }

  article.append(rail, content);
  return article;
}

function renderSignal(signal) {
  const section = element("section", "signal");
  section.setAttribute("aria-labelledby", "signal-title");
  section.append(element("p", "signal__index", "SIGNAL · 今日研究信号"));

  const content = element("div", "signal__content");
  const title = element("h2", "signal__title", signal.title);
  title.id = "signal-title";
  content.append(title, element("p", "signal__body", signal.body));
  if (signal.note) content.append(element("p", "signal__note", signal.note));
  section.append(content);
  return section;
}

function renderError() {
  setBusy(false);
  reportElement.replaceChildren();
  const wrapper = element("div", "error-state");
  wrapper.append(
    element("p", "section-label", "DATA UNAVAILABLE"),
    element("p", "", "这一期暂时无法读取，请稍后再试。")
  );
  const button = element("button", "retry-button", "重新载入");
  button.type = "button";
  button.addEventListener("click", initialise);
  wrapper.append(button);
  reportElement.append(wrapper);
}

async function openIssue(date, updateHistory = true) {
  if (date === activeDate) return;
  setBusy(true);
  try {
    const issue = reportIndex.find((entry) => entry.date === date);
    if (!issue) throw new Error("Issue not found");
    const report = await fetchJson(issue.path);
    renderReport(report);
    if (updateHistory) history.pushState({ date }, "", `?date=${date}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch {
    renderError();
  }
}

async function initialise() {
  setBusy(true);
  try {
    const indexData = await fetchJson(REPORT_INDEX_URL);
    reportIndex = indexData.issues || [];
    const requestedDate = new URLSearchParams(location.search).get("date");
    const requestedIssue = reportIndex.find((issue) => issue.date === requestedDate);
    const report = requestedIssue
      ? await fetchJson(requestedIssue.path)
      : await fetchJson(LATEST_REPORT_URL);
    renderReport(report);
  } catch {
    renderError();
  }
}

archiveSelectElement.addEventListener("change", (event) => openIssue(event.target.value));
window.addEventListener("popstate", (event) => {
  const requestedDate = event.state?.date || new URLSearchParams(location.search).get("date");
  if (requestedDate) openIssue(requestedDate, false);
});

initialise();

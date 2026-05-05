#!/usr/bin/env node
/**
 * Daily-publish automation.
 *
 * Picks the next pending article from content/queue.json whose scheduled_for
 * is today (or earlier) and publishes it to dev.to + Hashnode via API. Stages
 * a Medium-ready notification (Medium API is dead; Marie publishes Medium via
 * Chrome MCP next time she's in a Claude session).
 *
 * Run manually:
 *   source scripts/load-credentials.sh && node scripts/daily-publish.mjs
 *
 * Run as cron via macOS launchd: see scripts/launchd/com.boon.daily-publish.plist
 *
 * Env required:
 *   DEVTO_TOKEN, HASHNODE_TOKEN  (from macOS Keychain via load-credentials.sh)
 *
 * Side effects:
 *   - Updates content/queue.json with status=published + urls
 *   - Writes content/medium-staging/<id>.txt with a copy-paste import URL
 *   - Sends a macOS notification ("Daily article published")
 *   - POSTs to https://kazkn-dashboard.fly.dev to mark relevant quests done
 *   - Appends a row to content/publish-log.jsonl
 */

import { readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const QUEUE_PATH = path.join(ROOT, "content/queue.json");
const STAGING_DIR = path.join(ROOT, "content/medium-staging");
const LOG_PATH = path.join(ROOT, "content/publish-log.jsonl");
const DASHBOARD_BASE =
  "https://kazkn-dashboard.fly.dev/api/users/boon/quests/shopify";

const todayISO = () => new Date().toISOString().slice(0, 10);

const notify = (title, message) => {
  // macOS notification via osascript. Silent failure if not on macOS.
  try {
    const safeTitle = String(title).replace(/"/g, '\\"');
    const safeMsg = String(message).replace(/"/g, '\\"').slice(0, 500);
    execSync(
      `osascript -e 'display notification "${safeMsg}" with title "${safeTitle}"'`,
      { stdio: "ignore" },
    );
  } catch {
    /* ignore */
  }
};

const log = async (event) => {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...event }) + "\n";
  await appendFile(LOG_PATH, line);
};

const splitFrontMatter = (raw) => {
  const lines = raw.split("\n");
  const titleLine = lines.find((l) => l.startsWith("# "));
  if (!titleLine) throw new Error("No H1 title in markdown");
  const title = titleLine.replace(/^#\s+/, "").trim();
  const idx = lines.indexOf(titleLine);
  const body = lines.slice(idx + 2).join("\n").trim();
  return { title, body };
};

const publishDevTo = async ({ markdown, tags }) => {
  const token = process.env.DEVTO_TOKEN;
  if (!token) throw new Error("DEVTO_TOKEN missing in env");
  const { title, body } = splitFrontMatter(markdown);
  const res = await fetch("https://dev.to/api/articles", {
    method: "POST",
    headers: {
      "api-key": token,
      "Content-Type": "application/json",
      Accept: "application/vnd.forem.api-v1+json",
    },
    body: JSON.stringify({
      article: {
        title,
        body_markdown: body,
        published: true,
        tags: tags.slice(0, 4), // dev.to caps at 4
      },
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`dev.to API ${res.status}: ${JSON.stringify(json)}`);
  }
  return { url: json.url, id: json.id, slug: json.slug };
};

const publishHashnode = async ({ markdown, tags, publicationId }) => {
  const token = process.env.HASHNODE_TOKEN;
  if (!token) throw new Error("HASHNODE_TOKEN missing in env");
  const { title, body } = splitFrontMatter(markdown);
  const tagObjs = tags.map((slug) => ({
    slug: slug.toLowerCase(),
    name: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  }));
  const mutation = `mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post { id slug url title publishedAt }
    }
  }`;
  const res = await fetch("https://gql.hashnode.com/", {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          title,
          publicationId,
          contentMarkdown: body,
          tags: tagObjs,
        },
      },
    }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(`Hashnode GraphQL: ${JSON.stringify(json.errors)}`);
  }
  const post = json.data?.publishPost?.post;
  if (!post) throw new Error(`Hashnode unexpected: ${JSON.stringify(json)}`);
  return { url: post.url, id: post.id, slug: post.slug };
};

const stageMedium = async ({ id, devtoUrl, topics }) => {
  await mkdir(STAGING_DIR, { recursive: true });
  const stagingFile = path.join(STAGING_DIR, `${id}.txt`);
  const content = `Medium publish — ready ${todayISO()}\n
Import URL (paste into https://medium.com/p/import):
${devtoUrl}

After import, in publish dialog set topics:
${topics.map((t) => `  - ${t}`).join("\n")}

Click Publish. Done.
`;
  await writeFile(stagingFile, content);
  return stagingFile;
};

const markQuest = async (questId, notes) => {
  try {
    const res = await fetch(
      `${DASHBOARD_BASE}/${questId}/complete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.slice(0, 500) }),
      },
    );
    const json = await res.json();
    return json;
  } catch (err) {
    return { error: err.message };
  }
};

const QUEST_MAP = {
  best: {
    devto: "article_best_devto",
    hashnode: "article_best_hashnode",
    medium: "article_best_medium",
  },
  how_to: {
    devto: "article_how_to_devto",
    hashnode: "article_how_to_hashnode",
    medium: "article_how_to_medium",
  },
  build_in_public: {
    devto: "article_how_built",
  },
};

const main = async () => {
  const queue = JSON.parse(await readFile(QUEUE_PATH, "utf8"));
  const today = todayISO();

  const next = queue.items.find(
    (it) => it.status === "pending" && it.scheduled_for <= today,
  );

  if (!next) {
    const nextScheduled = queue.items.find((it) => it.status === "pending");
    const msg = nextScheduled
      ? `No article due today. Next: ${nextScheduled.id} on ${nextScheduled.scheduled_for}`
      : "Queue empty — write more drafts!";
    console.log(msg);
    await log({ event: "skip", reason: msg });
    if (!nextScheduled) {
      notify("Daily-publish queue empty", "Write more drafts in content/");
    }
    return;
  }

  console.log(`Publishing: ${next.id} (${next.file})`);
  await log({ event: "start", id: next.id });

  const filePath = path.join(ROOT, next.file);
  const markdown = await readFile(filePath, "utf8");

  const errors = [];
  next.urls = next.urls || {};

  // dev.to
  if (next.platforms.includes("devto")) {
    try {
      const devtoTags = next.tags?.devto || queue.defaults.devto.tags;
      const out = await publishDevTo({ markdown, tags: devtoTags });
      next.urls.devto = out.url;
      next.urls.devto_id = out.id;
      console.log(`  ✓ dev.to: ${out.url}`);
      await log({ event: "published", platform: "devto", id: next.id, ...out });
      const qid = QUEST_MAP[next.format]?.devto;
      if (qid) {
        const r = await markQuest(qid, `Auto-published ${next.id} on dev.to: ${out.url}`);
        await log({ event: "quest", platform: "devto", quest: qid, ...r });
      }
    } catch (err) {
      errors.push(`devto: ${err.message}`);
      console.error(`  ✗ dev.to: ${err.message}`);
      await log({ event: "error", platform: "devto", id: next.id, error: err.message });
    }
  }

  // Hashnode
  if (next.platforms.includes("hashnode")) {
    try {
      const hnTags = next.tags?.hashnode || queue.defaults.hashnode.tags;
      const pubId = queue.defaults.hashnode.publication_id;
      const out = await publishHashnode({
        markdown,
        tags: hnTags,
        publicationId: pubId,
      });
      next.urls.hashnode = out.url;
      next.urls.hashnode_id = out.id;
      console.log(`  ✓ Hashnode: ${out.url}`);
      await log({ event: "published", platform: "hashnode", id: next.id, ...out });
      const qid = QUEST_MAP[next.format]?.hashnode;
      if (qid) {
        const r = await markQuest(qid, `Auto-published ${next.id} on Hashnode: ${out.url}`);
        await log({ event: "quest", platform: "hashnode", quest: qid, ...r });
      }
    } catch (err) {
      errors.push(`hashnode: ${err.message}`);
      console.error(`  ✗ Hashnode: ${err.message}`);
      await log({ event: "error", platform: "hashnode", id: next.id, error: err.message });
    }
  }

  // Medium — stage only (manual click via Chrome MCP next session)
  if (next.platforms.includes("medium") && next.urls.devto) {
    try {
      const topics = next.medium_topics || queue.defaults.medium.topics;
      const stagingFile = await stageMedium({
        id: next.id,
        devtoUrl: next.urls.devto,
        topics,
      });
      next.urls.medium_staging = path.relative(ROOT, stagingFile);
      console.log(`  ⏸ Medium staged: ${stagingFile}`);
      await log({ event: "staged", platform: "medium", id: next.id, file: stagingFile });
    } catch (err) {
      errors.push(`medium-stage: ${err.message}`);
    }
  }

  // Mark item published if at least one platform succeeded
  if (next.urls.devto || next.urls.hashnode) {
    next.status = errors.length > 0 ? "partial" : "published";
    next.published_at = new Date().toISOString();
    await writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2));

    const successCount = [next.urls.devto, next.urls.hashnode].filter(Boolean).length;
    const successMsg = `${successCount}/2 platforms ✓ · Medium staged for manual click`;
    notify(`Article published: ${next.id}`, successMsg);
  } else {
    next.status = "failed";
    next.last_error = errors.join("; ");
    await writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2));
    notify(`Daily-publish FAILED: ${next.id}`, errors.join("; ").slice(0, 200));
  }

  if (errors.length > 0) {
    console.error("\n--- Errors ---\n" + errors.join("\n"));
    process.exit(1);
  }
};

main().catch((err) => {
  console.error("Fatal:", err);
  notify("Daily-publish CRASHED", err.message.slice(0, 200));
  process.exit(2);
});

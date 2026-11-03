# Dependency-ordered interview

The user's mental model is a decision tree: finish an upstream decision and its consequences before descending. Be thorough about applicable decisions, not repetitive about facts already supplied. Do not ask every question in this reference mechanically.

## Each round

1. Find the earliest unresolved material decision. Inspect available evidence first.
2. Ask one focused question, or at most three independent questions within the same branch. Number questions persistently. Give a specific recommended answer and its main tradeoff, plus alternatives only when useful. Avoid a bundle where one “yes” could mean incompatible things.
3. Wait for the answer using the host's supported interaction. Record the exact question/recommendation context so “follow your recommendation” has an unambiguous referent. If a multi-question answer is ambiguous, clarify only the affected items.
4. Record the answer and rationale as a decision ID. Distinguish confirmed, proposed, superseded and deferred. Update affected scope/tasks/contracts immediately. Silence or a lost question stays pending; “continue” resumes work, not approval.
5. Probe material consequences. Surface conflicts with earlier answers; do not quietly select whichever is easiest. Move on once the branch is resolved. Revisit confirmed decisions only for genuinely new contradictory evidence.

## Coverage tree

Traverse in this order where applicable; a later question may close an earlier branch.

| Branch | Decisions and follow-through |
|---|---|
| Outcome and boundary | Users, key journeys, success, must-have vs later, complete site/app vs one feature, separate services, ownership, deadlines and constraints. Establish build milestone vs live launch. |
| Starting point | Fresh build vs migration, legacy exclusions, existing repository/data, intended directory/name, source authority, preservation obligations. |
| Interface and behavior | Routes/screens and missing detail pages; all visible controls; navigation, search/filter/pagination/calendar behavior; mobile/desktop; empty/loading/error/disabled states; theming, keyboard and motion. When designs are absent, resolve the visual direction boundary without inventing supplied screens. |
| Architecture | Language, runtime/framework, rendering, package manager, mandatory packages, hosting constraints, compatibility spikes, one or multiple app boundaries. Recommend from evidence; no universal stack. |
| Content and data | Ownership, fixed layouts vs editable composition, entities/relations, category deletion, media, rich text, validation, links, slugs/redirects, publish/unpublish, fixtures and migrations. |
| Locales, if needed | Source language, manual/machine translation, immediate vs reviewed publication, stale/missing fallback, notices, manual overwrite protection, locale URLs and SEO. Provider/key/billing may be a later integration prerequisite. |
| Services, if needed | Forms/delivery vs inbox, newsletter language/consent/confirmation, external registration and disabling, commerce/auth boundaries, credentials, rate limits and unavailable-service behavior. Separate what the project builds from what it links to. |
| Freshness and delivery | Tolerable update delay, rebuild/webhook/reset strategy, concurrent or failed builds, cache/media invalidation, preview separation, last-good release, deletion, rollback and observability. Match these to chosen rendering architecture. |
| Quality and privacy | Relevant accessibility target, explicit browser/OS matrix with dated evidence, measurable performance/reliability budgets and test conditions, tracking/cookies/storage, sensitive data/security, manual/device evidence. Missing designs do not excuse skipping these decisions. |
| Execution and Git | Coordinator/worker roles, exact available model IDs, cost vs capability, optional escalation, parallelism/file ownership, token/communication budget, branch/PR/merge policy, commits/attribution, remote authority and launch gates. |
| Closure | Which facts/assets/access can be deferred, who supplies them, when they block work, and what proves the chosen milestone. |

Recommend conservative, project-specific defaults with reasons. For this user's familiar workflow, propose one coordinator, stronger models for substantive work, cheaper models for deterministic work, rare bounded advisor use, minimal chatter, npm when suitable, and feature branches/PRs with title-only unattributed commits. These are recommendations to reconcile with the new project's requirements, not inherited approvals or immutable choices.

## Ledger and stopping rule

Use compact rows such as:

`D07 | confirmed | fixed layouts, CMS edits content | Q09 answer | affects schema + page tasks`

For a deferral record owner, decision point, affected tasks and provisional boundary; do not hide a blocking choice in “later.” A technical unknown can become an evidence-producing spike with gated dependents. A user product preference cannot become “the worker chooses” unless the user delegates it.

The interview is complete when every applicable branch is resolved or explicitly deferred, unanswered questions are visible, and no unapproved assumption governs ready-to-execute work. Do not append a generic “approve everything?” round after already obtaining the necessary decisions. If the user pauses, preserve state; if they ask to skip questions, record the delegation/limits rather than pretending answers were received.

---
name: embabel-dice
description: Build proposition-based knowledge graphs and agent memory with Embabel DICE (Domain-Integrated Context Engineering), the Kotlin/Apache-2.0 library on the embabel-agent framework. Use when the user mentions Embabel DICE, the dice or dice-mcp-autoconfigure or dice-metamodel Maven modules, proposition extraction or revision, PropositionPipeline, processOnce, PropositionQuery, the Memory facade or MemoryProjector, agentic recall, confidence-weighted facts, entity resolution with EscalatingEntityResolver or LlmCandidateBakeoff, graph or Prolog or memory projection, Drivine or Neo4j proposition storage, exposing dice_recall / dice_list / dice_store / dice_get over MCP, or metamodel versioning with MetamodelVersion, DeclaredSchema and DeclaredSchemaSource. Covers the real module list, property prefixes and configuration defaults.
version: 0.2.0
category: ai-agents
tags: [embabel, dice, knowledge-graph, agent-memory, propositions, mcp, kotlin, java]
---

# Embabel DICE - Domain-Integrated Context Engineering

DICE extracts confidence-weighted propositions from text, stores them as the system of record, and
projects them to typed backends (graph, Prolog, agent memory, reports). Kotlin, Apache-2.0, built on
the Embabel agent framework.

```
Source -> PropositionPipeline -> Propositions (system of record) -> Projections
```

## Upstream State (verify against this, not against the README)

| Fact | Value | Authority |
|------|-------|-----------|
| Repository | `https://github.com/embabel/dice` | `pom.xml:16`, `<scm>` `:18-22` |
| Reference used | `main` @ `870b9ab`, `pushed_at 2026-09-10` | GitHub API |
| Build | **Maven** (`pom.xml`, `mvnw`, `.mvn/`) - there is **no** `build.gradle` | `pom.xml` |
| Coordinates | `com.embabel.dice:dice-parent:0.2.0-SNAPSHOT` | `pom.xml:10-12` |
| Tags / releases | **none** - `tags` and `releases` both return `[]` | GitHub API |
| CHANGELOG | one section only: `## Unreleased` | `CHANGELOG.md:9` |
| Neighbours | `embabel-agent 1.5.0-SNAPSHOT`, `drivine 0.0.79`, `tuprolog 1.0.4` | `pom.xml` properties |

- **Never write "pin `v0.2.0`".** No tag and no release object exists. Say "build against `main`" or
  depend on the `-SNAPSHOT` version and resolve from Embabel's Artifactory.
- **The README's install block is wrong twice over.** `README.md:2630-2632` says
  `com.embabel:dice:0.1.1-SNAPSHOT`; the poms say groupId `com.embabel.dice` and version
  `0.2.0-SNAPSHOT`. The poms win - do not copy the README snippet.
- Metamodel versioning and the stamping DSL are labelled **EXPERIMENTAL (shape may change before
  1.0)** by upstream. Carry that caveat; do not present the DSL as settled API.

## Modules - the real list

`pom.xml:25-35` declares exactly nine modules. The six `embabel-dice-*` artifactIds (`-core`,
`-neo4j`, `-prolog`, `-vector`, `-agent`, `-rest`) that older guidance listed are **fabricated** and
occur zero times upstream.

| artifactId (`com.embabel.dice`) | What it is |
|------|------|
| `dice` | Core: pipeline, propositions, resolvers, projections, agent `Memory`, `DiceMcpTools` |
| `dice-storage` | The **one** Drivine-parameterised store (Neo4j / FalkorDB / Memgraph) + `DrivineMetamodelVersionStore` |
| `dice-storage-autoconfigure` | Spring Boot autoconfig: `DiceStorageAutoConfiguration`, `DiceStoreProperties`, `CollectorProperties` |
| `dice-report` | `ReportProjector`, `StructuredReportProjector`, `RationaleProjector`, `SemanticLinkDiscoverer` |
| `dice-ingestion` | `TextIngestionHandler`, `IngestionLedger` - dedup ledger in front of the pipeline |
| `dice-metamodel` | Schema versioning: `MetamodelVersion`, `DeclaredSchema`, `MetamodelVersionStore` |
| `dice-mcp-autoconfigure` | Exports the DICE MCP tools |
| `dice-integration-tests` | Tests only |
| `dice-user-guide` | The AsciiDoc guide |

There is **no per-backend projection module**: vector, graph and Prolog are *features*, not
artifacts. Graph is one `dice-storage` module switched by `embabel.dice.store.type`. `Memory` is not
a separate module either - it is `dice/src/main/kotlin/com/embabel/dice/agent/Memory.kt`.

DICE publishes no aggregator starter. The quickstart uses two coordinates -
`dice-storage-autoconfigure` (pulls `dice` + `dice-storage`) plus `dice-report` - and an
embabel-agent runtime, because DICE declares `embabel-agent-api` and `embabel-agent-rag-core` as
`provided`.

```xml
<!-- Version comes from the aggregator's dependencyManagement when you build inside the reactor. -->
<dependency>
    <groupId>com.embabel.dice</groupId>
    <artifactId>dice-storage-autoconfigure</artifactId>
    <version>0.2.0-SNAPSHOT</version>
</dependency>
<repositories>
    <repository>
        <id>embabel-snapshots</id>
        <url>https://repo.embabel.com/artifactory/libs-snapshot</url>
        <releases><enabled>false</enabled></releases>
        <snapshots><enabled>true</enabled></snapshots>
    </repository>
</repositories>
```

## Configuration - real prefixes only

The old `dice.memory.*` / `dice.resolver.*` block matches **no documented property prefix** and must
not be reproduced. The prefixes are genuinely split, and upstream flags the split itself
(`reference/configuration-properties.adoc` heads a section "Read by `dice`. Note the prefix: `dice.`,
not `embabel.dice.`"). Do not "unify" them.

| Prefix | Owner class | Read by |
|--------|-------------|---------|
| `embabel.dice.store.*` | `DiceStoreProperties` | `dice-storage-autoconfigure` |
| `embabel.dice.collector.*` | `CollectorProperties` | `dice-storage-autoconfigure` |
| `embabel.dice.source-analyzer` | bound by `LlmSourceAnalyzer` | `dice` |
| `embabel.dice.mcp.*` | `DiceMcpProperties` | `dice-mcp-autoconfigure` |
| `dice.security.api-key.*` | `DiceApiKeyProperties` | `dice` - **`dice.`, not `embabel.dice.`** |

```yaml
embabel:
  dice:
    store:
      type: in-memory        # or graph (Drivine over Neo4j/FalkorDB/Memgraph)
      decay:
        enabled: true
        interval-ms: 3600000
        k: 2.0
        prune-stale: false
      vector-index:
        enabled: true        # graph backend only
    mcp:
      enabled: true          # default false
      min-confidence: 0.5    # default 0.5
      default-limit: 10      # default 10; must be 1..100 or startup fails
      writes-enabled: false  # default false; gates dice_store
dice:
  security:
    api-key:
      enabled: true
      keys:
        - ${DICE_API_KEY}
```

The `0.5` / `10` defaults belong to `embabel.dice.mcp.*` (`DiceMcpProperties`), not to any
`dice.memory.*` key. LLM provider configuration belongs to embabel-agent and Neo4j connection
settings to Drivine - "DICE reads neither".

## Step 1 - Schema (Embabel Agent types, not DICE types)

`DataDictionary`, `DynamicType`, `ValidatedPropertyDefinition`, `ContextId`, `Cardinality`,
`DomainType`, `PropertyDefinition` are all **`com.embabel.agent.core.*`** - proven by the imports in
the collected DICE sources (`MetamodelDsl.kt:18`, `MetamodelVersion.kt:18-22`). They are not DICE
types and their full guidance belongs to the `embabel-agent` skill.

```kotlin
import com.embabel.agent.core.*
import com.embabel.dice.common.validation.*

val personType = DynamicType(
    name = "Person",
    description = "A person",
    ownProperties = listOf(
        ValidatedPropertyDefinition(
            name = "name",
            validationRules = listOf(
                NotBlank,                     // an object - no parentheses
                NoVagueReferences(),
                LengthConstraint(maxLength = 150)
            )
        )
    ),
    parents = emptyList(),
    creationPermitted = true
)

val schema = DataDictionary.fromDomainTypes("my-schema", listOf(personType))
```

Shipped validation rules: `NotBlank`, `NoVagueReferences()`, `LengthConstraint(maxLength)`,
`MinWordCount(n)`, `PatternConstraint()`, and the combinators `AllOf()` / `AnyOf()`.

## Step 2 - Pipeline (immutable, static factories - no builder)

`PropositionPipeline` is immutable; every `with*` returns a new instance. There is **no**
`PropositionPipeline.builder()`.

```java
var extractor = LlmPropositionExtractor
    .withLlm(llmOptions)
    .withAi(ai)
    .withPropositionRepository(repository)
    .withSchemaAdherence(SchemaAdherence.DEFAULT);

var pipeline = PropositionPipeline
    .withExtractor(extractor)
    .withRevision(reviser, repository)
    .withMentionFilter(new SchemaValidatedMentionFilter(schema));
```

`SchemaAdherence` has exactly three values - `STRICT`, `DEFAULT`, `RELAXED` (`LOOSE` is not one of
them): `STRICT` locks entity types and predicates; `DEFAULT` locks types, allows any predicate (the
usual choice); `RELAXED` prefers the schema without requiring it.

## Step 3 - Entity resolution

```java
var resolver = EscalatingEntityResolver.create(entityRepository, llmCandidateBakeoff);  // ambiguity -> LLM
var noMint   = EscalatingEntityResolver.create(entityRepository, null);                 // ambiguity -> new entity
var chain    = new ChainedEntityResolver(List.of(
    new KnownEntityResolver(knownEntities),
    EscalatingEntityResolver.create(entityRepository, bakeoff)));
```

Searchers (cheapest first): `ByIdCandidateSearcher`, `ByExactNameCandidateSearcher`,
`NormalizedNameCandidateSearcher`, `PartialNameCandidateSearcher`, `FuzzyNameCandidateSearcher`,
`VectorCandidateSearcher`, `AgenticCandidateSearcher`. Assemble them with
`DefaultCandidateSearchers.create(repository)` or `.withoutVector(repository)` - do not add
`InMemoryEntityResolver` by hand for a `process()` run; the pipeline adds it when minting is on.
`LevelResult` reports the `ResolutionLevel` (`EXACT_MATCH` / `LLM_BAKEOFF` / `NO_MATCH`) per answer -
that distribution is the tuning diagnostic. Tune towards **under**-merging: a duplicate can be
collected later, a bad merge cannot be unpicked.

## Step 4 - Extract and persist

```java
var context = new SourceAnalysisContext(schema, resolver, new ContextId("user:42"))
    .withKnownEntities(KnownEntity.asCurrentUser(user))
    .withRelations(relations)
    .withMintNewEntities(true);            // off by default

var chunk = new Chunk("chunk-1", "Ada Lovelace worked with Charles Babbage.");
var results = pipeline.process(List.of(chunk), context);
results.persist(propositionRepository, namedEntityDataRepository);   // inside your own transaction
```

`process*` returns **unsaved** `PersistablePropositions` on purpose; dropping it discards the work.
`persist` saves only referenced entities, then the propositions, then the structural links.

Dedup: `processOnce(text, sourceId, context, historyStore)` returns `null` on a repeat of the same
content; omit the store for no dedup. For growing sources use
`PropositionIncrementalAnalyzer(pipeline, historyStore, formatter, WindowConfig(...), contentHasher)`
and `analyzer.analyze(source, context)`. `InMemoryChunkHistoryStore` is for tests - production should
persist (`docs/design/durable-storage.md`).

## Step 5 - Query

Every query starts from a scope: `PropositionQuery.forContextId(ctxId)` or the Java-friendly
`PropositionQuery.againstContext(ctxId)` (that spelling is upstream's). There is deliberately **no**
`create()` factory - it would make "load everything" the shortest thing to write.

```java
var base = PropositionQuery.againstContext(new ContextId("user:42"));
repository.query(base.withMinEffectiveConfidence(0.7)
                     .withStatus(PropositionStatus.ACTIVE)
                     .withAllEntities(adaId, babbageId)     // claims about the pair
                     .withMinReinforceCount(3)
                     .withLimit(20));
```

Filter axes: scope (`entityId`, `anyEntityIds`, `allEntityIds`), lifecycle (`statuses`, `pinned`,
`minLevel`, `maxLevel`), time (`createdAfter`, `revisedAfter`, `accessedAfter` - `revisedAfter` is the
decay anchor and the right one for "what changed"), belief (`minConfidence`,
`minEffectiveConfidence`, `belowEffectiveConfidence`, `minImportance`, `minReinforceCount`,
`minTrustScore`), shape (`orderBy`, `limit`). Capabilities are optional per backend - check before
relying on one: `VectorSearchCapable`, `GraphTraversalCapable`, `GraphQueryCapable`,
`TemporalQueryCapable`. `RetrievalRouter` picks a `RetrievalMode` when you would rather not choose.

## Step 6 - Agent memory

```java
var memory = Memory.forContext(contextId)
    .withRepository(propositionRepository)
    .withProjector(DefaultMemoryProjector.DEFAULT)
    .withTopic("the user's project context")
    .withEagerSearchAbout(recentConversationText, 10)
    .withEagerTopicSearch(5)
    .withEagerQuery(q -> q.orderedByEffectiveConfidence().withLimit(3))
    .narrowedBy(q -> q.withEntityId("alice-123"));

ai.withReferences(memory).respond(prompt);
```

Two tiers: eager (`contribution()` preloads into the system prompt) plus on-demand (`tools()`
exposes a search tool, auto-deduplicated against the eager set). Defaults: `withMinConfidence`
`0.5`, `withDefaultLimit` `10`. `narrowedBy` constrains **every** query and the LLM cannot escape it.
For the bucketed read side use `MemoryProjector.project(...)` -> `MemoryProjection`, which sorts
propositions into the four `KnowledgeType` buckets `SEMANTIC` / `EPISODIC` / `PROCEDURAL` / `WORKING`
(`README.md:2108`); the retrieval collaborator is `MemoryRetriever` (similarity + entity + recency,
`README.md:2163`). `propositionRepository.pin(id)` exempts a claim from decay-driven reclamation.

## Step 7 - Projections (four, and they are rebuildable views)

| Projection | Types | Note |
|------------|-------|------|
| Graph | `GraphProjector`, `RelationBasedGraphProjector`, `LlmGraphProjector`, `GraphProjectionService` | edges carry lineage; `Reconciler` is idempotent |
| Prolog | `PrologProjector`, `DefaultPrologProjector`, `PrologEngine`, `PrologTypes` | experimental; tuProlog |
| Memory | `MemoryProjector`, `MemoryProjection`, `DefaultMemoryProjector` | four knowledge-type buckets |
| Report | `ReportProjector`, `StructuredReportProjector`, `RationaleProjector` | in `dice-report` |

```java
var projector = RelationBasedGraphProjector.from(relations).withLenientPolicy();
var outcome = projector.projectAll(propositions, schema);

var service = GraphProjectionService.create(graphProjector, persister, schema);
var result = service.projectAndPersist(propositions);
```

Policy withers: `withPolicy(policy)`, `withLenientPolicy([threshold])` (`LenientProjectionPolicy`,
default 0.7), `withDefaultPolicy([threshold])` (`DefaultProjectionPolicy`, default 0.85). There is **no**
`StrictProjectionPolicy`, `KnowledgeTypeProjectionPolicy`, `VectorProjector` or `OracleProjector`.
Vector is a store capability (`VectorSearchCapable`) plus a fixed `@VectorIndex` on
`PropositionNode.embedding`; NL question answering is `Oracle` / `LlmOracle` / `ToolOracle` under
`com.embabel.dice.query.oracle`, not a projection. If the graph and the propositions disagree, the
propositions win.

## Step 8 - Maintenance

```java
var orchestrator = MemoryMaintenanceOrchestrator
    .withRepository(propositionRepository)
    .withConsolidator(new DefaultMemoryConsolidator())
    .withAbstractor(LlmPropositionAbstractor.withLlm(llm).withAi(ai))
    .withRetireBelow(0.1);
MaintenanceResult result = orchestrator.maintain(contextId, sessionPropositions);
```

Options: `withAbstractionThreshold` (default 5), `withAbstractionTargetCount` (default 3),
`withRetireDecayK` (default 2.0). For scheduled hygiene prefer the threshold-gated dream loop -
`DefaultDreamLoopOrchestrator`, returning a `DreamLoopReport` - over
`DefaultMemoryMaintenanceOrchestrator`, which is the older four-step pipeline kept for compatibility.
Both live in `com.embabel.dice.projection.memory`; the consolidation passes they compose
(`SessionConsolidationPass`, `AbstractionPass`, `ContradictionResolutionPass`, `DecaySweepPass`) are
under `com.embabel.dice.operations.consolidation`.

## Step 9 - Expose DICE over MCP

`dice-mcp-autoconfigure` is real, registered and current (HEAD is a merged MCP PR). It is **not**
aspirational: `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
contains exactly `com.embabel.dice.mcp.autoconfigure.DiceMcpAutoConfiguration`.

```xml
<dependency>
    <groupId>com.embabel.dice</groupId>
    <artifactId>dice-mcp-autoconfigure</artifactId>
</dependency>
<!-- UNRESOLVED: pick the MCP-server starter after checking embabel/embabel-agent; both candidate
     artifactIds are named above and neither is confirmed by the DICE corpus. -->
<dependency>
    <groupId>com.embabel.agent</groupId>
    <artifactId>embabel-agent-starter-mcpserver</artifactId>   <!-- or embabel-agent-mcpserver -->
</dependency>
```

```yaml
embabel:
  dice:
    mcp:
      enabled: true          # the gate; off means no beans at all
      writes-enabled: true   # second, separate switch for dice_store
```

The four `@LlmTool` tools live in `dice/src/main/kotlin/com/embabel/dice/mcp/DiceMcpTools.kt`:

| Tool name | Kotlin function | Behaviour |
|-----------|-----------------|-----------|
| `dice_recall` | `recall(contextId, query?, limit?)` | hybrid semantic + keyword; omit `query` to list by confidence |
| `dice_list` | `listMemories(contextId, limit?)` | active propositions ordered by effective confidence |
| `dice_store` | `storeMemory(contextId, text, confidence?)` | writes without extraction; gated by `writes-enabled` |
| `dice_get` | `getProposition(contextId, propositionId)` | one by id, includes status so a stale fact does not read as active |

Gates on the autoconfiguration: `@AutoConfiguration(afterName =
["com.embabel.dice.storage.autoconfigure.DiceStorageAutoConfiguration"])`,
`@ConditionalOnClass(McpToolExport::class)`, `@ConditionalOnProperty(prefix = "embabel.dice.mcp",
name = ["enabled"], havingValue = "true")`, `@EnableConfigurationProperties(DiceMcpProperties::class)`.
Beans: `diceMcpTools(...)` (needs a `PropositionRepository` bean) and `diceMcpToolExport(...)`, which
filters out `DiceMcpTools.STORE` unless `writesEnabled`. `limit` is clamped to `MAX_LIMIT` (100) at
call time, but a `default-limit` outside `1..100` **fails startup** rather than being clamped.

Two security properties to state to users: `contextId` on every call is a **scope, not a credential**
(authorization is the host MCP server's job), and `dice_store` writes with empty mentions and no
provenance, so such facts are reachable by vector/keyword only - never by entity expansion or graph
projection. Use the ingestion pipeline when a fact must be wired into the graph.

## Step 10 - Metamodel versioning (EXPERIMENTAL)

Shape may change before 1.0. `DeclaredSchema` is declared in **`DeclaredSchemaSource.kt:47`**, not in
a `DeclaredSchema.kt` - a filename search for it returns nothing and wrongly reads as absence.

```kotlin
val version = MetamodelVersion(dictionary) {
    governedBy("Person", "Company")
    aliases {
        type("Organisation", formerly = setOf("Company"))
        property("Person", "emailAddress", formerly = setOf("email"))
    }
}
val declared = DeclaredSchema(dictionary) { governedBy("Person", "Company") }

// Java / chain form
val v = MetamodelVersion.stamping(dictionary)
    .governedBy(setOf("Person", "Company"))
    .withAliases(aliases)
    .stamp()          // or .declare()
```

Both DSL entries are `@JvmSynthetic operator fun invoke` on the companion, so Java sees only the
chain (`MetamodelVersion.from(dictionary[, selector[, aliases]])`, `DeclaredSchema.from(...)`).
Governance is per type and opt-in: adding or reshaping an **un**governed type leaves `contentHash`
untouched, so exploratory types churn without polluting version history.
`hasSameContentAs(other)` compares the hash and ignores `schemaName`; `equals` compares both.
Persist stamps through `MetamodelVersionStore` (`saveVersion` / `latestVersion` / `versionHistory`,
keyed `(schemaName, contentHash)`, upsert), with `InMemoryMetamodelVersionStore` for tests and
`dice-storage/DrivineMetamodelVersionStore.kt` for the graph backend.
Supporting types: `SchemaAliases` (`SchemaAliases.NONE`), `TypeIdentity`, `GovernedTypeSelector`
(`GovernedTypeSelector.ALL`), `MetamodelStamping`, `MetamodelDsl`, `PropertySignature`,
`ObservedSchema` / `ObservedSchemaSource`, `DriftReport` / `DriftCheckRunner`, `MetamodelDiffer`.

## Annotation Surface - only two DICE annotations exist

`annotation class MetamodelDsl` (`MetamodelDsl.kt:27`, `@DslMarker` +
`@Target(AnnotationTarget.CLASS)`) and, as *usage*, `@VectorIndex` on `PropositionNode.embedding`
(fixes the vector index label, property, name and similarity as constants on
`DrivinePropositionRepository` - not configurable). Everything else that looks like a DICE annotation
is inherited: `@LlmTool` / `@LlmTool.Param` and `@ApiStatus` (JetBrains), plus the Spring pair
`@ConfigurationProperties` / `@AutoConfiguration`. Do not present a broad DICE annotation set;
`@Agent` / `@Action` / `@State` / `@Tool` belong to the `embabel-agent` skill.

## Common Pitfalls

1. **Copying the README's install coordinates** - they are stale on both groupId and version.
2. **Inventing `embabel-dice-*` artifactIds** - use the nine real module names.
3. **Reusing the old `dice.memory.*` / `dice.resolver.*` YAML** - no such prefix exists; the 0.5/10
   defaults are `embabel.dice.mcp.*`.
4. **"Unifying" `dice.security.api-key` under `embabel.dice.`** - upstream really does split it.
5. **Importing `DataDictionary` / `ContextId` from a `dice` package** - they are
   `com.embabel.agent.core.*`.
6. **`PropositionPipeline.builder()`** - use `PropositionPipeline.withExtractor(...)` and reassign;
   the pipeline is immutable.
7. **Writing `SchemaAdherence.LOOSE`** - the values are `STRICT` / `DEFAULT` / `RELAXED`.
8. **Skipping `persist()`** - the pipeline returns unsaved results by design.
9. **`PropositionQuery.create()`** - does not exist; always scope by `ContextId`.
10. **Assuming vector/graph/temporal capability** - `instanceof` the capability interface first.
11. **Turning on `dice_store` without saying what it costs** - empty mentions, no provenance.
12. **Presenting the metamodel DSL as stable** - it is EXPERIMENTAL and nothing is released.

## When NOT to Use

- Authoring agents, actions, goals, planners, providers, `@Agent`/`@Action`/`@State`/`@Tool`, or
  publishing an agent as an MCP server - use the `embabel-agent` skill. DICE only consumes it.
- Neo4j object mapping, `@Node`/`@Relationship` entities, Cypher repositories - `embabel-drivine4j`.
- Generic RAG over documents with no proposition store, or plain vector search - use a vector store
  directly; DICE is about the domain model plus the proposition system of record.
- Building DICE itself, or anything in `dice-integration-tests` / `dice-user-guide` / `docs/design/`.
- Anything you cannot attest from `raw/dice-docs-0.2.0/` - the collected corpus carries 2 of the
  `dice` module's 297 main-source files, so absence there is **not** absence from the library. Verify
  a code-level identifier against `src/main` before adding or dropping it.

## Verification Checklist

- [ ] Coordinates taken from `pom.xml`, not from `README.md:2630-2632`
- [ ] No tag or release implied; `main` / `-SNAPSHOT` only
- [ ] Only the nine real module names appear in dependency snippets
- [ ] Every property key sits under one of the five real prefixes, split preserved
- [ ] No `embabel-dice-*` artifactId, no `VectorProjector`/`OracleProjector`/`StrictProjectionPolicy`
- [ ] `SchemaAdherence` uses STRICT / DEFAULT / RELAXED
- [ ] Metamodel material carries the EXPERIMENTAL caveat; `DeclaredSchema` cited at
      `DeclaredSchemaSource.kt:47`
- [ ] The MCP dependency pair is presented as UNRESOLVED, not silently narrowed to one artifact

## References

- `references/pipeline.md` - modules, coordinates, pipeline/extractor/reviser shapes, dedup, query API
- `references/entity-resolution.md` - resolver and searcher surface, resolution levels, tuning
- `references/memory.md` - Memory facade, knowledge types, projection buckets, retrieval, maintenance
- `references/projections.md` - the four projections, policies, Drivine storage switch, reclamation

The MCP surface (Step 9) and the metamodel DSL (Step 10) are documented inline above rather than in
separate reference files - both are small enough to live in the main body, and their identifiers were
verified against `raw/dice-docs-0.2.0/` (`dice_recall` / `dice_list` / `dice_store` / `dice_get` in
`DiceMcpTools.kt`; `MetamodelVersion` / `DeclaredSchema` / `DeclaredSchemaSource`).

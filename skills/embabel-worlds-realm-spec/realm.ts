// Starter template — a captured realm written in TypeScript.
// Write ONE realm.ts with defineRealm; let realm-synth generate the files and
// the handler types:  realm-synth --types .embabel/realm.d.ts
//
// Under defineRealm, a goal, producer, lens, channel or consumer naming a
// handler this realm does not declare is a COMPILE ERROR. A realm with no
// handlers block declares none, so every handler name in it is refused.
//
// Full contract: raw/realm-spec-docs/TYPESCRIPT_REALMS.md (see the raw docs
// index). Every capability is its own owner approval; the owner binds the
// credentials this realm declares.

export default defineRealm({
  name: "example",
  description: "Example captured realm",

  handlers: {
    // "example.ping": async (input, ctx) => "pong",
  },

  // Captured producers are handlers: no kind, no operation, no args, no cache.
  // The handler gets keys as a list under keyArgument and returns records that
  // carry their key under recordKeyField. Cover EVERY filter the source can
  // apply with a pushdown rule.
  //
  // producers: {
  //   "example-by-key": {
  //     handler: "example.fetch",
  //     keyArgument: "keys",
  //     joins: [{ targetLabel: "Example", anchorLabel: "Anchor",
  //               relationship: "HAS_EXAMPLE", keyField: "key",
  //               recordKeyField: "key" }],
  //   },
  // },
});

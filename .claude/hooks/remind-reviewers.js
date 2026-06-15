#!/usr/bin/env node
// Hook PostToolUse (Edit/Write/MultiEdit) pentru aplicatia agro.
// Reaminteste lansarea celor 3 revizori dupa fiecare modificare de cod.
// Vezi CLAUDE.md > "Revizuire obligatorie". Cross-platform (Mac + Windows), ruleaza cu node.

const reminder = [
  '🔁 Cod modificat. INAINTE de a raporta "gata" sau de a publica (git push),',
  "lanseaza OBLIGATORIU cei 3 revizori, in paralel:",
  "   1) architecture-reviewer   2) performance-reviewer   3) security-reviewer",
  "Raporteaza constatarile pe severitate (Critical/High/Medium/Low).",
  "Daca exista Critical sau High nerezolvate: NU declara terminat si NU publica.",
  'Detalii: CLAUDE.md > "Revizuire obligatorie".'
].join("\n");

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: reminder
    }
  })
);
process.exit(0);

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  withIsolatedWorkspace
} = require("../test-support/isolated-runtime");

test("critical alert workflow actions are persisted with automatic progression", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const {
      getCriticalAlertState,
      recordCriticalAlertAction,
      updateCriticalAlertState
    } = load("src/automation-state.js");

    updateCriticalAlertState("2026-04-20", {
      lastStatus: "CRITIC",
      lastAlertAt: "2026-04-20T10:00:00.000Z"
    });

    recordCriticalAlertAction("2026-04-20", "manager", "view");
    recordCriticalAlertAction("2026-04-20", "control", "work");
    recordCriticalAlertAction("2026-04-20", "manager", "resolve");

    const state = getCriticalAlertState("2026-04-20");

    assert.ok(state.actions.viewedBy.manager);
    assert.ok(state.actions.viewedBy.control);
    assert.ok(state.actions.inProgressBy.control);
    assert.ok(state.actions.inProgressBy.manager);
    assert.ok(state.actions.resolvedBy.manager);
    assert.equal(state.actions.lastAction.type, "resolve");
    assert.equal(state.actions.lastAction.username, "manager");
  });
});

test("critical alerts status summarizes tracked alerts for admin dashboard", async () => {
  await withIsolatedWorkspace(async ({ load }) => {
    const {
      linkTelegramUser,
      updateCriticalAlertState
    } = load("src/automation-state.js");
    const { getCriticalAlertsStatus } = load("src/critical-alerts.js");

    linkTelegramUser("manager", {
      chatId: "1001",
      telegramUsername: "manager",
      firstName: "Manager"
    });

    updateCriticalAlertState("2026-04-20", {
      lastStatus: "CRITIC",
      lastReason: "presiune pe cash",
      lastTrigger: "transaction-created",
      lastAlertAt: "2026-04-20T11:00:00.000Z",
      escalation: {
        escalatedAt: "2026-04-20T11:20:00.000Z",
        escalationCount: 1,
        lastEscalationReason: "Fara raspuns la alerta critica",
        lastEscalationTrigger: "no-response"
      }
    });

    updateCriticalAlertState("2026-04-19", {
      lastStatus: "CRITIC",
      lastReason: "livrari fara factura",
      lastTrigger: "delivery-updated",
      lastAlertAt: "2026-04-19T16:00:00.000Z",
      actions: {
        viewedBy: {
          manager: "2026-04-19T16:05:00.000Z"
        },
        inProgressBy: {
          control: "2026-04-19T16:07:00.000Z"
        },
        resolvedBy: {
          manager: "2026-04-19T16:20:00.000Z"
        },
        lastAction: {
          type: "resolve",
          username: "manager",
          at: "2026-04-19T16:20:00.000Z"
        }
      }
    });

    const status = await getCriticalAlertsStatus();

    assert.equal(status.botReady, false);
    assert.equal(status.linkedRecipients, 1);
    assert.equal(status.totalTrackedAlerts, 2);
    assert.equal(status.criticalOpenAlerts, 1);
    assert.equal(status.escalatedAlerts, 1);
    assert.equal(status.criticalAlerts[0].date, "2026-04-20");
    assert.equal(status.criticalAlerts[0].workflowStatus, "Escalata");
    assert.equal(status.criticalAlerts[0].escalationReason, "Fara raspuns la alerta critica");
    assert.equal(status.criticalAlerts[1].workflowStatus, "Rezolvata");
    assert.match(status.criticalAlerts[1].viewedActors, /manager 2026-04-19 16:05/);
    assert.match(status.criticalAlerts[1].inProgressActors, /control 2026-04-19 16:07/);
    assert.match(status.criticalAlerts[1].resolvedActors, /manager 2026-04-19 16:20/);
  });
});

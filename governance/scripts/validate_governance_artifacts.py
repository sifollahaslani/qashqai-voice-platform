"""Validate lightweight QashqAI Voice governance enforcement artifacts.

This script checks the rule sample and decision-trace sample for structural
consistency. It does not approve governed actions or replace human review.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
GOVERNANCE = ROOT / "governance"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def validate_rules(rules: dict, schema: dict, errors: list[str]) -> None:
    require(rules.get("default_decision") == "deny", "default_decision must be deny", errors)
    require("revocation" in rules.get("precedence", []), "precedence must include revocation", errors)
    require("active_consent" in rules.get("precedence", []), "precedence must include active_consent", errors)
    require("cultural_validation" in rules.get("precedence", []), "precedence must include cultural_validation", errors)

    actions = rules.get("actions", {})
    require(isinstance(actions, dict) and actions, "actions must be a non-empty object", errors)
    schema_actions = set(schema.get("properties", {}).get("requested_action", {}).get("enum", []))
    require(schema_actions.issubset(set(actions)), "all schema requested_action values must have enforcement rules", errors)

    high_risk_actions = {
        "embedding",
        "ai_training",
        "synthetic_voice",
        "institutional_export",
        "research_export",
        "public_release",
        "dataset_creation",
        "access_level_change",
        "revocation_update",
    }
    for action, config in actions.items():
        require("required_consent_field" in config, f"{action} missing required_consent_field", errors)
        require("blocked_validation_statuses" in config, f"{action} missing blocked_validation_statuses", errors)
        if action not in {"revocation_update", "emergency_restriction"}:
            require("revoked" in config.get("blocked_validation_statuses", []), f"{action} must block revoked status", errors)
        if action in high_risk_actions:
            require(
                config.get("human_approval_required_for_allow") is True,
                f"{action} must require human approval",
                errors,
            )


def validate_lifecycle_rules(lifecycle: dict, errors: list[str]) -> None:
    require(
        lifecycle.get("default_on_missing_rule") == "hold_for_review",
        "lifecycle default_on_missing_rule must be hold_for_review",
        errors,
    )
    require(
        lifecycle.get("default_on_parser_or_validation_failure") == "hold_for_review",
        "parser or validation failure must hold_for_review",
        errors,
    )

    required_results = {"denied", "hold_for_review", "revoked", "emergency_restricted", "invalidated"}
    trace_results = set(lifecycle.get("trace_required_results", []))
    audit_results = set(lifecycle.get("audit_required_results", []))
    require(required_results.issubset(trace_results), "all deny/hold/revoke/invalidate results must require traces", errors)
    require(required_results.issubset(audit_results), "all deny/hold/revoke/invalidate results must require audit", errors)

    states = set(lifecycle.get("states", []))
    classes = set(lifecycle.get("artifact_classes", []))
    transitions = lifecycle.get("transitions", [])
    require(isinstance(transitions, list) and transitions, "lifecycle transitions must be non-empty", errors)

    for transition in transitions:
        transition_id = transition.get("transition_id", "unknown")
        require(transition.get("to") in states, f"{transition_id} has unknown target state", errors)
        for prior_state in transition.get("from", []):
            require(prior_state == "*" or prior_state in states, f"{transition_id} has unknown prior state {prior_state}", errors)
        for artifact_class in transition.get("artifact_classes", []):
            require(
                artifact_class == "*" or artifact_class in classes,
                f"{transition_id} has unknown artifact class {artifact_class}",
                errors,
            )
        require(transition.get("decision_trace_required") is True, f"{transition_id} must require decision trace", errors)
        require(transition.get("audit_required") is True, f"{transition_id} must require audit", errors)
        if transition.get("to") in set(lifecycle.get("irreversible_states", [])):
            require(
                transition.get("human_approval_required") is True,
                f"{transition_id} to irreversible state must require human approval",
                errors,
            )


def validate_decision_trace(trace: dict, rules: dict, lifecycle: dict, errors: list[str]) -> None:
    allowed_results = {
        "allowed",
        "denied",
        "hold_for_review",
        "revoked",
        "emergency_restricted",
        "invalidated",
    }
    require(trace.get("result") in allowed_results, "decision trace result is invalid", errors)
    require(trace.get("requested_action") in rules.get("actions", {}), "requested_action is not in rules actions", errors)
    require(bool(trace.get("reasons")), "decision trace must include reasons", errors)
    require(bool(trace.get("rules_evaluated")), "decision trace must include rules_evaluated", errors)
    require(trace.get("audit", {}).get("audit_required") is True, "audit_required must be true", errors)
    require(trace.get("audit", {}).get("decision_id") == trace.get("decision_id"), "audit decision_id must match trace decision_id", errors)
    require(bool(trace.get("lifecycle_transition")), "decision trace must include lifecycle_transition", errors)
    transition_ids = {transition.get("transition_id") for transition in lifecycle.get("transitions", [])}
    trace_transition = trace.get("lifecycle_transition", {})
    require(
        trace_transition.get("transition_id") in transition_ids,
        "decision trace lifecycle transition_id must exist in lifecycle rules",
        errors,
    )

    evidence_classes = set(rules.get("evidence_classes", []))
    for record in trace.get("input_records", []):
        require(
            record.get("evidence_class") in evidence_classes,
            f"invalid evidence_class for {record.get('record_id', 'unknown record')}",
            errors,
        )


def main() -> int:
    errors: list[str] = []
    rules = load_json(GOVERNANCE / "rules" / "enforcement_rules.sample.json")
    lifecycle = load_json(GOVERNANCE / "rules" / "lifecycle_transitions.sample.json")
    trace = load_json(GOVERNANCE / "schemas" / "decision_trace.sample.json")
    schema = load_json(GOVERNANCE / "schemas" / "decision_trace.schema.json")

    validate_rules(rules, schema, errors)
    validate_lifecycle_rules(lifecycle, errors)
    validate_decision_trace(trace, rules, lifecycle, errors)

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print("Governance enforcement artifacts validated.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

Start a new speaker intake session using the voice-collector agent.

This command begins the first stage of the QashqAI Voice pipeline. It will:
1. Check for an existing consent document for this speaker
2. Collect and register speaker metadata
3. Verify audio file naming and organization
4. Produce a session log and handoff note for the Cultural Guardian

**Usage:** `/intake [optional: speaker name or ID]`

If no speaker is specified, the agent will prompt for details interactively.

Before running, ensure you have:
- The speaker's signed consent form (physical or digital)
- The audio recording files accessible on this machine
- A note of the recording date, location, and topics covered

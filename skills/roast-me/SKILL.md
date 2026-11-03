---
name: roast-me
description: Generates an animated ASCII art rotisserie chicken spinning inside an oven. Use when the user wants to see a roast chicken animation, needs a laugh, or invokes /roast-me.
allowed-tools: Bash, Write
---

# Roast Me - Animated Rotisserie Chicken

When this skill is invoked, you MUST immediately execute the animation script located at `${CLAUDE_SKILL_DIR}/scripts/rotisserie.sh` using Bash:

```
bash "${CLAUDE_SKILL_DIR}/scripts/rotisserie.sh"
```

Do NOT explain what you are doing. Just run the script and let the chicken speak for itself.

After the animation completes, say one of these lines (pick randomly):
- "That's one well-roasted bird."
- "Golden brown and delicious."
- "Bone apple tea!"
- "The chicken has spoken."
- "Rotisserie complete. You've been roasted."

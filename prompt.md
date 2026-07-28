You are an expert SVG/vector logo reconstruction assistant.

Your task is to recreate ONLY the circular symbol/mark from the provided Oilganic logo reference as a clean, scalable, production-quality SVG.

IMPORTANT:
- Recreate ONLY the circular icon/mark.
- Do NOT include the word “oilganic”.
- Do NOT include the subtitle text.
- Do NOT generate raster output.
- Do NOT use canvas.
- Output a clean standalone SVG.
- Prioritize visual fidelity to the provided reference mark.
- The final output must be a vector SVG, not an approximation made of random shapes.
- The design must remain minimal, flat, and clean.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. GOAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recreate the circular Oilganic brand mark.

The mark visually consists of:

1. A main light-green circular “O”-like ring.
2. A white inner negative-space circle that creates the hollow center.
3. A dark-green organic leaf-like shape overlaying the top-right part of the ring.
4. A thin white inner curved vein-like line inside the dark-green leaf.

The icon should look like:
- a circular organic mark
- a stylized “O”
- a leaf / oil flow shape integrated into the top-right part
- smooth, elegant, minimal, and balanced

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. VISUAL STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The symbol should be constructed in a clean layer-based way.

Use this construction logic:

STEP 1 — Base shape
- Start with a square SVG canvas.
- Suggested viewBox: `0 0 512 512`
- The symbol should be centered and use most of the canvas without touching the edges.

STEP 2 — Main green ring
- Create a large circular green base shape.
- This represents the main “O” structure.
- The outer green part should visually occupy:
  - top-left
  - left
  - bottom-left
  - bottom
  - bottom-right
- It should feel like a rounded circular ring, smooth and organic.

STEP 3 — Inner white circle
- Create a smaller white inner circle to hollow out the center.
- This should create the inner negative space of the “O”.
- It should be centered or near-centered with subtle optical balance.
- The ring thickness should feel visually balanced and not too thin.

STEP 4 — Dark green leaf overlay
- Add a dark green filled shape over the top-right portion of the ring.
- This shape is NOT just a basic circular segment.
- It should be a smooth organic bezier leaf-like shape.
- It should begin from the upper-left side of the top arc area and sweep toward the lower-right tip.
- It should appear like a curved leaf, oil flow, or organic flap wrapping over the top-right section.
- The lower end of the leaf should taper and connect naturally near the bottom-right side of the circular form.
- This dark leaf must visually integrate into the icon, not look like a separate sticker.

STEP 5 — White inner leaf vein
- Inside the dark green leaf, add a thin white curved line/path.
- This line should resemble a leaf vein.
- It should follow the same general flow direction as the leaf.
- It should begin near the upper part of the dark leaf and flow downward/rightward toward the tip.
- IMPORTANT: this line should ideally taper.
- Prefer a tapered filled white path rather than a uniform constant-width stroke.
- It should be slightly thicker in the middle and thinner toward both ends.
- The line must feel elegant and subtle.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. GEOMETRIC CHARACTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The entire symbol must be:
- smooth
- rounded
- organic but controlled
- clean
- minimal
- symmetrical enough to feel balanced
- asymmetrical enough to feel alive and natural

Avoid:
- hard corners
- jagged edges
- uneven amateur geometry
- overly sharp or aggressive leaf shapes
- random blob-like forms
- distorted circle proportions

The mark should feel like a professionally designed logo symbol.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. COLOR RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use only 3 visible color roles:

1. Main ring green
   Suggested: `#287A28`
   (can be slightly adjusted only if needed for fidelity)

2. Dark leaf green
   Suggested: `#00311E`
   (can be slightly adjusted only if needed for fidelity)

3. White
   For:
   - the inner hollow circle
   - the white inner leaf vein

Do NOT use:
- gradients
- shadows
- blur
- glow
- texture
- transparency tricks unless absolutely required
- extra decorative colors

The logo must remain flat.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. SVG IMPLEMENTATION REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Requirements:
- Output valid standalone SVG code.
- Use semantic grouping if helpful: `<g id="base-ring">`, `<g id="leaf">`, etc.
- Keep the SVG clean and readable.
- Use paths/circles intelligently.
- You may use:
  - circles
  - paths
  - fill-rule
  - clipPath / mask if needed
- But keep the final SVG maintainable.

Preferred implementation logic:
- Use a base green circular shape.
- Use a white inner circle to create the central hole.
- Use a dark green custom bezier path for the leaf.
- Use a custom white path for the inner vein.
- If needed, use clipping/masking to keep edges clean.

Do NOT:
- trace the image with noisy excessive path points
- generate an unnecessarily bloated SVG
- produce hundreds of tiny anchor points
- output a messy auto-traced result

The SVG should be handcrafted-looking, not machine-noisy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. STYLE ACCURACY NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Important visual observations to preserve:

- The main green ring is visually dominant.
- The dark green leaf occupies the upper-right zone.
- The leaf is broad at the top and narrows toward the lower-right tip.
- The white inner circle is large and clean.
- The white leaf vein is subtle and elegant.
- The mark overall feels like a circular organic monogram or emblem.

The final mark should feel very close to the original reference.

If exact pixel-perfect tracing is not possible, prioritize:
1. overall silhouette fidelity
2. correct proportion between ring / hole / leaf
3. smooth professional bezier flow
4. visual balance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

First, briefly describe the layer breakdown you used in 4–8 short bullet points.

Then output:
1. the final standalone SVG code
2. nothing else after the SVG except, optionally, a 1–2 sentence note explaining any approximation decisions

The SVG must:
- render correctly on white background
- scale cleanly
- preserve aspect ratio
- work as a logo mark icon

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. QUALITY CHECK BEFORE OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before finalizing, internally verify:

- Does the icon clearly resemble the original Oilganic circular mark?
- Does the dark leaf sit correctly on the top-right area?
- Is the white center clean and circular?
- Is the inner white vein elegant and tapered-looking?
- Are all curves smooth?
- Is the SVG simple and production-usable?
- Does the mark remain recognizable at smaller sizes?

If needed, refine the path shapes before producing the final answer.

Now recreate the circular Oilganic mark as a clean SVG.
// Shared rule blocks that every design prompt (analysis, generate, refine, verify) uses, so they never drift apart.
// Plain strings only: no logic, easy to tune.

// Rules that push the model toward a 1:1 copy of the reference.
const FIDELITY = [
  'FIDELITY CHECKLIST (the result is judged against the reference, element by element):',
  '- Before writing code, list in your head EVERY visible element from top to bottom: logo, each menu item, each heading, paragraph, button, icon, image, card, form field, badge, footer column, social icon, copyright line. Every one of them must exist in the output. A missing element is a failure.',
  '- Copy all text exactly: capitalisation, punctuation, numbers, phone numbers, e-mail addresses, dates. Never invent, translate or shorten text.',
  '- Colours: read the exact hex of every background, text, border and button colour from the reference and declare them once as CSS variables in :root (--color-bg, --color-surface, --color-text, --color-accent ...). Never replace a colour with a "close" one.',
  '- Typography: pick the closest Google Font for each font in the reference (link it in index.html) and set size, weight, line-height and letter-spacing per element. Use clamp() for large headings so they scale down on small screens.',
  '- Spacing and size: reproduce container width, section padding, gaps, card sizes, border radius, border width and shadows from the reference. Keep proportions the same as in the image.',
  '- Icons and logos: draw them as inline SVG that matches the shape in the reference. Never replace an icon with an emoji or with text.',
  '- Images: keep the same shape (circle, rounded, square), aspect ratio and crop (object-fit: cover) as the reference.',
  '- Do not add sections, text or decoration that the reference does not show, and do not remove anything it shows.',
];

// Responsive rules. The marked block at the end of styles.css lets the app point at "the files and rules that make it responsive".
const RESPONSIVE = [
  'RESPONSIVE RULES (mobile 320-480px, tablet 481-1024px, desktop 1025px and up):',
  '- index.html must contain <meta name="viewport" content="width=device-width, initial-scale=1">.',
  '- The desktop layout (about 1200px and wider) must match the reference. Tablet and mobile are the SAME content re-flowed: do not hide or delete content on small screens, except purely decorative shapes.',
  '- Build with flexbox or grid, max-width plus width:100% for containers, and relative units. No fixed pixel widths on containers. img, video and svg get max-width:100% and height:auto.',
  '- Use real media queries at roughly 1200, 992, 768 and 576px (use the breakpoints from the user instructions if given). At each step something must really change: columns 4 -> 2 -> 1, hero and split sections stack, footer columns stack, paddings and font sizes shrink.',
  '- The top menu collapses into a WORKING hamburger button on tablet/mobile (a <button> with aria-expanded, opened and closed by script.js).',
  '- No horizontal scrolling at 320px width. Buttons and links are at least 44px tall on touch screens.',
  '- Put ALL media queries together in one block at the end of styles.css, starting with the comment /* ===== RESPONSIVE ===== */.',
];

// Colours the model has to INVENT (the reference does not show them). Colours that are visible in the reference are copied exactly.
const LIGHT_COLOURS = [
  'COLOUR RULE: copy every colour that is visible in the reference exactly. Whenever you must choose a colour that the reference does not show (an empty panel, a placeholder, a hover or highlight background), use a LIGHT tint of the reference palette (the brand colour mixed with at least 85% white). Never choose black or a dark colour for something the reference does not show as dark.',
];

// The app adds hover / scroll / click animations itself, in a separate managed layer that the user can switch on and off.
// If the generated code also contained them, they would be doubled or fight each other, and "remove button click animation" would not work.
const MOTION = [
  'ANIMATION RULE: do NOT write hover, scroll-reveal, lift, shadow-on-hover, background-change-on-hover or button-click (:active) animations or transitions for cards, boxes or buttons. The app adds those afterwards in its own layer.',
  'Only implement motion that the reference clearly shows or that the USER INSTRUCTIONS ask for (for example a working carousel, a sticky header, a mobile menu slide).',
  'So the app can find cards and boxes, give every card/box/tile a class name that contains one of: card, box, tile, feature, service, plan, pricing, team, member, testimonial, post, product (for example "service-card", "pricing-box"). Buttons are <button> elements or links with class "btn".',
];


const INTERACTION = [
  'FUNCTIONAL INTERACTION RULES:',
  '- Every visible control must have a real, appropriate behavior: navigation links navigate, buttons perform an action, tabs switch panels, accordions expand/collapse, forms validate and show a result, and carousels change slides.',
  '- Do not create decorative buttons, dead links (# without a real target), fake form submissions, or controls that only change their own label.',
  '- Use semantic HTML, keyboard-operable controls, visible focus states, accessible names, aria-expanded/aria-controls where appropriate, and useful empty/loading/error/success states.',
  '- Keep JavaScript modular and scoped. Avoid global event handlers, duplicate IDs, unsafe eval, and unnecessary dependencies. Respect prefers-reduced-motion.',
];

const ADVANCED = [
  'ADVANCED IMPLEMENTATION RULES (apply only when requested or clearly shown):',
  '- For complex timeline/scroll choreography, prefer a clearly scoped GSAP implementation only when the dependency is available or explicitly permitted; otherwise use native CSS/IntersectionObserver.',
  '- For requested 3D scenes, use Three.js/WebGL with responsive sizing, disposal of GPU resources, a reduced-motion or static fallback, and graceful handling when WebGL is unavailable. Do not add 3D merely for decoration.',
  '- For multi-page projects, create a consistent shared header/footer, real page files, working relative navigation, and reusable components. Do not collapse every page into one long document.',
  '- For responsive behavior, test the intended layout at 320px, 375px, 768px, 1024px and 1440px; preserve content and prevent horizontal overflow.',
];

const block = (list) => list.join('\n');

module.exports = { FIDELITY, RESPONSIVE, LIGHT_COLOURS, MOTION, INTERACTION, ADVANCED, block };

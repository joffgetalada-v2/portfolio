// React hoists and dedupes <style> by href, so any component can render this.
const css = `
@keyframes cb-nudge { 0%, 100% { transform: translateY(0); opacity: .55 } 50% { transform: translateY(4px); opacity: 1 } }
@keyframes cb-scan { 0% { transform: translateX(-110%) } 100% { transform: translateX(260%) } }
@keyframes cb-breathe { 0%, 100% { opacity: .45 } 50% { opacity: 1 } }
`;

export function UiKeyframes() {
  return (
    <style href="portfolio-ui-keyframes" precedence="low">
      {css}
    </style>
  );
}

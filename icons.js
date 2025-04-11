// Lucide icon SVG paths
const icons = {
  x: 'M18 6L6 18M6 6l12 12', // X (close) icon
};

// Create an SVG element with the specified icon path
function createIcon(name, size = 24, color = 'currentColor') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', color);
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', icons[name]);
  svg.appendChild(path);

  return svg;
}

// Export the functions and icons
window.ClaudeIcons = {
  createIcon,
  icons
}; 
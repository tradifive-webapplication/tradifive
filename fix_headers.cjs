const fs = require('fs');
const path = 'src/pages/Landing.tsx';
let content = fs.readFileSync(path, 'utf8');

const gradientStyle = 'style={{ background: "linear-gradient(to right, #ffffff, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}';

// 1. Trading Is More Than Charts
content = content.replace(
  /<span className="text-white">Trading Is More Than<\/span> <span style={{ background: "linear-gradient\(to right, #93c5fd, #3b82f6\)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Charts\.<\/span><br \/>/g,
  `<span ${gradientStyle}>Trading Is More Than Charts.</span><br />`
);

// 2. Everything You Need To
content = content.replace(
  /<span className="text-white">Everything You<\/span> <span style={{ background: "linear-gradient\(to right, #93c5fd, #3b82f6\)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Need To<\/span><br \/>/g,
  `<span ${gradientStyle}>Everything You Need To</span><br />`
);

// 3. Start Free
content = content.replace(
  /<span className="text-white">Start<\/span> <span style={{ background: "linear-gradient\(to right, #93c5fd, #3b82f6\)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Free\.<\/span><br \/>/g,
  `<span ${gradientStyle}>Start Free.</span><br />`
);

// 4. Traders who chose to grow together
content = content.replace(
  /<span className="text-white">Traders who chose<\/span> <span style={{ background: "linear-gradient\(to right, #93c5fd, #3b82f6\)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>to grow together\.<\/span>/g,
  `<span ${gradientStyle}>Traders who chose to grow together.</span>`
);

// 5. Frequently Asked Questions
content = content.replace(
  /<span className="text-white">Frequently<\/span> <span style={{ background: "linear-gradient\(to right, #93c5fd, #3b82f6\)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Asked Questions<\/span>/g,
  `<span ${gradientStyle}>Frequently Asked Questions</span>`
);

// 6. Thousands of traders are using
content = content.replace(
  /<span className="text-white">Thousands of<\/span> <span style={{ background: "linear-gradient\(to right, #93c5fd, #3b82f6\)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>traders are using<\/span><br \/>/g,
  `<span ${gradientStyle}>Thousands of traders are using</span><br />`
);

// 7. Become The Trader
content = content.replace(
  /<span className="text-white">Become The<\/span> <span style={{ background: "linear-gradient\(to right, #93c5fd, #3b82f6\)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Trader<\/span><br \/>/g,
  `<span ${gradientStyle}>Become The Trader</span><br />`
);

// 8. Tradifive Mobile App
content = content.replace(
  /<span className="text-white">Tradifive<\/span> <span style={{ background: "linear-gradient\(to right, #93c5fd, #3b82f6\)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mobile App<\/span>/g,
  `<span ${gradientStyle}>Tradifive Mobile App</span>`
);

fs.writeFileSync(path, content);
console.log("Updated headers to full gradient");

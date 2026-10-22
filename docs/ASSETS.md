# Asset Discovery, Licenses & Procedural Design — Gesture Pong AI

## 1. Asset Strategy

To guarantee 100% offline reliability, zero external asset 404s, and maximum cross-platform performance, Gesture Pong AI combines custom procedural Three.js geometry, Web Audio API sound synthesis, and high-performance SVG iconography.

---

## 2. Audio Subsystem (Web Audio API Synthesizer)
All sound effects are synthesized dynamically using the browser's native Web Audio API oscillators and gain envelopes (`client/src/services/audio.ts`):
- **Paddle Strike (`playHit`)**: Dual-tone triangle & sine wave with fast pitch decay, emulating layered wood and rubber contact.
- **Table Bounce (`playBounce`)**: Resonant sine pop at 680Hz decaying to 320Hz.
- **Net Brush (`playNet`)**: Low-pass filtered sawtooth flutter at 180Hz.
- **Score Chime (`playPointWon`)**: 4-note ascending A-major arpeggio (440Hz -> 880Hz).
- **Point Lost (`playPointLost`)**: 3-note soft descending tone.
- **Mission Accomplished (`playMissionComplete`)**: C-major fanfare harmonic chord.
- **License**: Custom procedural code, MIT License.

---

## 3. 3D Meshes & Materials
- **Table Tennis Table**: Regulation-accurate procedural geometry (2.74m x 1.525m x 0.76m) with cyan laminate surface, white boundary tape, 3mm center line, and perforated net mesh with support posts.
- **Table Tennis Paddles**: Dual-sided blade with realistic wooden ply core, rubber faces (Red front, Black back for player; Cyan front for opponent), and ergonomic contoured handles.
- **Ping Pong Ball**: 40mm diameter sphere with glowing emissive material and a dynamic motion trail buffer.
- **Esports Arena**: Stylized dark metallic court floor with glowing cyan and orange boundary rings, architectural back wall, and directional stadium lighting rig with soft shadows.
- **License**: Built with Three.js primitives under MIT License.

---

## 4. UI Sprites & Icons
- **Icons**: Lucide React icons (`lucide-react` v1.16.0), ISC License.
- **Typography**: Google Fonts Inter, Outfit, and JetBrains Mono (SIL Open Font License 1.1).
- **Celebration Effects**: `canvas-confetti` (MIT License).

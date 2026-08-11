// src/App.tsx
import ControlPanel from './components/ControlPanel';
import Fretboard from './components/Fretboard';
import CircleOfFifths from './components/CircleOfFifths';
import DraggableBox from './components/DraggableBox';
import './App.css';

export default function App() {
  return (
    <div className="App">
      <ControlPanel />

      <Fretboard />

      <DraggableBox title="Circle of Fifths" defaultX={350} defaultY={50}>
        <CircleOfFifths />
      </DraggableBox>
    </div>
  );
}
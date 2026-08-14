// src/App.tsx
import ControlPanel from './components/ControlPanel';
import Fretboard from './components/Fretboard';
import CircleOfFifths from './components/CircleOfFifths';
import DraggableBox from './components/DraggableBox';
import './App.css';


const isMobile = window.innerWidth <= 768;

export default function App() {
  return (
    <div className="App">
      <ControlPanel />
      <Fretboard />

      <div className='widget-container'>
        <DraggableBox
          title="Circle of Fifths"
          defaultX={isMobile ? 20 : 350}
          defaultY={isMobile ? 80 : 50}>
          <CircleOfFifths />
        </DraggableBox>
      </div>
    </div>
  );
}
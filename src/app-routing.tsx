import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import { BingoComponent, RoomJoinerComponent } from './components';

export default function AppRouting() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='' element={<App />} />
        <Route path='/join' element={<RoomJoinerComponent />} />
        <Route path='/bingo-game' element={<BingoComponent />} />
      </Routes>
    </BrowserRouter>
  )
};
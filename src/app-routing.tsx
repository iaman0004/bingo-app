import { Routes, Route, Navigate, MemoryRouter } from 'react-router-dom';

import { BingoComponent, RoomJoinerComponent } from './components';

export default function AppRouting() {
  return (
    <MemoryRouter>
      <Routes>
        <Route path='' element={<Navigate to="/join" replace />} />
        <Route path='/join' element={<RoomJoinerComponent />} />
        <Route path='/bingo-game' element={<BingoComponent />} />
      </Routes>
    </MemoryRouter>
  )
};
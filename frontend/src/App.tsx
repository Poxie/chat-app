import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { FeedbackProvider } from './contexts/FeedbackProvider';
import { RoomProvider } from './contexts/RoomProvider';
import { Room } from './pages/room/Room';

function App() {
  return (
    <div className="App">
      <Router>
        <Route path="/:roomId" render={() => (
          <FeedbackProvider>
            <RoomProvider>
              <Room />
            </RoomProvider>
          </FeedbackProvider>
        )} />
      </Router>
    </div>
  );
}

export default App;

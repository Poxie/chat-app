import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { ChatProvider } from './contexts/ChatProvider';
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
              <ChatProvider>
                <Room />
              </ChatProvider>
            </RoomProvider>
          </FeedbackProvider>
        )} />
      </Router>
    </div>
  );
}

export default App;

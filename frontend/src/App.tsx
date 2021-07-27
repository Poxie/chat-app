import { BrowserRouter as Router, Route } from 'react-router-dom';
import { AuthenticationProvider } from './contexts/AuthenticationProvider';
import { ChatProvider } from './contexts/ChatProvider';
import { DeviceProvider } from './contexts/DeviceProvider';
import { FeedbackProvider } from './contexts/FeedbackProvider';
import { ModalProvider } from './contexts/ModalProvider';
import { RoomProvider } from './contexts/RoomProvider';
import { SidebarProvider } from './contexts/SidebarProvider';
import { Room } from './pages/room/Room';

function App() {
  return (
    <div className="App">
      <Router>
        <Route path="/:roomId" render={() => (
          <DeviceProvider>
            <ModalProvider>
              <AuthenticationProvider>
                <FeedbackProvider>
                  <RoomProvider>
                    <SidebarProvider>
                      <ChatProvider>
                        <Room />
                      </ChatProvider>
                    </SidebarProvider>
                  </RoomProvider>
                </FeedbackProvider>
              </AuthenticationProvider>
            </ModalProvider>
          </DeviceProvider>
        )} />
      </Router>
    </div>
  );
}

export default App;

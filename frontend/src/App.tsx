import { BrowserRouter as Router, Route } from 'react-router-dom';
import { AttachmentProvider } from './contexts/AttachmentProvider';
import { AuthenticationProvider } from './contexts/AuthenticationProvider';
import { ChatProvider } from './contexts/ChatProvider';
import { DeviceProvider } from './contexts/DeviceProvider';
import { FeedbackProvider } from './contexts/FeedbackProvider';
import { ModalProvider } from './contexts/ModalProvider';
import { RoomProvider } from './contexts/RoomProvider';
import { SidebarProvider } from './contexts/SidebarProvider';
import { Home } from './pages/home/Home';
import { Room } from './pages/room/Room';

function App() {
  return (
    <div className="App">
      <Router>
        <ModalProvider>
          <Route path="/:roomId" render={() => (
            <DeviceProvider>
                <AuthenticationProvider>
                  <FeedbackProvider>
                    <SidebarProvider>
                      <AttachmentProvider>
                        <RoomProvider>
                          <ChatProvider>
                            <Room />
                          </ChatProvider>
                        </RoomProvider>
                      </AttachmentProvider>
                    </SidebarProvider>
                  </FeedbackProvider>
                </AuthenticationProvider>
            </DeviceProvider>
          )} />
          <Route 
            path="/"
            exact
            component={Home}
          />
        </ModalProvider>
      </Router>
    </div>
  );
}

export default App;

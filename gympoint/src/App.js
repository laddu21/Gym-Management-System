
import React, { useState, useEffect } from 'react';
import './App.css';
import Main from './Components/Dashboard/Home/MainPage/Main';
import SignInPage from './Pages/SignInPage';
import RegisterGym from './Pages/RegisterGym';


function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(true);
  const [registeredUser, setRegisteredUser] = useState(null); // { gymName, email }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Check login persistence
      const storedAuthenticated = localStorage.getItem('authenticated') === 'true';
      const loginTime = localStorage.getItem('loginTime');
      let isAuthenticated = false;
      if (storedAuthenticated && loginTime) {
        const loginDate = new Date(parseInt(loginTime));
        const now = new Date();
        if (loginDate.getMonth() === now.getMonth() && loginDate.getFullYear() === now.getFullYear()) {
          isAuthenticated = true;
        } else {
          // Month changed, clear storage
          localStorage.removeItem('authenticated');
          localStorage.removeItem('loginTime');
          localStorage.removeItem('lastLoginMonth');
        }
      }

      setAuthenticated(isAuthenticated);

      // Check gyms exist
      try {
        const response = await fetch('/api/auth/gyms-exist');
        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            setRegisteredUser({ gymName: data.gymName });
            setShowRegister(false);
          } else {
            setShowRegister(true);
          }
        }
      } catch (err) {
        console.error('Failed to check gyms exist:', err);
        // If API fails but authenticated, assume gym exists
        if (isAuthenticated) {
          setRegisteredUser({ gymName: 'Gym' });
          setShowRegister(false);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleRegisterSuccess = (user) => {
    setRegisteredUser(user);
    setShowRegister(false); // After registration, show login
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div>
      {!authenticated ? (
        showRegister ? (
          <RegisterGym
            onRegisterSuccess={handleRegisterSuccess}
            onShowLogin={() => setShowRegister(false)}
          />
        ) : (
          <SignInPage
            onAuthSuccess={() => setAuthenticated(true)}
            registeredUser={registeredUser}
            onShowRegister={() => setShowRegister(true)}
          />
        )
      ) : (
        <Main gymName={registeredUser?.gymName} onLogout={() => {
          localStorage.removeItem('authenticated');
          localStorage.removeItem('loginTime');
          localStorage.removeItem('lastLoginMonth');
          setAuthenticated(false);
        }} />
      )}
    </div>
  );
}

export default App;

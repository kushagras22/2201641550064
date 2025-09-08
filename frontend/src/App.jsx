import React, { useEffect, useState } from 'react'
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TabNavigation } from './components/TabNavigation';
import { URLShortener } from './components/URLShortener';
import { Statistics } from './components/Statistics';

const App = () => {
  const [activeTab, setActiveTab] = useState('shortener');
  const [shortenedUrls, setShortenedUrls] = useState([]);

  useEffect(() => {
    try {
      const storedUrls = localStorage.getItem('shortenedUrls');
      if (storedUrls) {
        setShortenedUrls(JSON.parse(storedUrls));
      }
    } catch (error) {
      console.error("Failed to parse URLs from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('shortenedUrls', JSON.stringify(shortenedUrls));
    } catch (error) {
      console.error("Failed to save URLs to localStorage", error);
    }
  }, [shortenedUrls]);
  
  // Handle redirection
  useEffect(() => {
    const path = window.location.pathname.substring(1); 
    if (path) {
        const urlData = shortenedUrls.find(u => u.shortCode === path);
        if (urlData) {
             const updatedUrls = shortenedUrls.map(u => {
                if (u.shortCode === path) {
                    return {
                        ...u,
                        clicks: (u.clicks || 0) + 1,
                        clickData: [
                            ...(u.clickData || []),
                            {
                                timestamp: new Date().toISOString(),
                                source: document.referrer || 'Direct',
                                location: 'N/A' 
                            }
                        ]
                    };
                }
                return u;
            });
            setShortenedUrls(updatedUrls);
            window.location.href = urlData.originalUrl;
        }
    }
  }, [shortenedUrls]);


  const addShortenedUrl = (urlData) => {
    setShortenedUrls(prevUrls => [...prevUrls, urlData]);
  };

  const handleUrlClick = (shortCode) => {
     const updatedUrls = shortenedUrls.map(u => {
        if (u.shortCode === shortCode) {
            const newClickData = {
                timestamp: new Date().toISOString(),
                source: document.referrer || 'Direct',
                location: 'N/A'
            };
            return {
                ...u,
                clicks: u.clicks + 1,
                clickData: [...u.clickData, newClickData]
            };
        }
        return u;
    });
    setShortenedUrls(updatedUrls);
  };


  return (
    <div>
      <div className="app-container">
        <div className="container">
          <Header />
          <main>
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="content-wrapper">
              {activeTab === 'shortener' && <URLShortener addShortenedUrl={addShortenedUrl} shortenedUrls={shortenedUrls}/>}
              {activeTab === 'statistics' && <Statistics shortenedUrls={shortenedUrls} onUrlClick={handleUrlClick} />}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default App
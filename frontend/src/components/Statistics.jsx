import { useState } from "react";

export const Statistics = ({ shortenedUrls, onUrlClick }) => {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpansion = (shortCode) => {
        setExpandedId(expandedId === shortCode ? null : shortCode);
    };
    
    if (shortenedUrls.length === 0) {
        return <p className="stats-empty">No shortened URLs yet. Create some to see statistics here.</p>;
    }

    return (
        <div className="stats-container">
            {shortenedUrls.map((url) => (
                <div key={url.shortCode} className="stats-item">
                   <div className="stats-item-header" onClick={() => toggleExpansion(url.shortCode)}>
                        <div className="stats-item-urls">
                             <a 
                                href={url.shortUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={(e) => { e.stopPropagation(); onUrlClick(url.shortCode); }}
                                className="stats-url"
                              >
                                {url.shortUrl}
                            </a>
                            <p className="stats-original-url">{url.originalUrl}</p>
                        </div>
                        <div className="stats-metrics">
                            <div className="stats-metric">
                                <span className="stats-metric-value">{url.clicks}</span>
                                <span className="stats-metric-label">Clicks</span>
                            </div>
                           <div className="stats-metric">
                                <span className="stats-metric-label">Created</span>
                                <span className="stats-metric-value-small">{new Date(url.creationDate).toLocaleDateString()}</span>
                           </div>
                           <div className="stats-metric">
                               <span className="stats-metric-label">Expires</span>
                                <span className="stats-metric-value-small">{new Date(url.expiryDate).toLocaleDateString()}</span>
                           </div>
                        </div>
                         <div className="stats-toggle-icon">
                              {expandedId === url.shortCode ? '▲' : '▼'}
                         </div>
                   </div>

                    {expandedId === url.shortCode && (
                        <div className="stats-click-details">
                            <h4 className="stats-click-title">Click Details:</h4>
                            {url.clickData && url.clickData.length > 0 ? (
                               <ul className="stats-click-list">
                                  {url.clickData.map((click, index) =>(
                                    <li key={index}>
                                      {new Date(click.timestamp).toLocaleString()} - Source: {click.source}
                                    </li>
                                  ))}
                               </ul>
                            ) : (
                                <p className="stats-click-empty">No click data available.</p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

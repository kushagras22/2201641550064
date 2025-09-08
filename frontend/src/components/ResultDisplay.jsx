export const ResultsDisplay = ({ results }) => (
    <div className="results-container">
        <h3 className="results-title">Your shortened URLs:</h3>
        <div className="results-list">
            {results.map((result, index) => (
                <div key={index} className="result-item">
                    <div className="result-info">
                         <a href={result.originalUrl} target="_blank" rel="noopener noreferrer" className="result-url">{result.shortUrl}</a>
                         <p className="result-original-url">Original: {result.originalUrl}</p>
                         <p className="result-expiry">Expires: {new Date(result.expiryDate).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(result.shortUrl)}
                      className="button-copy"
                    >
                      Copy
                    </button>
                </div>
            ))}
        </div>
    </div>
);

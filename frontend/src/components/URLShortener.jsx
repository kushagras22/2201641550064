import { useState } from "react";
import { generateShortCode, isValidUrl } from "../utils/helper";
import { UrlInput } from "./URLInput";
import { ResultsDisplay } from "./ResultDisplay";

export const URLShortener = ({ addShortenedUrl, shortenedUrls }) => {
    const [inputs, setInputs] = useState([{ id: 1, url: '', shortCode: '', validity: '30' }]);
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');

    const addUrlInput = () => {
        if (inputs.length < 5) {
            setInputs([...inputs, { id: Date.now(), url: '', shortCode: '', validity: '30' }]);
        }
    };

    const removeUrlInput = (id) => {
        setInputs(inputs.filter(input => input.id !== id));
    };

    const handleInputChange = (id, field, value) => {
        const newInputs = inputs.map(input => {
            if (input.id === id) {
                return { ...input, [field]: value };
            }
            return input;
        });
        setInputs(newInputs);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setResults([]);

        const newUrls = [];
        let hasError = false;

        inputs.forEach(input => {
            if (!input.url.trim()) return;

            if (!isValidUrl(input.url)) {
                setError(`Invalid URL format for: ${input.url}`);
                hasError = true;
                return;
            }
            
            const validityInt = parseInt(input.validity, 10);
            if (isNaN(validityInt) || validityInt <= 0) {
                 setError(`Validity must be a positive number for: ${input.url}`);
                 hasError = true;
                 return;
            }
            
            let finalShortCode = input.shortCode.trim();
            if (finalShortCode) {
                 if (!/^[a-zA-Z0-9]+$/.test(finalShortCode)) {
                    setError(`Custom shortcode must be alphanumeric for: ${input.url}`);
                    hasError = true;
                    return;
                }
                if (shortenedUrls.some(u => u.shortCode === finalShortCode) || newUrls.some(u => u.shortCode === finalShortCode)) {
                    setError(`Shortcode "${finalShortCode}" is already taken.`);
                    hasError = true;
                    return;
                }
            } else {
                finalShortCode = generateShortCode();
                 while(shortenedUrls.some(u => u.shortCode === finalShortCode) || newUrls.some(u => u.shortCode === finalShortCode)) {
                     finalShortCode = generateShortCode();
                 }
            }

            const creationDate = new Date();
            const expiryDate = new Date(creationDate.getTime() + validityInt * 60000);

            const urlData = {
                originalUrl: input.url,
                shortCode: finalShortCode,
                shortUrl: `${window.location.origin}/${finalShortCode}`,
                creationDate: creationDate.toISOString(),
                expiryDate: expiryDate.toISOString(),
                clicks: 0,
                clickData: []
            };
            newUrls.push(urlData);
        });

        if (!hasError) {
             newUrls.forEach(addShortenedUrl);
             setResults(newUrls);
             setInputs([{ id: 1, url: '', shortCode: '', validity: '30' }]);
        }
    };


    return (
        <div>
            <form onSubmit={handleSubmit}>
                {inputs.map((input, index) => (
                    <UrlInput
                        key={input.id}
                        data={input}
                        onRemove={() => removeUrlInput(input.id)}
                        onChange={handleInputChange}
                        isFirst={index === 0}
                    />
                ))}
                 {error && <p className="error-message">{error}</p>}
                <div className="form-actions">
                    <button type="button" onClick={addUrlInput} disabled={inputs.length >= 5} className="button-secondary">
                        Add another URL
                    </button>
                    <button type="submit" className="button-primary">
                        Shorten
                    </button>
                </div>
            </form>
            
            {results.length > 0 && <ResultsDisplay results={results} />}
        </div>
    );
};
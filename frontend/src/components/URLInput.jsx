export const UrlInput = ({ data, onRemove, onChange, isFirst }) => (
    <div className="url-input-grid">
        <div className="url-input-group url-input-group-5">
            <label className="url-input-label">Original URL</label>
            <input
                type="url"
                placeholder="https://example.com"
                value={data.url}
                onChange={(e) => onChange(data.id, 'url', e.target.value)}
                className="url-input-field"
                required
            />
        </div>
        <div className="url-input-group url-input-group-3">
             <label className="url-input-label">Custom Shortcode (Optional)</label>
            <input
                type="text"
                placeholder="my-link"
                value={data.shortCode}
                onChange={(e) => onChange(data.id, 'shortCode', e.target.value)}
                className="url-input-field"
            />
        </div>
        <div className="url-input-group url-input-group-2">
             <label className="url-input-label">Validity (mins)</label>
            <input
                type="number"
                min="1"
                placeholder="30"
                value={data.validity}
                onChange={(e) => onChange(data.id, 'validity', e.target.value)}
                className="url-input-field"
            />
        </div>
        <div className="url-input-group url-input-group-2 url-input-remove-wrapper">
            {!isFirst && (
                <button type="button" onClick={onRemove} className="button-danger">
                    Remove
                </button>
            )}
        </div>
    </div>
);

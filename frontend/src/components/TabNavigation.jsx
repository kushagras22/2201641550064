export const TabNavigation = ({ activeTab, setActiveTab }) => (
  <div className="tab-navigation">
    <TabButton
      title="URL Shortener"
      isActive={activeTab === "shortener"}
      onClick={() => setActiveTab("shortener")}
    />
    <TabButton
      title="Statistics"
      isActive={activeTab === "statistics"}
      onClick={() => setActiveTab("statistics")}
    />
  </div>
);

export const TabButton = ({ title, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`tab-button ${isActive ? "tab-button-active" : ""}`}
  >
    {title}
  </button>
);

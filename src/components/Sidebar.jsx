const NAV = [
  { id: 'cases',      label: 'Disease Cases',    icon: 'https://img.icons8.com/ios/24/000000/hospital-3.png' },
  { id: 'patients',   label: 'Patients',          icon: 'https://img.icons8.com/ios/24/000000/user-male-circle.png' },
  { id: 'labtests',   label: 'Lab Tests',         icon: 'https://img.icons8.com/ios/24/000000/microscope.png' },
  { id: 'diseases',   label: 'Diseases',          icon: 'https://img.icons8.com/ios/24/000000/bacteria.png' },
  { id: 'facilities', label: 'Health Facilities', icon: 'https://img.icons8.com/ios/24/000000/clinic.png' },
  { id: 'districts',  label: 'Districts',         icon: 'https://img.icons8.com/ios/24/000000/map-marker.png' },
  { id: 'alerts',     label: 'Outbreak Alerts',   icon: 'https://img.icons8.com/ios/24/000000/high-priority.png' },
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img src="https://img.icons8.com/ios-filled/28/2563eb/health-book.png" alt="" />
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">Disease Surveillance</p>
            <p className="text-xs text-gray-400">DBMS Mini Project</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              activePage === item.id
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <img
              src={item.icon}
              alt=""
              className="w-4 h-4 opacity-70"
              style={activePage === item.id ? { filter: 'invert(34%) sepia(87%) saturate(1573%) hue-rotate(210deg)' } : {}}
            />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">Epidemiology Unit &copy; 2026</p>
      </div>
    </aside>
  );
}

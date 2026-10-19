import { useState } from 'react';
import Sidebar from './components/Sidebar';
import CasesPage from './components/CasesPage';
import PatientsPage from './components/PatientsPage';
import LabTestsPage from './components/LabTestsPage';
import DiseasesPage from './components/DiseasesPage';
import FacilitiesPage from './components/FacilitiesPage';
import DistrictsPage from './components/DistrictsPage';
import AlertsPage from './components/AlertsPage';

const PAGES = {
  cases: CasesPage,
  patients: PatientsPage,
  labtests: LabTestsPage,
  diseases: DiseasesPage,
  facilities: FacilitiesPage,
  districts: DistrictsPage,
  alerts: AlertsPage,
};

export default function App() {
  const [activePage, setActivePage] = useState('cases');
  const Page = PAGES[activePage] ?? CasesPage;

  return (
    <div className="flex h-screen bg-gray-50 font-poppins overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 overflow-y-auto">
        <Page />
      </main>
    </div>
  );
}

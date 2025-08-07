// Import the complete new implementation
import CompanyProfileNew from './CompanyProfileNew';
import CompanyProfileErrorBoundary from './CompanyProfileErrorBoundary';

const CompanyProfile: React.FC = () => {
  return (
    <CompanyProfileErrorBoundary>
      <CompanyProfileNew />
    </CompanyProfileErrorBoundary>
  );
};

export default CompanyProfile;

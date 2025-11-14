# United Traders CRM - Project Documentation

## 📋 Project Overview

**United Traders CRM** is a comprehensive Customer Relationship Management system built with React.js, designed to manage members, events, billing, inventory, and business operations for United Traders organization.

## 🚀 Technology Stack

- **Frontend Framework**: React 18.3.1 with Vite
- **State Management**: Redux Toolkit with Redux Persist
- **Routing**: React Router DOM
- **UI Components**: Ant Design
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Data Fetching**: TanStack React Query
- **PDF Generation**: jsPDF, html2pdf.js
- **Excel Export**: ExcelJS
- **QR Code Scanning**: @yudiel/react-qr-scanner
- **Image Processing**: react-easy-crop
- **Icons**: Lucide React
- **Utilities**: Day.js, Crypto-JS, FileSaver

## 📁 Project Structure

### Root Configuration Files
```
├── README.md                    # Project documentation
├── package.json                # Dependencies and scripts
├── vite.config.js             # Vite build configuration
├── eslint.config.js           # ESLint configuration
├── index.html                 # Main HTML template
└── test.jsx                   # Test components
```

### Source Code (`/src`)

#### 🎨 Application Entry Points
- `main.jsx` - Application entry point
- `App.jsx` - Root application component
- `App.css` - Global application styles
- `index.css` - Base styles and Tailwind imports

#### 🔧 Core Configuration
- **`/theme`** - Theme provider and styling configuration
- **`/store`** - Redux store configuration
  - `store.js` - Main store setup
  - `/auth` - Authentication state slices
    - `authSlice.js` - User authentication state
    - `companySlice.js` - Company information
    - `versionSlice.js` - Application version tracking

#### 🌐 API Layer
- **`/api`** - HTTP client and API configuration
  - `axios.js` - Axios instance with interceptors
  - `index.js` - API endpoints configuration
  - `usetoken.js` - Token management hooks

#### 🎯 Custom Hooks
- **`/hooks`** - Reusable React hooks
  - `useApiMutation.js` - API mutation hooks
  - `useGetApiMutation.js` - API data fetching hooks
  - `useLogout.js` - Logout functionality
  - `useDebounce.js` - Debounced input handling

#### 🧩 Components Architecture

**Common Components (`/components/common`)**
- `Loader.jsx` - Loading spinner component
- `AvatarCell.jsx` - User avatar display
- `CardHeader.jsx` - Card header component
- `CropImageModal.jsx` - Image cropping functionality
- `HighlightText.jsx` - Text highlighting utility
- `Logo.jsx` - Application logo
- `MaintenancePage.jsx` - Maintenance mode page
- `NotFoundPage.jsx` - 404 error page

**Layout Components**
- `Layout.jsx` - Main application layout
- `ProtectedLayout.jsx` - Authenticated route layout
- `Navbar.jsx` - Top navigation bar
- `Sidebar.jsx` - Side navigation menu
- `AppInitializer.jsx` - App initialization logic
- `VersionCheck.jsx` - Version update checker

**Specialized Components**
- **`/DataTable`** - Reusable data table component
- **`/errorBoundry`** - Error boundary for React error handling
- **`/exportExcel`** - Excel export functionality for various reports
- **`/pdfExport`** - PDF generation utilities
- **`/MemberList`** - Member management components
- **`/user`** - User profile components
- **`/websiteenquiry`** - Website inquiry management

#### 📊 Features Module

**Dashboard (`/features/dashboard`)**
- `dashboard.jsx` - Main dashboard page
- `stats-grid.jsx` - Statistics display grid
- `dashboard-card.jsx` - Dashboard metric cards
- `purchase-orders-table.jsx` - Purchase orders table
- `use-dashboard-data.js` - Dashboard data hooks
- `dashboard-api.js` - Dashboard API services

#### 🗂️ Page Components

**Authentication (`/pages/auth`)**
- `SignIn.jsx` - User login page
- `ForgotPassword.jsx` - Password recovery

**Member Management (`/pages/member`)**
- `LifeMembersPage.jsx` - Life members management
- `CoupleMembersPage.jsx` - Couple members management
- `TrusteMemberPage.jsx` - Trustee members management

**Event Management (`/pages/event`)**
- `EventForm.jsx` - Event creation/editing
- `EventList.jsx` - Events listing
- `EventAttendMember.jsx` - Event attendance tracking

**Event Registration & Tracking**
- **`/eventregister`** - Event registration management
- **`/eventtrack`** - Event tracking with QR codes
- `EventTrackerQR.jsx` - QR code scanning for event check-in

**Billing & Invoicing**
- **`/billing`** - Billing management
- **`/tax-invoice`** - Tax invoice processing
- **`/trade-invoice`** - Trade invoice management
- **`/quotation`** - Quotation generation

**Inventory & Master Data (`/pages/master`)**
- **`/item`** - Product/item management
- **`/party`** - Party/customer management
- **`/mill`** - Mill/supplier management
- **`/shade`** - Shade/color management
- **`/unit`** - Unit of measurement
- **`/delivery`** - Delivery management

**Financial Management**
- **`/purchase`** - Purchase order management
- **`/payment`** - Payment processing

#### 📈 Reporting System

**Comprehensive Reports (`/pages/report`)**
- **`/balance`** - Balance sheet reports
  - `BalanceOrderReport.jsx` - Order balance reporting
  - `BalancePayableReport.jsx` - Accounts payable
  - `BalanceReceivableReport.jsx` - Accounts receivable
- **`/ledger`** - Ledger reporting
  - `party-ledger.jsx` - Party ledger
  - `mill-ledger.jsx` - Mill ledger
- **`/sales`** - Sales reports
- **`/price-rate`** - Price rate analysis

**Report Formats (`/pages/reportformats`)**
- Professional document templates:
  - `TaxInvoice.jsx` - Tax invoice format
  - `TradeInvoice.jsx` - Trade invoice format
  - `Quotation.jsx` - Quotation format
  - Multiple purchase order formats

#### 🔐 User Management
- **`/profile`** - User profile and settings
  - `Profile.jsx` - Profile management
  - `ChangePassword.jsx` - Password change functionality

## 🛠️ Key Features

### 1. **Authentication & Authorization**
- JWT token-based authentication
- Protected routes with `ProtectedLayout`
- Role-based access control
- Automatic token refresh

### 2. **Data Management**
- Centralized state management with Redux
- API caching with React Query
- Optimistic updates for better UX
- Error handling and retry mechanisms

### 3. **Reporting & Export**
- Multi-format reporting (PDF, Excel)
- Real-time data export
- Custom report templates
- Financial statement generation

### 4. **Member Management**
- Complete member lifecycle management
- Membership type classification
- Event registration and tracking
- Payment history and billing

### 5. **Inventory & Sales**
- Product catalog management
- Purchase order processing
- Quotation generation
- Invoice management (Tax & Trade)

### 6. **Event Management**
- Event creation and management
- QR-based attendance tracking
- Registration management
- Attendance reporting

### 7. **Financial Tracking**
- Accounts payable/receivable
- Ledger management
- Balance sheet reporting
- Payment processing

## 🚀 Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## 🎨 Design System

- **UI Library**: Ant Design components
- **Styling**: Tailwind CSS utility classes
- **Icons**: Lucide React icon set
- **Typography**: Poppins font family
- **Responsive**: Mobile-first design approach

## 🔒 Security Features

- Encrypted token storage with Crypto-JS
- Secure API communication
- Input validation and sanitization
- Protected route implementation
- Automatic session management

## 📱 Responsive Design

- Mobile-optimized components
- Responsive data tables
- Adaptive layout system
- Touch-friendly interfaces

This CRM system provides a comprehensive solution for managing United Traders' business operations, member relationships, and financial tracking with modern web technologies and best practices.
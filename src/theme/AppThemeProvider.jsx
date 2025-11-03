// import { ConfigProvider, App as AntdApp } from "antd";

// const AppThemeProvider = ({ children }) => {
//   return (
//     <ConfigProvider
//       theme={{
//         token: {
//           colorPrimary: "#1677ff", // Main blue color
//         },
//         components: {
//           Menu: {
//             itemSelectedBg: "#1677ff", // Blue background when selected
//             itemSelectedColor: "#ffffff", // White text
//             itemHoverBg: "#4096ff", // Lighter blue on hover
//             itemHoverColor: "#ffffff", // White text on hover
//           },
//           Button: {
//             colorPrimary: "#1677ff",
//             colorPrimaryHover: "#4096ff",
//             colorPrimaryActive: "#0958d9",
//           },
//         },
//       }}
//     >
//       <AntdApp>{children}</AntdApp>
//     </ConfigProvider>
//   );
// };

// export default AppThemeProvider;
import { ConfigProvider, App as AntdApp } from "antd";

const AppThemeProvider = ({ children }) => {
  const primaryColor = "#261d54";
  const primaryBg = "#261d54c9"; 

  return (
    <ConfigProvider
      theme={{
        cssVar: true, // 👈 enables CSS variable generation
        token: {
          colorPrimary: primaryColor,
          colorPrimaryBg: primaryBg,
        },
        components: {
          Menu: {
            itemSelectedBg: primaryColor,
            itemSelectedColor: "#ffffff",
          },
          Button: {
            colorPrimary: primaryColor,
            colorPrimaryHover: "#3a2b7a",
            colorPrimaryActive: "#1a1240",
          },
          Table: {
            headerBg: primaryColor,
            headerColor: "#ffffff",
          },
        },
      }}
    >
      {/* custom CSS variable for Tailwind usage */}
      <style>{`
        :root {
          --primary: ${primaryColor};
          --primary-light: ${primaryBg};
        }
      `}</style>

      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
};

export default AppThemeProvider;

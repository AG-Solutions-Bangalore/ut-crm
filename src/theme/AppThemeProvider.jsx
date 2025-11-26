import { ConfigProvider, App as AntdApp } from "antd";

const AppThemeProvider = ({ children }) => {
  const primaryColor = "#261d54";
  const primaryBg = "#261d54c9"; 

  return (
    <ConfigProvider
      theme={{
        cssVar: true, 
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

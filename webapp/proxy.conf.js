const PROXY_CONFIG = [
    {
      context: [
        "/queries",
      ],
      target: "https://ped.uspto.gov/api",
      secure: true,
      changeOrigin: true,
      timeout: 300000
    }
  ];
  
  module.exports = PROXY_CONFIG;
  
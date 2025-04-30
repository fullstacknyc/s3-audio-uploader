module.exports = {
  async redirects() {
    return [
      {
        source: '/privacy-policy',
        destination: '/components/PrivacyPolicy',
        permanent: true,
      },
    ];
  },
};

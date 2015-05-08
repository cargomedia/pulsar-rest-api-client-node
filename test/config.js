module.exports = {
  single: {
    url: 'http://localhost:10031'
  },
  multiple: {
    url: 'http://localhost:10032',
    auxiliary: {
      'alice/production': {
        url: 'http://localhost:10033'
      },
      'alice/staging': {
        url: 'http://localhost:10034'
      },
      'bob/': {
        url: 'http://localhost:10034'
      }
    }
  }
};

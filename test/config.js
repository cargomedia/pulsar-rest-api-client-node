module.exports = {
  single: {
    url: 'http://localhost:10031'
  },
  multiple: {
    url: 'http://localhost:100032',
    auxiliary: {
      'alice/production': {
        url: 'http://localhost:100033'
      },
      'alice/staging': {
        url: 'http://localhost:100034'
      },
      'bob/': {
        url: 'http://localhost:100034'
      }
    }
  }
};

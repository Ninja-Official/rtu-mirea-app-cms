module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'dda2b01e33cb0778280fc728b5d4c2a3'),
  },
});

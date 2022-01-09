module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: 'AKIASUPIR666T2TH3S3Q',
        secretAccessKey: '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',
        region: 'eu-west-2',
        params: {
          Bucket: 'mirea-strapi',
        },
      },
    },
  },
});

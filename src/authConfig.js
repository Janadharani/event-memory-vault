
const cognitoAuthConfig = {
  authority:
    "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_a0rzMWlan",

  client_id: "25tv9fopn1j00jb11hsf73oiha",

  redirect_uri: "http://localhost:5173/",

  response_type: "code",

  scope: "openid email",
};

export default cognitoAuthConfig;

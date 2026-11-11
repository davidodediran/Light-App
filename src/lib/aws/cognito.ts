import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider'

export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
})

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!
const CLIENT_ID    = process.env.COGNITO_CLIENT_ID!

export async function signIn(email: string, password: string) {
  const cmd = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: email, PASSWORD: password },
  })
  return cognitoClient.send(cmd)
}

export async function getUserFromToken(accessToken: string) {
  const cmd = new GetUserCommand({ AccessToken: accessToken })
  return cognitoClient.send(cmd)
}

export async function adminGetUser(email: string) {
  const cmd = new AdminGetUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
  })
  return cognitoClient.send(cmd)
}

export async function adminCreateUser(
  email: string,
  temporaryPassword: string,
  attributes: { Name: string; Value: string }[]
) {
  const cmd = new AdminCreateUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
    TemporaryPassword: temporaryPassword,
    UserAttributes: attributes,
    MessageAction: 'SUPPRESS',
  })
  return cognitoClient.send(cmd)
}

export async function adminSetPassword(email: string, password: string) {
  const cmd = new AdminSetUserPasswordCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
    Password: password,
    Permanent: true,
  })
  return cognitoClient.send(cmd)
}

export function extractUserAttributes(attrs: { Name: string; Value?: string }[]) {
  return Object.fromEntries(attrs.map(a => [a.Name, a.Value ?? '']))
}

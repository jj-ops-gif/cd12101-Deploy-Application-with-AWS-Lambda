import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJTCCIhGesLGOqMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1yeTE2NzJqbmhrbG1renYxLnVzLmF1dGgwLmNvbTAeFw0yMzEyMDUw
MjU5MTJaFw0zNzA4MTMwMjU5MTJaMCwxKjAoBgNVBAMTIWRldi1yeTE2NzJqbmhr
bG1renYxLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBALnbhL9Wckt3mXpboIWw5ixDrsgbyxqv65G5Hn5B5+yuFkbAS4363TJggWon
PZAU+Fw5NjgDBwV9f3w9bgpK0ntjN5NmM9N92+9Zj4KbwhMtqXSc7N+YKAAzEabj
InMJBL9QrUI5Poj3kvzAsYMbJz8vqqDADAiPJl7Ge98jl7tD++D3EegHzisyILe4
Uxqzm5RQMh09RpPYPh//LxQ79ezTFjAmeTJi58tVYvQGoUuptiuwC+VD47btqAV9
2oQUpJWZ7nil/PNHilufOfcw4oAWyA7CBf/GAVhKll2PdwXAXwA2fjTr8bM1Az2r
Uh78S37/Y/6BDmgXaas9P9pgWt0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUn2dVL6YRCVIwkgC/UIHX05fpMYswDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBL/V0/T/SgJG89OQYVrnc5sMEUVeqLBStp6FynYRQm
G0CE4pBqOdaN2pGA1S8nXlXa7iRpdYQqoSJa5xhiUF6T/BVfmj4xZhVDqUqGz7CZ
n7fgdikVfpo0S4EgtynhczH45Nl+8wvuWTPrqZLeAIHZuAmXPQFqG+DnfQxfpolq
cEPG0RHMditeKfwWNCo/n7HriwYzQoRgd9HbbdAqB+IEy2597b7iKuaL8fk2047e
e8PP2JAVjrK9IvpA9VTHtdjTGkHJPaDxVqoqPfKt/YyeHgzcqcdkK1OrKh/REED+
jd1ZPdH7j0uGJLbt9rmbcc4RA/YWsfo4atcCnKB9rFVW
-----END CERTIFICATE-----`

const logger = createLogger('auth0Authorizer')

const jwksUrl = 'https://dev-ry1672jnhklmkzv1.us.auth0.com/.well-known/jwks.json'

export async function handler(event, context) {
  const requestId = context.awsRequestId;
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { requestId, error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  //const jwt = jsonwebtoken.decode(token, { complete: true })
  // TODO: Implement token verification
  return jsonwebtoken.verify(token, certificate, { algorithms: ['RS256'] })
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

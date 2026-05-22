import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

// eslint-disable-next-line @n8n/community-nodes/credential-test-required
export class LdxHubDynamicApi implements ICredentialType {
	name = 'ldxHubDynamicApi';

	displayName = 'LDXhub Dynamic API';

	icon: Icon = 'file:ldxhub.svg';

	documentationUrl = 'https://gw.portal.ldxhub.io/introduction';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://gw.ldxhub.io',
			placeholder: 'https://gw.ldxhub.io',
			description: 'LDX hub API base URL (e.g., https://gw.ldxhub.io)',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'API Key for per-execution authentication. Use expressions to resolve at runtime (e.g., {{ $json.api_key }}). No connection test on save.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.apiKey}}',
			},
		},
	};
}

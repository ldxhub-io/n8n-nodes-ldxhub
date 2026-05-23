import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

// eslint-disable-next-line @n8n/community-nodes/credential-test-required
export class LdxHubApi implements ICredentialType {
	name = 'ldxHubApi';

	displayName = 'LDXhub API';

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
			description: 'Your LDX hub API key. Supports expressions for per-execution keys (e.g., {{ $json.api_key }}). Get a free key at https://gw.portal.ldxhub.io.',
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

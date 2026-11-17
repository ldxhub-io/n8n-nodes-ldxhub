import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class LdxHubApi implements ICredentialType {
	name = 'ldxHubApi';

	displayName = 'LDXhub API';

	icon: Icon = { light: 'file:ldxhub.svg', dark: 'file:ldxhub.dark.svg' };

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

	// Lists the uploaded files: a free, read-only call that needs the API key (the models and
	// engines lists do not, so they cannot tell a wrong key). An empty Base URL falls back to the
	// default, as in the node.
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.baseUrl || "https://gw.ldxhub.io"}}',
			url: '/files',
			method: 'GET',
		},
	};
}

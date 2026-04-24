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

	icon: Icon = 'file:ldxhub.svg';

	documentationUrl = 'https://gw.portal.ldxhub.io/introduction';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://gw.ldxhub.io',
			placeholder: 'https://gw.ldxhub.io',
			description:
				'LDX hub API base URL. Use the production URL for normal use. For development/testing, use the dev environment URL. Trailing slashes are trimmed automatically.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Issued from the LDXhub console',
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

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/refineloop/models',
			method: 'GET',
		},
	};
}

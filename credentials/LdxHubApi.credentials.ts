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
			baseURL: 'https://gw.ldxhub.io',
			url: '/refineloop/models',
			method: 'GET',
		},
	};
}

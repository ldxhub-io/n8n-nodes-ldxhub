import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

export const DEFAULT_LDX_HUB_BASE_URL = 'https://gw.ldxhub.io';

async function getAuthenticationMode(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
): Promise<string> {
	try {
		return this.getNodeParameter('authentication', 0, 'apiKey') as string;
	} catch {
		return 'apiKey';
	}
}

function getCredentialNameForMode(authentication: string): string {
	return authentication === 'apiKeyDynamic' ? 'ldxHubDynamicApi' : 'ldxHubApi';
}

function isPublicEndpoint(endpoint: string): boolean {
	return /\/(models|engines)$/.test(endpoint);
}

export async function getBaseUrl(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
): Promise<string> {
	const authentication = await getAuthenticationMode.call(this);
	const credentialName = getCredentialNameForMode(authentication);
	const credentials = await this.getCredentials(credentialName);
	const raw = (credentials.baseUrl as string | undefined) ?? DEFAULT_LDX_HUB_BASE_URL;
	const trimmed = raw.trim().replace(/\/+$/, '');
	return trimmed.length > 0 ? trimmed : DEFAULT_LDX_HUB_BASE_URL;
}

export async function ldxHubApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | undefined = undefined,
	qs: IDataObject = {},
) {
	const authentication = await getAuthenticationMode.call(this);

	// Public metadata endpoints (models, engines) require no auth.
	// In dynamic mode, bypass credential entirely (including getBaseUrl) to avoid
	// expression evaluation errors in load-options contexts where workflow data
	// is not yet available.
	if (authentication === 'apiKeyDynamic' && isPublicEndpoint(endpoint)) {
		const options: IHttpRequestOptions = {
			method,
			url: `${DEFAULT_LDX_HUB_BASE_URL}${endpoint}`,
			qs,
			body,
			json: true,
		};
		return this.helpers.httpRequest(options);
	}

	const baseUrl = await getBaseUrl.call(this);
	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${endpoint}`,
		qs,
		body,
		json: true,
	};

	const credentialName = getCredentialNameForMode(authentication);
	return this.helpers.httpRequestWithAuthentication.call(this, credentialName, options);
}

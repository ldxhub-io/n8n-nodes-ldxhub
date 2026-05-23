import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

export const DEFAULT_LDX_HUB_BASE_URL = 'https://gw.ldxhub.io';

function isPublicEndpoint(endpoint: string): boolean {
	return /\/(models|engines)$/.test(endpoint);
}

export async function getBaseUrl(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
): Promise<string> {
	const credentials = await this.getCredentials('ldxHubApi');
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
	if (isPublicEndpoint(endpoint)) {
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
	return this.helpers.httpRequestWithAuthentication.call(this, 'ldxHubApi', options);
}

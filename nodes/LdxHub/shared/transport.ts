import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

export const LDX_HUB_BASE_URL = 'https://gw.ldxhub.io';

export async function ldxHubApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | undefined = undefined,
	qs: IDataObject = {},
) {
	const options: IHttpRequestOptions = {
		method,
		url: `${LDX_HUB_BASE_URL}${endpoint}`,
		qs,
		body,
		json: true,
	};

	return this.helpers.httpRequestWithAuthentication.call(this, 'ldxHubApi', options);
}

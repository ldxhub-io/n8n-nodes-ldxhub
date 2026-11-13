import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

import { version } from '../../../package.json';

export const DEFAULT_LDX_HUB_BASE_URL = 'https://gw.ldxhub.io';

/**
 * Names this node to LDXhub (X-LDXhub-Client), so jobs can be counted by the client that
 * created them. Only the package name and version are sent.
 */
export const LDX_HUB_CLIENT = `n8n-nodes-ldxhub/${version}`;

export function withClientHeader(options: IHttpRequestOptions): IHttpRequestOptions {
	return {
		...options,
		headers: { ...(options.headers ?? {}), 'X-LDXhub-Client': LDX_HUB_CLIENT },
	};
}

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

async function getBaseUrlOrDefault(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
): Promise<string> {
	try {
		return await getBaseUrl.call(this);
	} catch {
		// No credential selected yet
		return DEFAULT_LDX_HUB_BASE_URL;
	}
}

export async function ldxHubApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | undefined = undefined,
	qs: IDataObject = {},
) {
	if (isPublicEndpoint(endpoint)) {
		// The models and engines lists need no API key, so they also load before a credential is
		// chosen; but they must come from the same gateway as the jobs (the credential's Base URL).
		const options: IHttpRequestOptions = {
			method,
			url: `${await getBaseUrlOrDefault.call(this)}${endpoint}`,
			qs,
			body,
			json: true,
		};
		return this.helpers.httpRequest(withClientHeader(options));
	}

	const baseUrl = await getBaseUrl.call(this);
	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${endpoint}`,
		qs,
		body,
		json: true,
	};
	return this.helpers.httpRequestWithAuthentication.call(this, 'ldxHubApi', withClientHeader(options));
}

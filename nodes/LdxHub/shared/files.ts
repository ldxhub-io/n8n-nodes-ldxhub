import type { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { LDX_HUB_BASE_URL } from './transport';

export type UploadResponse = {
	file_id: string;
	filename: string;
	size: number;
	created_at: string;
	updated_at: string;
	expires_at: string;
};

export type DownloadResult = {
	buffer: Buffer;
	mimeType: string;
	filename?: string;
};

export async function uploadFile(
	this: IExecuteFunctions,
	buffer: Buffer,
	filename: string,
	mimeType: string,
): Promise<UploadResponse> {
	const formData = new FormData();
	formData.append('file', new Blob([buffer], { type: mimeType }), filename);

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${LDX_HUB_BASE_URL}/files`,
		body: formData,
	};

	return (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'ldxHubApi',
		options,
	)) as UploadResponse;
}

export async function downloadFile(
	this: IExecuteFunctions,
	fileId: string,
): Promise<DownloadResult> {
	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `${LDX_HUB_BASE_URL}/files/${encodeURIComponent(fileId)}/content`,
		encoding: 'arraybuffer',
		returnFullResponse: true,
	};

	let response;
	try {
		response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'ldxHubApi',
			options,
		);
	} catch (error) {
		const httpCode = (error as { httpCode?: string | number }).httpCode;
		if (httpCode === 404 || httpCode === '404') {
			throw new NodeOperationError(
				this.getNode(),
				'Output file not found. The file may have expired.',
			);
		}
		throw error;
	}

	const body = response.body as Buffer | ArrayBuffer;
	const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body as ArrayBuffer);

	const headers = response.headers as Record<string, string | string[] | undefined>;
	const contentTypeHeader = headers['content-type'];
	const contentType =
		typeof contentTypeHeader === 'string'
			? contentTypeHeader.split(';')[0].trim()
			: 'application/octet-stream';

	const dispositionHeader = headers['content-disposition'];
	const disposition =
		typeof dispositionHeader === 'string' ? dispositionHeader : undefined;

	return {
		buffer,
		mimeType: contentType,
		filename: parseContentDisposition(disposition),
	};
}

export function parseContentDisposition(header: string | undefined): string | undefined {
	if (!header) return undefined;

	const rfc5987Match = /filename\*=UTF-8''([^;]+)/i.exec(header);
	if (rfc5987Match) {
		try {
			return decodeURIComponent(rfc5987Match[1].trim());
		} catch {
			return undefined;
		}
	}

	const plainMatch = /filename="?([^";]+)"?/i.exec(header);
	if (plainMatch) {
		return plainMatch[1].trim();
	}

	return undefined;
}
